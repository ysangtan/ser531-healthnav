from fastapi import APIRouter, HTTPException, Path
from typing import List
from app.models.schemas import Provider
from app.db.mongodb import mongodb_client
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[Provider])
async def get_all_providers():
    """Get all providers."""
    try:
        providers = await mongodb_client.get_cached_providers()
        return [Provider(**p) for p in providers]
    except Exception as e:
        logger.error(f"Error getting providers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{provider_id}", response_model=Provider)
async def get_provider(provider_id: str = Path(..., description="Provider ID")):
    """Get a specific provider by ID."""
    try:
        providers = await mongodb_client.get_cached_providers({"id": provider_id})
        if not providers:
            raise HTTPException(status_code=404, detail="Provider not found")
        return Provider(**providers[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting provider: {e}")
        raise HTTPException(status_code=500, detail=str(e))
