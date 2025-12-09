from fastapi import APIRouter, HTTPException
from app.models.schemas import HealthCheckResponse
from app.db.graphdb import graphdb_client
from app.db.mongodb import mongodb_client
from app.core.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint."""
    graphdb_ok = await graphdb_client.test_connection()
    mongodb_ok = await mongodb_client.test_connection()

    return HealthCheckResponse(
        status="healthy" if (graphdb_ok and mongodb_ok) else "degraded",
        version=settings.APP_VERSION,
        graphdb_connected=graphdb_ok,
        mongodb_connected=mongodb_ok
    )
