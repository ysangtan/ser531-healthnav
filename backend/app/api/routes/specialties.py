from fastapi import APIRouter, HTTPException
from typing import List
from app.db.mongodb import mongodb_client
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[str])
async def get_specialties():
    """Get all available medical specialties from MongoDB cache."""
    try:
        specialties = await mongodb_client.get_cached_specialties()
        return sorted(specialties)
    except Exception as e:
        logger.error(f"Error getting specialties: {e}")
        raise HTTPException(status_code=500, detail=str(e))
