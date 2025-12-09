import math
from typing import Tuple, List, Dict, Any
from app.core.config import settings


def haversine_distance(
    lat1: float,
    lng1: float,
    lat2: float,
    lng2: float
) -> float:
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees).
    Returns distance in miles.
    """
    # Convert decimal degrees to radians
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])

    # Haversine formula
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))

    # Radius of earth in miles
    r = 3956

    return round(c * r, 2)


def calculate_distances(
    items: List[Dict[str, Any]],
    user_lat: float,
    user_lng: float
) -> List[Dict[str, Any]]:
    """
    Calculate distances for a list of items with lat/lng coordinates.
    Adds 'distance' field to each item.
    """
    for item in items:
        if "lat" in item and "lng" in item:
            item["distance"] = haversine_distance(
                user_lat, user_lng,
                float(item["lat"]), float(item["lng"])
            )
        else:
            item["distance"] = None

    return items


def filter_by_radius(
    items: List[Dict[str, Any]],
    radius: float
) -> List[Dict[str, Any]]:
    """
    Filter items by radius.
    Assumes items have 'distance' field.
    """
    return [
        item for item in items
        if item.get("distance") is not None and item["distance"] <= radius
    ]


def rank_providers(
    providers: List[Dict[str, Any]],
    weight_hcahps: float = 0.6,
    weight_distance: float = 0.4
) -> List[Dict[str, Any]]:
    """
    Rank providers based on HCAHPS score and distance.
    Higher score is better.
    """
    # Normalize scores
    if not providers:
        return providers

    max_distance = max(
        (p.get("distance", 0) for p in providers if p.get("distance")),
        default=1
    )

    for provider in providers:
        hcahps = provider.get("hcahpsScore", 0)
        distance = provider.get("distance", 0)

        # Normalize HCAHPS (already 0-100)
        normalized_hcahps = hcahps / 100

        # Normalize distance (inverse - closer is better)
        normalized_distance = 1 - (distance / max_distance) if max_distance > 0 else 1

        # Calculate weighted score
        provider["score"] = (
            weight_hcahps * normalized_hcahps +
            weight_distance * normalized_distance
        )

    # Sort by score descending
    providers.sort(key=lambda x: x.get("score", 0), reverse=True)

    return providers
