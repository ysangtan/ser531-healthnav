from SPARQLWrapper import SPARQLWrapper, JSON
from typing import List, Dict, Any, Optional
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class GraphDBClient:
    """Client for interacting with Ontotext GraphDB."""

    def __init__(self):
        self.endpoint = f"{settings.GRAPHDB_URL}/repositories/{settings.GRAPHDB_REPOSITORY}"
        self.sparql = SPARQLWrapper(self.endpoint)
        self.sparql.setReturnFormat(JSON)

        if settings.GRAPHDB_USERNAME and settings.GRAPHDB_PASSWORD:
            self.sparql.setCredentials(
                settings.GRAPHDB_USERNAME,
                settings.GRAPHDB_PASSWORD
            )

    async def query(self, sparql_query: str) -> List[Dict[str, Any]]:
        """Execute a SPARQL query and return results."""
        try:
            import asyncio

            def _execute_query():
                """Helper to execute synchronous SPARQL query."""
                self.sparql.setQuery(sparql_query)
                return self.sparql.query().convert()

            # Run synchronous SPARQL query in thread pool to avoid blocking event loop
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(None, _execute_query)

            if "results" in results and "bindings" in results["results"]:
                return results["results"]["bindings"]
            return []
        except Exception as e:
            logger.error(f"GraphDB query error: {e}")
            raise

    async def test_connection(self) -> bool:
        """Test connection to GraphDB with timeout."""
        try:
            import asyncio
            test_query = """
            SELECT (COUNT(*) as ?count) WHERE {
                ?s ?p ?o .
            } LIMIT 1
            """
            # Add timeout to prevent hanging
            await asyncio.wait_for(self.query(test_query), timeout=2.0)
            return True
        except asyncio.TimeoutError:
            logger.warning("GraphDB connection test timed out")
            return False
        except Exception as e:
            logger.warning(f"GraphDB connection test failed: {e}")
            return False

    async def search_by_symptom(
        self,
        symptom: str,
        limit: int = 50
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Search for providers, conditions, and precautions by symptom."""

        # Query to find conditions and precautions for the symptom
        symptom_query = f"""
        PREFIX : <http://example.org/healthnav#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

        SELECT DISTINCT
            ?symptomName ?conditionId ?conditionName
            ?precautionId ?precautionName
        WHERE {{
            ?symptom a :Symptom ;
                     :name ?symptomName .
            FILTER (CONTAINS(LCASE(?symptomName), LCASE("{symptom}")))

            OPTIONAL {{
                ?condition a :MedicalCondition ;
                           :hasSymptom ?symptom ;
                           :name ?conditionName .
                BIND(STRAFTER(STR(?condition), "#") AS ?conditionId)
            }}

            OPTIONAL {{
                ?symptom :recommendedPrecaution ?precaution .
                ?precaution :name ?precautionName .
                BIND(STRAFTER(STR(?precaution), "#") AS ?precautionId)
            }}
        }}
        LIMIT {limit}
        """

        # Query to find providers who treat the conditions
        provider_query = f"""
        PREFIX : <http://example.org/healthnav#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX schema: <http://schema.org/>

        SELECT DISTINCT
            ?physicianId ?physicianName ?npi
            ?specialtyName ?conditionName
            ?hospitalId ?hospitalName ?hcahpsScore
            ?lat ?lng ?phone ?address
        WHERE {{
            ?symptom a :Symptom ;
                     :name ?symptomName .
            FILTER (CONTAINS(LCASE(?symptomName), LCASE("{symptom}")))

            ?condition a :MedicalCondition ;
                       :hasSymptom ?symptom ;
                       :name ?conditionName .

            ?physician a :Physician ;
                      :name ?physicianName ;
                      :treatsCondition ?condition .

            OPTIONAL {{ ?physician :npi ?npi . }}
            BIND(STRAFTER(STR(?physician), "#") AS ?physicianId)

            OPTIONAL {{
                ?physician :hasSpecialty ?specialty .
                ?specialty :name ?specialtyName .
            }}

            OPTIONAL {{
                ?physician :affiliatedWith ?hospital .
                ?hospital :name ?hospitalName ;
                         :hcahpsOverallScore ?hcahpsScore .
                BIND(STRAFTER(STR(?hospital), "#") AS ?hospitalId)

                OPTIONAL {{
                    ?hospital :locatedAt ?hospitalAddress .
                    ?hospitalAddress :hasGeo ?geo .
                    ?geo :latitude ?lat ;
                         :longitude ?lng .
                }}

                OPTIONAL {{ ?hospital :phone ?phone . }}
                OPTIONAL {{
                    ?hospital :locatedAt ?hospitalAddress .
                    ?hospitalAddress :addressLine ?address .
                }}
            }}
        }}
        LIMIT {limit}
        """

        try:
            symptom_results = await self.query(symptom_query)
            provider_results = await self.query(provider_query)

            return {
                "symptoms": symptom_results,
                "providers": provider_results
            }
        except Exception as e:
            logger.error(f"Error searching by symptom: {e}")
            return {"symptoms": [], "providers": []}

    async def get_providers_by_specialty(
        self,
        specialty: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get providers by specialty."""
        query = f"""
        PREFIX : <http://example.org/healthnav#>

        SELECT DISTINCT
            ?physicianId ?physicianName ?npi ?specialtyName
            ?hospitalId ?hospitalName ?hcahpsScore
            ?lat ?lng
        WHERE {{
            ?physician a :Physician ;
                      :name ?physicianName ;
                      :hasSpecialty ?specialty .

            ?specialty :name ?specialtyName .
            FILTER (CONTAINS(LCASE(?specialtyName), LCASE("{specialty}")))

            OPTIONAL {{ ?physician :npi ?npi . }}
            BIND(STRAFTER(STR(?physician), "#") AS ?physicianId)

            OPTIONAL {{
                ?physician :affiliatedWith ?hospital .
                ?hospital :name ?hospitalName ;
                         :hcahpsOverallScore ?hcahpsScore .
                BIND(STRAFTER(STR(?hospital), "#") AS ?hospitalId)

                OPTIONAL {{
                    ?hospital :locatedAt ?address .
                    ?address :hasGeo ?geo .
                    ?geo :latitude ?lat ;
                         :longitude ?lng .
                }}
            }}
        }}
        LIMIT {limit}
        """

        return await self.query(query)

    async def get_all_specialties(self) -> List[str]:
        """Get all available medical specialties."""
        query = """
        PREFIX : <http://example.org/healthnav#>

        SELECT DISTINCT ?name
        WHERE {
            ?specialty a :Specialty ;
                      :name ?name .
        }
        ORDER BY ?name
        """

        results = await self.query(query)
        return [r["name"]["value"] for r in results if "name" in r]

    async def get_hospitals(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all hospitals with their details."""
        query = f"""
        PREFIX : <http://example.org/healthnav#>

        SELECT DISTINCT
            ?hospitalId ?hospitalName ?cmsId ?hcahpsScore
            ?addressLine ?city ?state ?postalCode
            ?lat ?lng ?phone
        WHERE {{
            ?hospital a :Hospital ;
                     :name ?hospitalName .

            BIND(STRAFTER(STR(?hospital), "#") AS ?hospitalId)

            OPTIONAL {{ ?hospital :cmsOrgId ?cmsId . }}
            OPTIONAL {{ ?hospital :hcahpsOverallScore ?hcahpsScore . }}
            OPTIONAL {{ ?hospital :phone ?phone . }}

            OPTIONAL {{
                ?hospital :locatedAt ?address .
                OPTIONAL {{ ?address :addressLine ?addressLine . }}
                OPTIONAL {{ ?address :city ?city . }}
                OPTIONAL {{ ?address :state ?state . }}
                OPTIONAL {{ ?address :postalCode ?postalCode . }}

                OPTIONAL {{
                    ?address :hasGeo ?geo .
                    ?geo :latitude ?lat ;
                         :longitude ?lng .
                }}
            }}
        }}
        LIMIT {limit}
        """

        return await self.query(query)

    async def get_pharmacies(
        self,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get pharmacies, optionally filtered by location."""
        query = f"""
        PREFIX : <http://example.org/healthnav#>

        SELECT DISTINCT
            ?pharmacyId ?pharmacyName
            ?addressLine ?city ?state ?postalCode
            ?lat ?lng ?phone
        WHERE {{
            ?pharmacy a :Pharmacy ;
                     :name ?pharmacyName .

            BIND(STRAFTER(STR(?pharmacy), "#") AS ?pharmacyId)

            OPTIONAL {{
                ?pharmacy :locatedAt ?address .
                OPTIONAL {{ ?address :addressLine ?addressLine . }}
                OPTIONAL {{ ?address :city ?city . }}
                OPTIONAL {{ ?address :state ?state . }}
                OPTIONAL {{ ?address :postalCode ?postalCode . }}

                OPTIONAL {{
                    ?address :hasGeo ?geo .
                    ?geo :latitude ?lat ;
                         :longitude ?lng .
                }}
            }}

            OPTIONAL {{ ?pharmacy :phone ?phone . }}
        }}
        LIMIT {limit}
        """

        return await self.query(query)


# Global GraphDB client instance
graphdb_client = GraphDBClient()
