"""
Complete system test for Healthcare Navigator.
Tests all components: GraphDB, MongoDB, Backend APIs, Caching, Knowledge Graph queries.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
import requests
from pathlib import Path
from app.core.config import settings
from app.db.graphdb import graphdb_client
from app.db.mongodb import mongodb_client


class SystemTester:
    """Complete system tester."""

    def __init__(self):
        self.results = {
            "passed": 0,
            "failed": 0,
            "warnings": 0,
            "tests": []
        }

    def log_test(self, test_name: str, passed: bool, message: str = "", warning: bool = False):
        """Log a test result."""
        status = "✓ PASS" if passed else ("⚠ WARN" if warning else "✗ FAIL")
        color_code = "\033[92m" if passed else ("\033[93m" if warning else "\033[91m")
        reset_code = "\033[0m"

        print(f"{color_code}{status}{reset_code} {test_name}")
        if message:
            print(f"      {message}")

        self.results["tests"].append({
            "name": test_name,
            "passed": passed,
            "message": message
        })

        if warning:
            self.results["warnings"] += 1
        elif passed:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1

    async def test_graphdb_connection(self):
        """Test GraphDB connection."""
        print("\n" + "=" * 70)
        print("1. GRAPHDB CONNECTION TESTS")
        print("=" * 70)

        try:
            # Test basic connection
            response = requests.get(f"{settings.GRAPHDB_URL}/rest/repositories", timeout=5)
            self.log_test(
                "GraphDB is running and accessible",
                response.status_code == 200,
                f"URL: {settings.GRAPHDB_URL}"
            )

            # Check if repository exists
            repos = response.json()
            repo_exists = any(r['id'] == settings.GRAPHDB_REPOSITORY for r in repos)
            self.log_test(
                f"Repository '{settings.GRAPHDB_REPOSITORY}' exists",
                repo_exists,
                "Run 'python ops/seed_complete.py' if repository doesn't exist" if not repo_exists else ""
            )

            # Test SPARQL connection
            if repo_exists:
                sparql_ok = await graphdb_client.test_connection()
                self.log_test(
                    "SPARQL endpoint is responding",
                    sparql_ok,
                    f"Endpoint: {graphdb_client.endpoint}"
                )

                # Count triples
                query = "SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }"
                results = await graphdb_client.query(query)
                if results:
                    count = int(results[0]['count']['value'])
                    self.log_test(
                        f"Knowledge graph has data ({count} triples)",
                        count > 0,
                        "Run 'python ops/seed_complete.py' to load data" if count == 0 else f"Total triples: {count}"
                    )

                    # Verify entity counts
                    if count > 0:
                        entities = {
                            "Physicians": "SELECT (COUNT(*) as ?count) WHERE { ?s a <http://example.org/healthnav#Physician> }",
                            "Hospitals": "SELECT (COUNT(*) as ?count) WHERE { ?s a <http://example.org/healthnav#Hospital> }",
                            "Symptoms": "SELECT (COUNT(*) as ?count) WHERE { ?s a <http://example.org/healthnav#Symptom> }",
                            "Conditions": "SELECT (COUNT(*) as ?count) WHERE { ?s a <http://example.org/healthnav#MedicalCondition> }",
                            "Specialties": "SELECT (COUNT(*) as ?count) WHERE { ?s a <http://example.org/healthnav#Specialty> }",
                        }

                        for entity_name, entity_query in entities.items():
                            results = await graphdb_client.query(entity_query)
                            if results:
                                entity_count = int(results[0]['count']['value'])
                                self.log_test(
                                    f"  - {entity_name} loaded",
                                    entity_count > 0,
                                    f"Count: {entity_count}"
                                )

        except requests.exceptions.ConnectionError:
            self.log_test(
                "GraphDB is running and accessible",
                False,
                f"Cannot connect to {settings.GRAPHDB_URL}. Start GraphDB first."
            )
        except Exception as e:
            self.log_test(
                "GraphDB connection",
                False,
                f"Error: {e}"
            )

    async def test_mongodb_connection(self):
        """Test MongoDB connection."""
        print("\n" + "=" * 70)
        print("2. MONGODB CONNECTION TESTS")
        print("=" * 70)

        try:
            await mongodb_client.connect()
            self.log_test(
                "MongoDB is running and accessible",
                True,
                f"URL: {settings.MONGODB_URL}"
            )

            # Test ping
            mongo_ok = await mongodb_client.test_connection()
            self.log_test(
                "MongoDB ping successful",
                mongo_ok,
                f"Database: {settings.MONGODB_DB_NAME}"
            )

            # Check cache collections
            if mongodb_client.db:
                collections = await mongodb_client.db.list_collection_names()
                self.log_test(
                    "MongoDB cache collections accessible",
                    True,
                    f"Collections: {', '.join(collections) if collections else 'None (will be created on first use)'}"
                )

        except Exception as e:
            self.log_test(
                "MongoDB connection",
                False,
                f"Error: {e}. Start MongoDB: brew services start mongodb-community"
            )

    async def test_sparql_queries(self):
        """Test SPARQL semantic queries."""
        print("\n" + "=" * 70)
        print("3. SPARQL SEMANTIC QUERY TESTS")
        print("=" * 70)

        try:
            # Test specialty query
            specialties = await graphdb_client.get_all_specialties()
            self.log_test(
                "Get all specialties query",
                len(specialties) > 0,
                f"Found {len(specialties)} specialties"
            )

            # Test symptom search
            symptom_results = await graphdb_client.search_by_symptom("chest pain", limit=10)
            providers = symptom_results.get('providers', [])
            symptoms = symptom_results.get('symptoms', [])

            self.log_test(
                "Symptom semantic search (chest pain → condition → physician)",
                len(providers) > 0,
                f"Found {len(providers)} providers treating chest pain-related conditions"
            )

            self.log_test(
                "Symptom → Condition relationship traversal",
                len(symptoms) > 0,
                f"Found {len(symptoms)} related conditions/precautions"
            )

            # Test hospital query
            hospitals = await graphdb_client.get_hospitals(limit=10)
            self.log_test(
                "Hospital data with HCAHPS scores",
                len(hospitals) > 0,
                f"Found {len(hospitals)} hospitals"
            )

            # Test provider by specialty
            if specialties:
                specialty_providers = await graphdb_client.get_providers_by_specialty(
                    specialties[0],
                    limit=10
                )
                self.log_test(
                    f"Provider search by specialty ({specialties[0]})",
                    len(specialty_providers) > 0,
                    f"Found {len(specialty_providers)} providers"
                )

        except Exception as e:
            self.log_test(
                "SPARQL queries",
                False,
                f"Error: {e}"
            )

    async def test_backend_api(self):
        """Test backend API endpoints."""
        print("\n" + "=" * 70)
        print("4. BACKEND API TESTS")
        print("=" * 70)

        backend_url = "http://localhost:8000"

        try:
            # Test health endpoint
            response = requests.get(f"{backend_url}/api/v1/health", timeout=5)
            health_data = response.json()

            self.log_test(
                "Health check endpoint",
                response.status_code == 200,
                f"Status: {health_data.get('status', 'unknown')}"
            )

            self.log_test(
                "  - GraphDB connection via API",
                health_data.get('graphdb_connected', False),
                ""
            )

            self.log_test(
                "  - MongoDB connection via API",
                health_data.get('mongodb_connected', False),
                ""
            )

            # Test specialties endpoint
            response = requests.get(f"{backend_url}/api/v1/specialties", timeout=5)
            self.log_test(
                "GET /api/v1/specialties",
                response.status_code == 200,
                f"Returned {len(response.json())} specialties" if response.status_code == 200 else ""
            )

            # Test symptom search (POST)
            symptom_request = {
                "symptom": "chest pain",
                "lat": 33.4484,
                "lng": -112.0740,
                "radius": 25,
                "limit": 10
            }
            response = requests.post(
                f"{backend_url}/api/v1/search/symptom",
                json=symptom_request,
                timeout=10
            )
            self.log_test(
                "POST /api/v1/search/symptom",
                response.status_code == 200,
                f"Returned {len(response.json().get('providers', []))} providers" if response.status_code == 200 else ""
            )

            # Test provider search (GET)
            response = requests.get(
                f"{backend_url}/api/v1/search/providers?symptom=headache&limit=10",
                timeout=10
            )
            self.log_test(
                "GET /api/v1/search/providers",
                response.status_code == 200,
                f"Returned {len(response.json().get('providers', []))} providers" if response.status_code == 200 else ""
            )

        except requests.exceptions.ConnectionError:
            self.log_test(
                "Backend API",
                False,
                "Cannot connect to backend. Start with: python -m app.main"
            )
        except Exception as e:
            self.log_test(
                "Backend API",
                False,
                f"Error: {e}"
            )

    async def test_caching_mechanism(self):
        """Test MongoDB caching mechanism."""
        print("\n" + "=" * 70)
        print("5. CACHING MECHANISM TESTS")
        print("=" * 70)

        backend_url = "http://localhost:8000"

        try:
            # Clear cache
            if mongodb_client.db:
                await mongodb_client.db.search_cache.delete_many({})
                self.log_test(
                    "Cache cleared for fresh test",
                    True,
                    ""
                )

            # First request - should be cache MISS
            import time
            symptom = "fever"

            start_time = time.time()
            response1 = requests.get(
                f"{backend_url}/api/v1/search/providers?symptom={symptom}&limit=5",
                timeout=10
            )
            time1 = time.time() - start_time

            self.log_test(
                f"First request (cache MISS - GraphDB query)",
                response1.status_code == 200,
                f"Response time: {time1:.3f}s"
            )

            # Second request - should be cache HIT
            start_time = time.time()
            response2 = requests.get(
                f"{backend_url}/api/v1/search/providers?symptom={symptom}&limit=5",
                timeout=10
            )
            time2 = time.time() - start_time

            self.log_test(
                f"Second request (cache HIT - MongoDB)",
                response2.status_code == 200,
                f"Response time: {time2:.3f}s (cached should be faster)"
            )

            # Verify cache is faster
            if response1.status_code == 200 and response2.status_code == 200:
                speedup = (time1 - time2) / time1 * 100
                self.log_test(
                    "Cache performance improvement",
                    time2 < time1,
                    f"Cache is {speedup:.1f}% faster" if time2 < time1 else "Cache might not be working optimally",
                    warning=(time2 >= time1)
                )

                # Verify results are identical
                results_match = response1.json() == response2.json()
                self.log_test(
                    "Cached results match original",
                    results_match,
                    "Results are identical" if results_match else "Results differ!"
                )

        except Exception as e:
            self.log_test(
                "Caching mechanism",
                False,
                f"Error: {e}"
            )

    async def test_knowledge_graph_traversal(self):
        """Test knowledge graph relationship traversal."""
        print("\n" + "=" * 70)
        print("6. KNOWLEDGE GRAPH TRAVERSAL TESTS")
        print("=" * 70)

        try:
            # Test complete graph traversal: Symptom → Condition → Physician → Hospital
            query = """
            PREFIX : <http://example.org/healthnav#>

            SELECT DISTINCT ?symptomName ?conditionName ?physicianName ?hospitalName
            WHERE {
                ?symptom a :Symptom ;
                         :name ?symptomName .
                FILTER (CONTAINS(LCASE(?symptomName), "chest"))

                ?condition a :MedicalCondition ;
                           :hasSymptom ?symptom ;
                           :name ?conditionName .

                ?physician a :Physician ;
                          :name ?physicianName ;
                          :treatsCondition ?condition .

                OPTIONAL {
                    ?physician :affiliatedWith ?hospital .
                    ?hospital :name ?hospitalName .
                }
            }
            LIMIT 5
            """

            results = await graphdb_client.query(query)
            self.log_test(
                "Symptom → Condition → Physician → Hospital traversal",
                len(results) > 0,
                f"Found {len(results)} complete relationship chains"
            )

            # Test physician specialty relationships
            specialty_query = """
            PREFIX : <http://example.org/healthnav#>

            SELECT ?physicianName ?specialtyName
            WHERE {
                ?physician a :Physician ;
                          :name ?physicianName ;
                          :hasSpecialty ?specialty .
                ?specialty :name ?specialtyName .
            }
            LIMIT 10
            """

            specialty_results = await graphdb_client.query(specialty_query)
            self.log_test(
                "Physician → Specialty relationships",
                len(specialty_results) > 0,
                f"Found {len(specialty_results)} physician-specialty links"
            )

            # Test hospital HCAHPS scores
            hcahps_query = """
            PREFIX : <http://example.org/healthnav#>

            SELECT ?hospitalName ?score
            WHERE {
                ?hospital a :Hospital ;
                         :name ?hospitalName ;
                         :hcahpsOverallScore ?score .
            }
            ORDER BY DESC(?score)
            LIMIT 5
            """

            hcahps_results = await graphdb_client.query(hcahps_query)
            self.log_test(
                "Hospital HCAHPS quality scores",
                len(hcahps_results) > 0,
                f"Top hospital score: {hcahps_results[0]['score']['value']}" if hcahps_results else ""
            )

        except Exception as e:
            self.log_test(
                "Knowledge graph traversal",
                False,
                f"Error: {e}"
            )

    def print_summary(self):
        """Print test summary."""
        print("\n" + "=" * 70)
        print("TEST SUMMARY")
        print("=" * 70)

        total = self.results["passed"] + self.results["failed"] + self.results["warnings"]

        print(f"\nTotal Tests: {total}")
        print(f"✓ Passed: {self.results['passed']}")
        print(f"⚠ Warnings: {self.results['warnings']}")
        print(f"✗ Failed: {self.results['failed']}")

        success_rate = (self.results['passed'] / total * 100) if total > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")

        if self.results['failed'] == 0 and self.results['warnings'] == 0:
            print("\n🎉 ALL TESTS PASSED! System is production ready!")
        elif self.results['failed'] == 0:
            print("\n✓ All critical tests passed (some warnings)")
        else:
            print("\n⚠ Some tests failed. Review the output above.")

        print("\n" + "=" * 70)


async def main():
    """Run complete system test."""
    print("\n" + "=" * 70)
    print(" HEALTHCARE NAVIGATOR - COMPLETE SYSTEM TEST")
    print(" Testing: GraphDB + MongoDB + APIs + Caching + Knowledge Graph")
    print("=" * 70)

    tester = SystemTester()

    # Run all tests
    await tester.test_graphdb_connection()
    await tester.test_mongodb_connection()
    await tester.test_sparql_queries()
    await tester.test_backend_api()
    await tester.test_caching_mechanism()
    await tester.test_knowledge_graph_traversal()

    # Print summary
    tester.print_summary()

    # Cleanup
    await mongodb_client.disconnect()

    # Return exit code
    return 0 if tester.results['failed'] == 0 else 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
