from typing import List, Dict, Any, Optional
import logging
import hashlib
import json
from app.db.graphdb import graphdb_client
from app.db.mongodb import mongodb_client
from app.services.geo import calculate_distances, filter_by_radius, rank_providers
from app.models.schemas import (
    SymptomSearchRequest,
    SearchFilters,
    Provider,
    MedicalCondition,
    Precaution
)
from app.core.config import settings

logger = logging.getLogger(__name__)


def generate_cache_key(data: Dict[str, Any]) -> str:
    """Generate a cache key from search parameters."""
    json_str = json.dumps(data, sort_keys=True)
    return hashlib.md5(json_str.encode()).hexdigest()


async def search_by_symptom(
    request: SymptomSearchRequest
) -> Dict[str, Any]:
    """
    Search for providers, conditions, and precautions by symptom.

    Data Flow (as per PDF specification):
    1. Check MongoDB cache first
    2. If cache miss → Query GraphDB via SPARQL (source of truth)
    3. Process SPARQL results
    4. Calculate distances and rank
    5. Store in MongoDB cache
    6. Return results
    """
    # Generate cache key
    cache_key = generate_cache_key({
        "type": "symptom_search",
        "symptom": request.symptom,
        "lat": request.lat,
        "lng": request.lng,
        "radius": request.radius,
        "minHcahps": request.minHcahps,
        "limit": request.limit
    })

    # Step 1: Check MongoDB cache FIRST
    if settings.ENABLE_CACHING:
        cached_result = await mongodb_client.get_cached_search_result(cache_key)
        if cached_result:
            logger.info(f"✓ Cache HIT for symptom: {request.symptom}")
            return cached_result

    # Step 2: Cache MISS → Query GraphDB (source of truth)
    logger.info(f"✗ Cache MISS - Querying GraphDB for symptom: {request.symptom}")
    results = await graphdb_client.search_by_symptom(
        request.symptom,
        limit=request.limit
    )
    logger.info(f"GraphDB returned {len(results.get('providers', []))} results")

    # Process conditions and precautions
    conditions_map = {}
    precautions_map = {}

    for row in results.get("symptoms", []):
        # Extract conditions
        if "conditionId" in row and "conditionName" in row:
            cond_id = row["conditionId"]["value"]
            conditions_map[cond_id] = {
                "id": cond_id,
                "name": row["conditionName"]["value"],
                "symptoms": [row.get("symptomName", {}).get("value", "")],
                "relatedSpecialties": []
            }

        # Extract precautions
        if "precautionId" in row and "precautionName" in row:
            prec_id = row["precautionId"]["value"]
            precautions_map[prec_id] = {
                "id": prec_id,
                "name": prec_id,
                "description": row["precautionName"]["value"],
                "severity": "warning"
            }

    # Process providers
    providers_map = {}

    for row in results.get("providers", []):
        if "physicianId" not in row:
            continue

        physician_id = row["physicianId"]["value"]

        if physician_id not in providers_map:
            # Create new provider
            provider = {
                "id": physician_id,
                "npi": row.get("npi", {}).get("value", ""),
                "name": row.get("physicianName", {}).get("value", ""),
                "firstName": row.get("physicianName", {}).get("value", "").split()[0] if row.get("physicianName") else "",
                "lastName": " ".join(row.get("physicianName", {}).get("value", "").split()[1:]) if row.get("physicianName") else "",
                "specialties": [],
                "conditions": [],
                "symptoms": [request.symptom],
                "hospitalId": row.get("hospitalId", {}).get("value"),
                "hospitalName": row.get("hospitalName", {}).get("value", ""),
                "hcahpsScore": float(row.get("hcahpsScore", {}).get("value", 0)) if row.get("hcahpsScore") else None,
                "lat": float(row.get("lat", {}).get("value", settings.DEFAULT_LAT)) if row.get("lat") else settings.DEFAULT_LAT,
                "lng": float(row.get("lng", {}).get("value", settings.DEFAULT_LNG)) if row.get("lng") else settings.DEFAULT_LNG,
                "phone": row.get("phone", {}).get("value"),
                "address": row.get("address", {}).get("value"),
                "distance": None
            }
            providers_map[physician_id] = provider

        # Add specialty if present
        if "specialtyName" in row and row["specialtyName"].get("value"):
            specialty = row["specialtyName"]["value"]
            if specialty not in providers_map[physician_id]["specialties"]:
                providers_map[physician_id]["specialties"].append(specialty)

        # Add condition if present
        if "conditionName" in row and row["conditionName"].get("value"):
            condition = row["conditionName"]["value"]
            if condition not in providers_map[physician_id]["conditions"]:
                providers_map[physician_id]["conditions"].append(condition)

    # Convert to lists
    providers_list = list(providers_map.values())

    # Calculate distances if user location provided
    if request.lat is not None and request.lng is not None:
        providers_list = calculate_distances(
            providers_list,
            request.lat,
            request.lng
        )

        # Filter by radius
        providers_list = filter_by_radius(providers_list, request.radius)

    # Filter by minimum HCAHPS score
    if request.minHcahps > 0:
        providers_list = [
            p for p in providers_list
            if p.get("hcahpsScore") and p["hcahpsScore"] >= request.minHcahps
        ]

    # Rank providers
    if request.lat is not None and request.lng is not None:
        providers_list = rank_providers(providers_list)

    # Prepare response
    response = {
        "symptom": request.symptom,
        "matchedConditions": list(conditions_map.values()),
        "precautions": list(precautions_map.values()),
        "providers": providers_list[:request.limit],
        "totalResults": len(providers_list)
    }

    # Step 5: Cache result in MongoDB for next time
    if settings.ENABLE_CACHING:
        await mongodb_client.cache_search_result(cache_key, response)
        logger.info(f"✓ Cached result for symptom: {request.symptom}")

    return response


async def search_providers(
    filters: SearchFilters
) -> Dict[str, Any]:
    """
    Search providers with filters.
    """
    # If symptom is provided, use symptom search
    if filters.symptom:
        symptom_request = SymptomSearchRequest(
            symptom=filters.symptom,
            lat=filters.lat,
            lng=filters.lng,
            radius=filters.radius,
            minHcahps=filters.minHcahps,
            limit=filters.limit
        )
        symptom_response = await search_by_symptom(symptom_request)

        return {
            "providers": symptom_response["providers"],
            "totalResults": symptom_response["totalResults"],
            "filters": filters.model_dump()
        }

    # Otherwise, get all providers from cache
    providers = await mongodb_client.get_cached_providers()

    # Calculate distances if location provided
    if filters.lat is not None and filters.lng is not None:
        providers = calculate_distances(
            providers,
            filters.lat,
            filters.lng
        )
        providers = filter_by_radius(providers, filters.radius)

    # Filter by specialties
    if filters.specialties:
        providers = [
            p for p in providers
            if any(s in p.get("specialties", []) for s in filters.specialties)
        ]

    # Filter by HCAHPS
    if filters.minHcahps > 0:
        providers = [
            p for p in providers
            if p.get("hcahpsScore") and p["hcahpsScore"] >= filters.minHcahps
        ]

    # Rank providers
    if filters.lat is not None and filters.lng is not None:
        providers = rank_providers(providers)

    return {
        "providers": providers[:filters.limit],
        "totalResults": len(providers),
        "filters": filters.model_dump()
    }
