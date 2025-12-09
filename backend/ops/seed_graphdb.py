"""
Seed GraphDB with ontology and TTL data files.
This is the PRIMARY data source - MongoDB is cache only!
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import requests
from pathlib import Path
from typing import List
from app.core.config import settings


class GraphDBSeeder:
    """Seed GraphDB repository with RDF data."""

    def __init__(self):
        self.base_url = settings.GRAPHDB_URL
        self.repository = settings.GRAPHDB_REPOSITORY
        self.repository_url = f"{self.base_url}/repositories/{self.repository}"

        # Authentication if needed
        self.auth = None
        if settings.GRAPHDB_USERNAME and settings.GRAPHDB_PASSWORD:
            self.auth = (settings.GRAPHDB_USERNAME, settings.GRAPHDB_PASSWORD)

    def test_connection(self) -> bool:
        """Test connection to GraphDB."""
        try:
            response = requests.get(f"{self.base_url}/rest/repositories", auth=self.auth)
            return response.status_code == 200
        except Exception as e:
            print(f"✗ GraphDB connection failed: {e}")
            return False

    def repository_exists(self) -> bool:
        """Check if repository exists."""
        try:
            response = requests.get(f"{self.base_url}/rest/repositories", auth=self.auth)
            if response.status_code == 200:
                repos = response.json()
                return any(r['id'] == self.repository for r in repos)
            return False
        except:
            return False

    def create_repository(self):
        """Create GraphDB repository if it doesn't exist."""
        if self.repository_exists():
            print(f"✓ Repository '{self.repository}' already exists")
            return

        print(f"Creating repository '{self.repository}'...")

        # Repository config
        config = f"""
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix rep: <http://www.openrdf.org/config/repository#>.
@prefix sr: <http://www.openrdf.org/config/repository/sail#>.
@prefix sail: <http://www.openrdf.org/config/sail#>.
@prefix owlim: <http://www.ontotext.com/trree/owlim#>.

[] a rep:Repository ;
    rep:repositoryID "{self.repository}" ;
    rdfs:label "Healthcare Navigator Repository" ;
    rep:repositoryImpl [
        rep:repositoryType "graphdb:FreeSailRepository" ;
        sr:sailImpl [
            sail:sailType "graphdb:FreeSail" ;
            owlim:ruleset "rdfsplus-optimized" ;
            owlim:storage-folder "storage" ;
            owlim:enable-context-index "true" ;
            owlim:enablePredicateList "true" ;
            owlim:in-memory-literal-properties "true" ;
            owlim:enable-literal-index "true" ;
        ]
    ].
"""

        try:
            response = requests.post(
                f"{self.base_url}/rest/repositories",
                headers={'Content-Type': 'text/turtle'},
                data=config,
                auth=self.auth
            )

            if response.status_code in [200, 201]:
                print(f"✓ Repository '{self.repository}' created successfully")
            else:
                print(f"✗ Failed to create repository: {response.text}")

        except Exception as e:
            print(f"✗ Error creating repository: {e}")

    def clear_repository(self):
        """Clear all data from repository."""
        print(f"Clearing repository '{self.repository}'...")

        try:
            response = requests.delete(
                f"{self.repository_url}/statements",
                auth=self.auth
            )

            if response.status_code in [200, 204]:
                print("✓ Repository cleared")
            else:
                print(f"Warning: Could not clear repository: {response.text}")

        except Exception as e:
            print(f"Warning: Error clearing repository: {e}")

    def load_ttl_file(self, file_path: Path) -> bool:
        """Load a TTL file into GraphDB."""
        if not file_path.exists():
            print(f"✗ File not found: {file_path}")
            return False

        print(f"Loading {file_path.name}...", end=" ")

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = f.read()

            response = requests.post(
                f"{self.repository_url}/statements",
                headers={'Content-Type': 'text/turtle'},
                data=data.encode('utf-8'),
                auth=self.auth
            )

            if response.status_code in [200, 204]:
                print("✓")
                return True
            else:
                print(f"✗ ({response.status_code})")
                print(f"  Error: {response.text}")
                return False

        except Exception as e:
            print(f"✗ Error: {e}")
            return False

    def count_triples(self) -> int:
        """Count total triples in repository."""
        query = "SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }"

        try:
            response = requests.post(
                f"{self.repository_url}",
                data={'query': query},
                headers={'Accept': 'application/sparql-results+json'},
                auth=self.auth
            )

            if response.status_code == 200:
                results = response.json()
                count = int(results['results']['bindings'][0]['count']['value'])
                return count
            return 0

        except Exception as e:
            print(f"Error counting triples: {e}")
            return 0

    def verify_data(self):
        """Verify loaded data."""
        print("\nVerifying loaded data...")

        queries = {
            "Physicians": "SELECT (COUNT(*) as ?count) WHERE { ?s a <http://example.org/healthnav#Physician> }",
            "Hospitals": "SELECT (COUNT(*) as ?count) WHERE { ?s a <http://example.org/healthnav#Hospital> }",
            "Symptoms": "SELECT (COUNT(*) as ?count) WHERE { ?s a <http://example.org/healthnav#Symptom> }",
            "Conditions": "SELECT (COUNT(*) as ?count) WHERE { ?s a <http://example.org/healthnav#MedicalCondition> }",
            "Pharmacies": "SELECT (COUNT(*) as ?count) WHERE { ?s a <http://example.org/healthnav#Pharmacy> }",
            "Specialties": "SELECT (COUNT(*) as ?count) WHERE { ?s a <http://example.org/healthnav#Specialty> }",
        }

        for entity_type, query in queries.items():
            try:
                response = requests.post(
                    f"{self.repository_url}",
                    data={'query': query},
                    headers={'Accept': 'application/sparql-results+json'},
                    auth=self.auth
                )

                if response.status_code == 200:
                    results = response.json()
                    count = int(results['results']['bindings'][0]['count']['value'])
                    print(f"  - {entity_type}: {count}")

            except Exception as e:
                print(f"  - {entity_type}: Error ({e})")


