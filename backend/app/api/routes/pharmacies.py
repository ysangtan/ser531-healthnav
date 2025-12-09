from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.models.schemas import Pharmacy, PharmacySearchRequest
from app.db.mongodb import mongodb_client
from app.services.geo import calculate_distances, filter_by_radius
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/search", response_model=List[Pharmacy])
async def search_pharmacies(request: PharmacySearchRequest):
    """Search for pharmacies near a location."""
    try:
        pharmacies = await mongodb_client.get_cached_pharmacies()

        # Calculate distances
        pharmacies = calculate_distances(
            pharmacies,
            request.lat,
            request.lng
        )

        # Filter by radius
        pharmacies = filter_by_radius(pharmacies, request.radius)

        # Sort by distance
        pharmacies.sort(key=lambda x: x.get("distance", float('inf')))

        # Limit results
        pharmacies = pharmacies[:request.limit]

        return [Pharmacy(**p) for p in pharmacies]
    except Exception as e:
        logger.error(f"Error searching pharmacies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=List[Pharmacy])
async def get_pharmacies(
    lat: float = Query(...),
    lng: float = Query(...),
    radius: float = Query(10, ge=1, le=50),
    limit: int = Query(20, ge=1, le=100)
):
    """Get pharmacies near a location (GET method)."""
    request = PharmacySearchRequest(
        lat=lat,
        lng=lng,
        radius=radius,
        limit=limit
    )
    return await search_pharmacies(request)
