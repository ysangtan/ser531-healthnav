"""
Simple script to load TTL files directly into GraphDB.
This bypasses the repository creation issues.
"""

import requests
import glob
from pathlib import Path

# GraphDB settings
GRAPHDB_URL = "http://localhost:7200"
REPOSITORY = "healthnav"

# TTL data directory
TTL_DIR = Path(__file__).parent / "ttl_data"

def check_or_create_repository():
    """Check if repository exists, if not, create it"""
    print(f"\n[1/2] Checking repository '{REPOSITORY}'...")

    # Try to check if repository exists
    try:
        response = requests.get(f"{GRAPHDB_URL}/repositories/{REPOSITORY}/size")
        if response.status_code == 200:
            print(f"✓ Repository '{REPOSITORY}' exists")
            return True
    except:
        pass

    print(f"Repository '{REPOSITORY}' not found")
    print(f"\nPlease create repository manually:")
    print(f"1. Open GraphDB Workbench: {GRAPHDB_URL}")
    print(f"2. Go to Setup → Repositories")
    print(f"3. Click 'Create new repository'")
    print(f"4. Set Repository ID to: {REPOSITORY}")
    print(f"5. Click 'Create'")
    print(f"\nThen run this script again.")
    return False

def load_ttl_files():
    """Load all TTL files into GraphDB"""
    print(f"\n[2/2] Loading TTL files...")

    ttl_files = sorted(TTL_DIR.glob("*.ttl"))

    if not ttl_files:
        print(f"✗ No TTL files found in {TTL_DIR}")
        return False

    print(f"Found {len(ttl_files)} TTL files")

    loaded_count = 0
    for ttl_file in ttl_files:
        print(f"\n  Loading: {ttl_file.name}...")

        try:
            with open(ttl_file, 'r', encoding='utf-8') as f:
                ttl_data = f.read()

            # Upload to GraphDB
            response = requests.post(
                f"{GRAPHDB_URL}/repositories/{REPOSITORY}/statements",
                headers={'Content-Type': 'application/x-turtle'},
                data=ttl_data.encode('utf-8')
            )

            if response.status_code in [200, 201, 204]:
                print(f"  ✓ Loaded: {ttl_file.name}")
                loaded_count += 1
            else:
                print(f"  ✗ Failed: {ttl_file.name} - Status: {response.status_code}")
                print(f"    Response: {response.text}")

        except Exception as e:
            print(f"  ✗ Error loading {ttl_file.name}: {e}")

    print(f"\n✓ Loaded {loaded_count}/{len(ttl_files)} files successfully")
    return loaded_count == len(ttl_files)

def main():
    print("="*60)
    print("GraphDB TTL Loader - Healthcare Navigator")
    print("="*60)

    if not check_or_create_repository():
        return

    if load_ttl_files():
        print("\n" + "="*60)
        print("✓ All TTL files loaded successfully!")
        print("="*60)

        # Show triple count
        try:
            response = requests.get(f"{GRAPHDB_URL}/repositories/{REPOSITORY}/size")
            if response.status_code == 200:
                count = response.text.strip()
                print(f"\nTotal triples in repository: {count}")
        except:
            pass
    else:
        print("\n" + "="*60)
        print("✗ Some files failed to load")
        print("="*60)

if __name__ == "__main__":
    main()
