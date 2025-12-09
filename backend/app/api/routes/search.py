from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import (
    SymptomSearchRequest,
    SymptomSearchResponse,
    SearchFilters,
    ProviderSearchResponse
)
from app.services.search import search_by_symptom, search_providers
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/symptom", response_model=SymptomSearchResponse)
async def search_by_symptom_endpoint(request: SymptomSearchRequest):
    """
    Search for providers, conditions, and precautions by symptom.

    This endpoint performs a semantic search through the knowledge graph
    to find relevant medical conditions, precautions, and healthcare providers.
    """
    try:
        result = await search_by_symptom(request)
        return SymptomSearchResponse(**result)
    except Exception as e:
        logger.error(f"Error in symptom search: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/providers", response_model=ProviderSearchResponse)
async def search_providers_endpoint(filters: SearchFilters):
    """
    Search for providers with various filters.

    Supports filtering by:
    - Symptom (semantic search through knowledge graph)
    - Location (lat/lng + radius)
    - Specialties
    - Minimum HCAHPS score
    """
    try:
        result = await search_providers(filters)
        return ProviderSearchResponse(**result)
    except Exception as e:
        logger.error(f"Error in provider search: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/providers", response_model=ProviderSearchResponse)
async def search_providers_get(
    symptom: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius: float = Query(25, ge=1, le=100),
    specialties: Optional[List[str]] = Query(None),
    minHcahps: float = Query(0, ge=0, le=100),
    limit: int = Query(50, ge=1, le=200)
):
    """
    Search for providers using GET method.
    Useful for direct URL access and caching.
    """
    filters = SearchFilters(
        symptom=symptom,
        lat=lat,
        lng=lng,
        radius=radius,
        specialties=specialties or [],
        minHcahps=minHcahps,
        limit=limit
    )

    try:
        result = await search_providers(filters)
        return ProviderSearchResponse(**result)
    except Exception as e:
        logger.error(f"Error in provider search: {e}")
        raise HTTPException(status_code=500, detail=str(e))
