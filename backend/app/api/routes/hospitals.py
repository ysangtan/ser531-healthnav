from fastapi import APIRouter, HTTPException, Path, Query
from typing import List, Optional
from app.models.schemas import Hospital
from app.db.mongodb import mongodb_client
from app.services.geo import calculate_distances, filter_by_radius
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[Hospital])
async def get_all_hospitals(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius: Optional[float] = Query(None, ge=1, le=100)
):
    """
    Get all hospitals.
    Optionally filter by location and radius.
    """
    try:
        hospitals = await mongodb_client.get_cached_hospitals()

        # Filter by location if provided
        if lat is not None and lng is not None:
            hospitals = calculate_distances(hospitals, lat, lng)

            if radius is not None:
                hospitals = filter_by_radius(hospitals, radius)

        return [Hospital(**h) for h in hospitals]
    except Exception as e:
        logger.error(f"Error getting hospitals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{hospital_id}", response_model=Hospital)
async def get_hospital(hospital_id: str = Path(..., description="Hospital ID")):
    """Get a specific hospital by ID."""
    try:
        hospitals = await mongodb_client.get_cached_hospitals()
        hospital = next((h for h in hospitals if h.get("id") == hospital_id), None)

        if not hospital:
            raise HTTPException(status_code=404, detail="Hospital not found")

        return Hospital(**hospital)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting hospital: {e}")
        raise HTTPException(status_code=500, detail=str(e))
