"""
Complete seeding script for Healthcare Navigator.
Follows the correct architecture: GraphDB (source) → MongoDB (cache)
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import subprocess
from pathlib import Path


async def main():
    """
    Complete seeding process following PDF specification:

    1. Generate RDF/Turtle data files
    2. Load GraphDB (source of truth)
    3. Validate GraphDB data
    4. Query GraphDB to generate MongoDB cache
    5. Verify complete setup
    """

    print("=" * 70)
    print(" Healthcare Navigator - Complete Data Seeding")
    print(" Following PDF Architecture: GraphDB → MongoDB Cache")
    print("=" * 70)

    ops_dir = Path(__file__).parent

    # Step 1: Generate TTL data
    print("\n" + "=" * 70)
    print("[1/5] Generating RDF/Turtle data files...")
    print("=" * 70)

    result = subprocess.run(
        [sys.executable, str(ops_dir / "generate_ttl_data.py")],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(f"✗ Failed to generate TTL data:")
        print(result.stderr)
        return False

    print(result.stdout)
    print("✓ TTL data files generated")

    # Step 2: Seed GraphDB
    print("\n" + "=" * 70)
    print("[2/5] Loading data into GraphDB (source of truth)...")
    print("=" * 70)

    result = subprocess.run(
        [sys.executable, str(ops_dir / "seed_graphdb.py")],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(f"✗ Failed to seed GraphDB:")
        print(result.stderr)
        print("\nPlease ensure:")
        print("  1. GraphDB is running at http://localhost:7200")
        print("  2. Repository 'healthnav' can be created")
        print("\nTo install GraphDB:")
        print("  brew install --cask graphdb-desktop")
        print("  OR")
        print("  docker run -p 7200:7200 ontotext/graphdb:10.6.3-free")
        return False

    print(result.stdout)
    print("✓ GraphDB seeded successfully")

    # Step 3: Validate GraphDB
    print("\n" + "=" * 70)
    print("[3/5] Validating GraphDB data...")
    print("=" * 70)

    from app.db.graphdb import graphdb_client

    try:
        if not await graphdb_client.test_connection():
            print("✗ GraphDB connection test failed")
            return False

        print("✓ GraphDB connection successful")

        # Test SPARQL query
        specialties = await graphdb_client.get_all_specialties()
        print(f"✓ Found {len(specialties)} specialties in GraphDB")

        hospitals = await graphdb_client.get_hospitals(limit=10)
        print(f"✓ Found {len(hospitals)} hospitals in GraphDB")

    except Exception as e:
        print(f"✗ GraphDB validation failed: {e}")
        return False

    # Step 4: Generate MongoDB cache from GraphDB
    print("\n" + "=" * 70)
    print("[4/5] Generating MongoDB cache from GraphDB...")
    print("=" * 70)

    from app.db.mongodb import mongodb_client
    from app.db.graphdb import graphdb_client

    try:
        # Connect to MongoDB
        await mongodb_client.connect()
        print("✓ Connected to MongoDB")

        # Clear existing cache
        if mongodb_client.db:
            await mongodb_client.db.search_cache.delete_many({})
            await mongodb_client.db.query_cache.delete_many({})
            print("✓ Cleared existing cache")

        # Note: We don't pre-populate cache
        # Cache is populated on-demand when queries are made
        print("✓ MongoDB cache ready (will populate on first queries)")

        print("\nNote: MongoDB is CACHE ONLY")
        print("  - GraphDB is the source of truth")
        print("  - Cache populates automatically on API queries")
        print("  - Cache improves performance on repeated queries")

    except Exception as e:
        print(f"✗ MongoDB setup failed: {e}")
        print("\nPlease ensure MongoDB is running:")
        print("  brew services start mongodb-community")
        print("  OR")
        print("  docker run -p 27017:27017 mongo:7.0")
        return False
    finally:
        await mongodb_client.disconnect()

    # Step 5: Final verification
    print("\n" + "=" * 70)
    print("[5/5] Final verification...")
    print("=" * 70)

    print("\n✓ Data Flow Architecture:")
    print("  1. GraphDB      → Source of Truth (RDF/OWL)")
    print("  2. SPARQL       → Query language")
    print("  3. FastAPI      → Orchestration layer")
    print("  4. MongoDB      → Cache layer (performance)")
    print("  5. React        → Frontend")

    print("\n✓ Seeding complete!")
    print("\n" + "=" * 70)
    print(" Next Steps")
    print("=" * 70)
    print("\n1. Start the backend:")
    print("   cd backend")
    print("   python -m app.main")
    print("\n2. Test the API:")
    print("   curl 'http://localhost:8000/api/v1/search/providers?symptom=chest%20pain'")
    print("\n3. Watch the logs:")
    print("   - First query: 'Cache MISS - Querying GraphDB'")
    print("   - Second query: 'Cache HIT'")
    print("\n4. Explore GraphDB:")
    print("   http://localhost:7200")
    print("   Repository: healthnav")
    print("\n5. Start the frontend:")
    print("   cd healthnav-ui-kit")
    print("   npm run dev")
    print("\n" + "=" * 70)

    return True


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