async def seed_graphdb():
    """Main seeding function."""
    print("=" * 60)
    print("GraphDB Seeding - Healthcare Navigator")
    print("=" * 60)

    seeder = GraphDBSeeder()

    # Step 1: Test connection
    print("\n[1/5] Testing GraphDB connection...")
    if not seeder.test_connection():
        print("\n✗ Cannot connect to GraphDB")
        print(f"  Please ensure GraphDB is running at: {settings.GRAPHDB_URL}")
        print("\n  Quick start:")
        print("    - Download GraphDB: https://www.ontotext.com/products/graphdb/download/")
        print("    - Or use Docker: docker run -p 7200:7200 ontotext/graphdb:10.6.3-free")
        return False

    print("✓ Connected to GraphDB")

    # Step 2: Create repository if needed
    print("\n[2/5] Checking repository...")
    seeder.create_repository()

    # Step 3: Clear existing data
    print("\n[3/5] Clearing existing data...")
    seeder.clear_repository()

    # Step 4: Load TTL files
    print("\n[4/5] Loading RDF data...")

    # Get TTL directory
    ttl_dir = Path(__file__).parent / "ttl_data"

    if not ttl_dir.exists():
        print(f"\n✗ TTL data directory not found: {ttl_dir}")
        print("  Please run: python ops/generate_ttl_data.py")
        return False

    # Load ontology first
    ontology_path = Path(__file__).parent.parent.parent / "HealthcareNavigator_Team4.owl"
    if ontology_path.exists():
        print("\nLoading ontology...")
        seeder.load_ttl_file(ontology_path)
    else:
        print(f"Warning: Ontology not found at {ontology_path}")

    # Load TTL files in order
    ttl_files = [
        "specialties.ttl",
        "conditions_symptoms.ttl",
        "symptoms_precautions.ttl",
        "hospitals.ttl",
        "hospitals_hcahps.ttl",
        "physicians.ttl",
        "pharmacies.ttl",
    ]

    print("\nLoading data files...")
    loaded_count = 0
    for filename in ttl_files:
        filepath = ttl_dir / filename
        if seeder.load_ttl_file(filepath):
            loaded_count += 1

    # Step 5: Verify
    print("\n[5/5] Verification...")
    total_triples = seeder.count_triples()
    print(f"\nTotal triples loaded: {total_triples}")

    seeder.verify_data()

    print("\n" + "=" * 60)
    if loaded_count == len(ttl_files):
        print("✓ GraphDB seeding completed successfully!")
    else:
        print(f"⚠ Partial success: {loaded_count}/{len(ttl_files)} files loaded")

    print("=" * 60)
    print(f"\nGraphDB Workbench: {settings.GRAPHDB_URL}")
    print(f"Repository: {settings.GRAPHDB_REPOSITORY}")
    print("\nYou can now:")
    print("  1. Query the data via SPARQL")
    print("  2. Run the backend API")
    print("  3. Generate MongoDB cache from GraphDB")
    print("=" * 60)

    return loaded_count == len(ttl_files)


if __name__ == "__main__":
    success = asyncio.run(seed_graphdb())
    sys.exit(0 if success else 1)
