from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional, Dict, Any, List
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class MongoDBClient:
    """Client for interacting with MongoDB."""

    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    async def connect(self):
        """Connect to MongoDB."""
        try:
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
                maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
            )
            self.db = self.client[settings.MONGODB_DB_NAME]

            # Test connection
            await self.client.admin.command('ping')
            logger.info("Connected to MongoDB successfully")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    async def disconnect(self):
        """Disconnect from MongoDB."""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")

    async def test_connection(self) -> bool:
        """Test MongoDB connection."""
        try:
            if not self.client:
                return False
            await self.client.admin.command('ping')
            return True
        except:
            return False

    # Provider Cache Methods
    async def cache_providers(self, providers: List[Dict[str, Any]]):
        """Cache provider data."""
        if self.db is None or not settings.ENABLE_CACHING:
            return

        try:
            collection = self.db.providers_cache
            if providers:
                # Clear old cache
                await collection.delete_many({})
                # Insert new cache
                await collection.insert_many(providers)
                logger.info(f"Cached {len(providers)} providers")
        except Exception as e:
            logger.error(f"Error caching providers: {e}")

    async def get_cached_providers(
        self,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Get cached providers with optional filters."""
        if self.db is None or not settings.ENABLE_CACHING:
            return []

        try:
            collection = self.db.providers_cache
            query = filters or {}
            cursor = collection.find(query)
            return await cursor.to_list(length=None)
        except Exception as e:
            logger.error(f"Error getting cached providers: {e}")
            return []

    # Hospital Cache Methods
    async def cache_hospitals(self, hospitals: List[Dict[str, Any]]):
        """Cache hospital data."""
        if self.db is None or not settings.ENABLE_CACHING:
            return

        try:
            collection = self.db.hospitals_cache
            if hospitals:
                await collection.delete_many({})
                await collection.insert_many(hospitals)
                logger.info(f"Cached {len(hospitals)} hospitals")
        except Exception as e:
            logger.error(f"Error caching hospitals: {e}")

    async def get_cached_hospitals(self) -> List[Dict[str, Any]]:
        """Get cached hospitals."""
        if self.db is None or not settings.ENABLE_CACHING:
            return []

        try:
            collection = self.db.hospitals_cache
            cursor = collection.find({})
            return await cursor.to_list(length=None)
        except Exception as e:
            logger.error(f"Error getting cached hospitals: {e}")
            return []

    # Pharmacy Cache Methods
    async def cache_pharmacies(self, pharmacies: List[Dict[str, Any]]):
        """Cache pharmacy data."""
        if self.db is None or not settings.ENABLE_CACHING:
            return

        try:
            collection = self.db.pharmacies_cache
            if pharmacies:
                await collection.delete_many({})
                await collection.insert_many(pharmacies)
                logger.info(f"Cached {len(pharmacies)} pharmacies")
        except Exception as e:
            logger.error(f"Error caching pharmacies: {e}")

    async def get_cached_pharmacies(self) -> List[Dict[str, Any]]:
        """Get cached pharmacies."""
        if self.db is None or not settings.ENABLE_CACHING:
            return []

        try:
            collection = self.db.pharmacies_cache
            cursor = collection.find({})
            return await cursor.to_list(length=None)
        except Exception as e:
            logger.error(f"Error getting cached pharmacies: {e}")
            return []

    # Query Cache Methods
    async def cache_search_result(
        self,
        cache_key: str,
        result: Dict[str, Any]
    ):
        """Cache a search result with TTL."""
        if self.db is None or not settings.ENABLE_CACHING:
            return

        try:
            collection = self.db.search_cache
            await collection.update_one(
                {"key": cache_key},
                {
                    "$set": {
                        "key": cache_key,
                        "result": result,
                        "timestamp": settings.CACHE_TTL_SECONDS
                    }
                },
                upsert=True
            )
        except Exception as e:
            logger.error(f"Error caching search result: {e}")

    async def get_cached_search_result(
        self,
        cache_key: str
    ) -> Optional[Dict[str, Any]]:
        """Get a cached search result."""
        if self.db is None or not settings.ENABLE_CACHING:
            return None

        try:
            collection = self.db.search_cache
            result = await collection.find_one({"key": cache_key})
            return result.get("result") if result else None
        except Exception as e:
            logger.error(f"Error getting cached search result: {e}")
            return None


# Global MongoDB client instance
mongodb_client = MongoDBClient()
