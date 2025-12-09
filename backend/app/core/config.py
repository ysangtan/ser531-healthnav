from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import json


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

    # Application
    APP_NAME: str = "Healthcare Navigator API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # API
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    # GraphDB
    GRAPHDB_URL: str = "http://localhost:7200"
    GRAPHDB_REPOSITORY: str = "healthnav"
    GRAPHDB_USERNAME: str = ""
    GRAPHDB_PASSWORD: str = ""

    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "healthnav"
    MONGODB_MIN_POOL_SIZE: int = 10
    MONGODB_MAX_POOL_SIZE: int = 50

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Data Configuration
    DEFAULT_RADIUS_MILES: float = 25.0
    MAX_RADIUS_MILES: float = 100.0
    DEFAULT_LAT: float = 40.7589
    DEFAULT_LNG: float = -73.9851

    # Feature Flags
    ENABLE_CACHING: bool = True
    CACHE_TTL_SECONDS: int = 300

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from JSON string."""
        try:
            return json.loads(self.CORS_ORIGINS)
        except:
            return ["http://localhost:5173"]


settings = Settings()
