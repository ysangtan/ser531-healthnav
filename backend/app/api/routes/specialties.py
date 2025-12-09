from fastapi import APIRouter, HTTPException
from typing import List
from app.db.graphdb import graphdb_client
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[str])
async def get_specialties():
    """Get all available medical specialties."""
    try:
        specialties = await graphdb_client.get_all_specialties()
        return sorted(specialties)
    except Exception as e:
        logger.error(f"Error getting specialties: {e}")
        raise HTTPException(status_code=500, detail=str(e))
