from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class GeoLocation(BaseModel):
    """Geographic location model."""
    lat: float = Field(..., description="Latitude")
    lng: float = Field(..., description="Longitude")


class Address(BaseModel):
    """Address model."""
    addressLine: str
    city: str
    state: str
    postalCode: str
    lat: Optional[float] = None
    lng: Optional[float] = None


class Provider(BaseModel):
    """Provider/Physician model."""
    id: str
    npi: str
    name: str
    firstName: str
    lastName: str
    specialties: List[str]
    hospitalId: Optional[str] = None
    hospitalName: Optional[str] = None
    hcahpsScore: Optional[float] = None
    lat: float
    lng: float
    distance: Optional[float] = None
    conditions: List[str] = []
    symptoms: List[str] = []
    phone: Optional[str] = None
    address: Optional[str] = None


class Hospital(BaseModel):
    """Hospital model."""
    id: str
    cmsId: str
    name: str
    address: str
    city: str
    state: str
    zipCode: str
    hcahpsScore: float
    lat: float
    lng: float
    phone: Optional[str] = None
    about: Optional[str] = None
    affiliatedProviders: int = 0
    bedCount: Optional[int] = None
    emergencyServices: bool = True


class Pharmacy(BaseModel):
    """Pharmacy model."""
    id: str
    name: str
    chain: Optional[str] = None
    address: str
    city: str
    state: str
    zipCode: str
    lat: float
    lng: float
    phone: Optional[str] = None
    hours: Optional[str] = None
    distance: Optional[float] = None
    is24Hour: bool = False


class Symptom(BaseModel):
    """Symptom model."""
    id: str
    name: str
    description: Optional[str] = None


class Precaution(BaseModel):
    """Precaution/Warning model."""
    id: str
    name: str
    description: str
    severity: Optional[str] = "info"


class MedicalCondition(BaseModel):
    """Medical condition model."""
    id: str
    name: str
    description: Optional[str] = None
    symptoms: List[str] = []
    relatedSpecialties: List[str] = []


class SearchFilters(BaseModel):
    """Search filters for provider search."""
    symptom: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    radius: float = Field(default=25, ge=1, le=100)
    specialties: List[str] = []
    minHcahps: float = Field(default=0, ge=0, le=100)
    limit: int = Field(default=50, ge=1, le=200)


class SymptomSearchRequest(BaseModel):
    """Request for symptom-based search."""
    symptom: str = Field(..., min_length=2, description="Symptom to search for")
    lat: Optional[float] = Field(default=None, description="User latitude")
    lng: Optional[float] = Field(default=None, description="User longitude")
    radius: float = Field(default=25, ge=1, le=100, description="Search radius in miles")
    minHcahps: float = Field(default=0, ge=0, le=100, description="Minimum HCAHPS score")
    limit: int = Field(default=50, ge=1, le=200, description="Maximum results to return")


class SymptomSearchResponse(BaseModel):
    """Response for symptom-based search."""
    symptom: str
    matchedConditions: List[MedicalCondition] = []
    precautions: List[Precaution] = []
    providers: List[Provider] = []
    totalResults: int


class ProviderSearchResponse(BaseModel):
    """Response for provider search."""
    providers: List[Provider]
    totalResults: int
    filters: SearchFilters


class PharmacySearchRequest(BaseModel):
    """Request for pharmacy search near a location."""
    lat: float
    lng: float
    radius: float = Field(default=10, ge=1, le=50)
    limit: int = Field(default=20, ge=1, le=100)


class HealthCheckResponse(BaseModel):
    """Health check response."""
    status: str
    version: str
    graphdb_connected: bool
    mongodb_connected: bool
