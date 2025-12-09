"""
Seed script for Healthcare Navigator.
Seeds MongoDB cache with sample data.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import json
from pathlib import Path

from app.db.mongodb import mongodb_client
from app.core.config import settings
from generate_sample_data import main as generate_data


async def seed_mongodb():
    """Seed MongoDB with sample data."""
    print("=" * 60)
    print("Healthcare Navigator - Database Seeding")
    print("=" * 60)

    # Connect to MongoDB
    print("\n[1/4] Connecting to MongoDB...")
    try:
        await mongodb_client.connect()
        print("✓ Connected to MongoDB")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        return

    # Generate sample data
    print("\n[2/4] Generating sample data...")
    data = generate_data()
    print(f"✓ Generated:")
    print(f"  - {len(data['hospitals'])} hospitals")
    print(f"  - {len(data['providers'])} providers")
    print(f"  - {len(data['pharmacies'])} pharmacies")
    print(f"  - {len(data['specialties'])} specialties")

    # Seed MongoDB
    print("\n[3/4] Seeding MongoDB...")
    try:
        # Cache hospitals
        await mongodb_client.cache_hospitals(data['hospitals'])
        print(f"✓ Cached {len(data['hospitals'])} hospitals")

        # Cache providers
        await mongodb_client.cache_providers(data['providers'])
        print(f"✓ Cached {len(data['providers'])} providers")

        # Cache pharmacies
        await mongodb_client.cache_pharmacies(data['pharmacies'])
        print(f"✓ Cached {len(data['pharmacies'])} pharmacies")

    except Exception as e:
        print(f"✗ Error seeding MongoDB: {e}")
        return

    # Verify data
    print("\n[4/4] Verifying seeded data...")
    try:
        hospitals = await mongodb_client.get_cached_hospitals()
        providers = await mongodb_client.get_cached_providers()
        pharmacies = await mongodb_client.get_cached_pharmacies()

        print(f"✓ Verified:")
        print(f"  - {len(hospitals)} hospitals in cache")
        print(f"  - {len(providers)} providers in cache")
        print(f"  - {len(pharmacies)} pharmacies in cache")
    except Exception as e:
        print(f"✗ Error verifying data: {e}")
        return

    # Disconnect
    await mongodb_client.disconnect()

    print("\n" + "=" * 60)
    print("✓ Database seeding completed successfully!")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Start the backend: cd backend && python -m app.main")
    print("  2. Visit API docs: http://localhost:8000/docs")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed_mongodb())
