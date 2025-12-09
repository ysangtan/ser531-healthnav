# GraphDB Implementation Plan

## Overview

This document outlines the complete plan to properly implement the Healthcare Navigator with **GraphDB as the source of truth** and **MongoDB as cache only**, as specified in the project deliverable.

## Current vs. Required Architecture

### ❌ Current (INCORRECT)
```
Frontend → Backend → MongoDB (primary data) → Return results
                   ↓
                GraphDB (optional/unused)
```

### ✅ Required (FROM PDF)
```
Frontend → Backend → Check MongoDB Cache
                   ↓ (cache miss)
                   → GraphDB SPARQL Query
                   → Process results
                   → Store in MongoDB Cache
                   → Return results
```

## Critical Requirements from PDF

1. **GraphDB**: "serves as the source of truth; an RDF/OWL 2 database"
2. **MongoDB**: "stores denormalized 'views' and response caches"
3. **Data Format**: RDF Turtle (.ttl) files, not JSON
4. **Query Method**: SPARQL queries, not MongoDB queries
5. **Seeding**: Load ontology + .ttl files into GraphDB first

---

## Phase 1: GraphDB Setup

### 1.1 Install GraphDB

**Download Options:**
- **GraphDB Free**: https://www.ontotext.com/products/graphdb/download/
- **GraphDB Desktop**: Easiest for local development
- **GraphDB Docker**: Best for deployment

**Installation Steps:**

#### Option A: GraphDB Desktop (Recommended for Development)
```bash
# macOS
brew install --cask graphdb-desktop

# Or download from:
# https://www.ontotext.com/products/graphdb/graphdb-free/

# Start GraphDB Desktop
# Access at: http://localhost:7200
```

#### Option B: Docker (Recommended for Deployment)
```bash
# Pull GraphDB image
docker pull ontotext/graphdb:10.6.3-free

# Run GraphDB
docker run -d \
  --name graphdb \
  -p 7200:7200 \
  -v $(pwd)/graphdb-data:/opt/graphdb/home \
  ontotext/graphdb:10.6.3-free

# Access at: http://localhost:7200
```

### 1.2 Create Repository

1. Open GraphDB Workbench: http://localhost:7200
2. Go to **Setup** → **Repositories** → **Create new repository**
3. Configure:
   - **Repository ID**: `healthnav`
   - **Repository title**: Healthcare Navigator
   - **Ruleset**: RDFS-Plus (for reasoning)
   - Click **Create**

### 1.3 Verify Setup

```bash
# Test connection
curl http://localhost:7200/rest/repositories

# Should return JSON with "healthnav" repository
```

---

## Phase 2: Create RDF/Turtle Data Files

### 2.1 Data Files Structure

According to PDF, we need these .ttl files:
- `healthnav.owl` ✅ (already exists)
- `physicians.ttl`
- `specialties.ttl`
- `hospitals.ttl`
- `hospitals_hcahps.ttl`
- `pharmacies.ttl`
- `conditions_symptoms.ttl`
- `symptoms_precautions.ttl`

### 2.2 Create TTL Generator Script

**File**: `backend/ops/generate_ttl_data.py`

This script will:
1. Use the ontology classes from `HealthcareNavigator_Team4.owl`
2. Generate RDF triples in Turtle format
3. Include proper prefixes and namespaces
4. Create instances with all required properties

**Example Turtle Format:**
```turtle
@prefix : <http://example.org/healthnav#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

:DrSmith a :Physician ;
    :name "Dr. Alex Smith" ;
    :npi "1234567890" ;
    :hasSpecialty :Cardiology ;
    :treatsCondition :CAD ;
    :affiliatedWith :BannerUMCPhoenix .

:BannerUMCPhoenix a :Hospital ;
    :name "Banner – University Medical Center Phoenix" ;
    :cmsOrgId "CMS123456" ;
    :hcahpsOverallScore "74.0"^^xsd:decimal ;
    :locatedAt :BannerUMCPhoenix_Address .
```

### 2.3 MongoDB Cache Files (Secondary)

**File**: `backend/ops/generate_cache_json.py`

Generate denormalized JSON for MongoDB cache:
- `providers_cache.json`
- `hospitals_cache.json`
- `pharmacies_cache.json`

---

## Phase 3: Update Seeding Script

### 3.1 New Seed Process (ops/seed.py)

```python
async def seed_all():
    """Complete seeding process."""

    # Step 1: Load ontology and data into GraphDB
    print("[1/4] Loading data into GraphDB...")
    await seed_graphdb()

    # Step 2: Validate with SHACL
    print("[2/4] Running SHACL validation...")
    await validate_graphdb()

    # Step 3: Generate cache from GraphDB
    print("[3/4] Generating MongoDB cache from GraphDB...")
    await generate_cache_from_graphdb()

    # Step 4: Seed MongoDB cache
    print("[4/4] Loading cache into MongoDB...")
    await seed_mongodb_cache()
```

### 3.2 GraphDB Loading Function

```python
async def seed_graphdb():
    """Load ontology and TTL files into GraphDB."""

    # Files to load in order
    ttl_files = [
        'healthnav.owl',           # Ontology first
        'specialties.ttl',
        'conditions_symptoms.ttl',
        'symptoms_precautions.ttl',
        'hospitals.ttl',
        'hospitals_hcahps.ttl',
        'physicians.ttl',
        'pharmacies.ttl',
    ]

    for ttl_file in ttl_files:
        load_ttl_to_graphdb(
            repository='healthnav',
            file_path=f'data/{ttl_file}'
        )
```

---

## Phase 4: Implement SPARQL Queries

### 4.1 Core SPARQL Queries

**Query 1: Symptom-based Search**

```sparql
PREFIX : <http://example.org/healthnav#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT
    ?physicianId ?physicianName ?npi
    ?specialtyName ?conditionName
    ?hospitalId ?hospitalName ?hcahpsScore
    ?lat ?lng ?phone ?address
WHERE {
    # Find symptom by name
    ?symptom a :Symptom ;
             :name ?symptomName .
    FILTER (CONTAINS(LCASE(?symptomName), LCASE("${symptom_input}")))

    # Traverse to condition
    ?condition a :MedicalCondition ;
               :hasSymptom ?symptom ;
               :name ?conditionName .

    # Find physicians who treat this condition
    ?physician a :Physician ;
              :name ?physicianName ;
              :treatsCondition ?condition .

    BIND(STRAFTER(STR(?physician), "#") AS ?physicianId)

    OPTIONAL { ?physician :npi ?npi . }

    # Get specialty
    OPTIONAL {
        ?physician :hasSpecialty ?specialty .
        ?specialty :name ?specialtyName .
    }

    # Get affiliated hospital
    OPTIONAL {
        ?physician :affiliatedWith ?hospital .
        ?hospital :name ?hospitalName ;
                 :hcahpsOverallScore ?hcahpsScore .
        BIND(STRAFTER(STR(?hospital), "#") AS ?hospitalId)

        # Get hospital location
        OPTIONAL {
            ?hospital :locatedAt ?hospitalAddress .
            ?hospitalAddress :hasGeo ?geo .
            ?geo :latitude ?lat ;
                 :longitude ?lng .
        }

        OPTIONAL { ?hospital :phone ?phone . }
        OPTIONAL { ?hospitalAddress :addressLine ?address . }
    }
}
ORDER BY DESC(?hcahpsScore)
LIMIT ${limit}
```

**Query 2: Get Precautions for Symptom**

```sparql
PREFIX : <http://example.org/healthnav#>

SELECT DISTINCT ?precautionId ?precautionName
WHERE {
    ?symptom a :Symptom ;
             :name ?symptomName ;
             :recommendedPrecaution ?precaution .

    FILTER (CONTAINS(LCASE(?symptomName), LCASE("${symptom_input}")))

    ?precaution :name ?precautionName .
    BIND(STRAFTER(STR(?precaution), "#") AS ?precautionId)
}
```

**Query 3: Get All Specialties**

```sparql
PREFIX : <http://example.org/healthnav#>

SELECT DISTINCT ?name
WHERE {
    ?specialty a :Specialty ;
              :name ?name .
}
ORDER BY ?name
```

### 4.2 Update GraphDB Client

**File**: `backend/app/db/graphdb.py`

- ✅ Already has SPARQL query methods
- ❌ Need to update with proper queries from above
- ❌ Need to add error handling for GraphDB connection

---

## Phase 5: Update Backend Logic

### 5.1 Search Service Flow

**File**: `backend/app/services/search.py`

```python
async def search_by_symptom(request: SymptomSearchRequest):
    """
    1. Check MongoDB cache
    2. If miss → Query GraphDB via SPARQL
    3. Process results (distances, ranking)
    4. Cache in MongoDB
    5. Return
    """

    # Generate cache key
    cache_key = generate_cache_key({...})

    # Check cache FIRST
    cached = await mongodb_client.get_cached_search_result(cache_key)
    if cached:
        return cached

    # Cache MISS → Query GraphDB
    results = await graphdb_client.search_by_symptom(
        symptom=request.symptom,
        limit=request.limit
    )

    # Process SPARQL results
    providers = process_sparql_results(results)

    # Calculate distances (if location provided)
    if request.lat and request.lng:
        providers = calculate_distances(providers, request.lat, request.lng)
        providers = filter_by_radius(providers, request.radius)
        providers = rank_providers(providers)

    # Prepare response
    response = {...}

    # Cache for next time
    await mongodb_client.cache_search_result(cache_key, response)

    return response
```

### 5.2 MongoDB Updates

**Changes needed**:
1. Remove `cache_providers()` and `get_cached_providers()` as primary methods
2. Keep only `cache_search_result()` and `get_cached_search_result()`
3. Add TTL expiration on cache documents

---

## Phase 6: Testing Plan

### 6.1 GraphDB Testing

```bash
# 1. Verify data loaded
curl -X POST http://localhost:7200/repositories/healthnav \
  -H "Accept: application/sparql-results+json" \
  -d "query=SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }"

# 2. Test symptom query
curl -X POST http://localhost:7200/repositories/healthnav \
  -H "Accept: application/sparql-results+json" \
  -d "query=SELECT * WHERE { ?s a <http://example.org/healthnav#Symptom> } LIMIT 10"

# 3. Test physician query
curl -X POST http://localhost:7200/repositories/healthnav \
  -H "Accept: application/sparql-results+json" \
  -d "query=SELECT * WHERE { ?s a <http://example.org/healthnav#Physician> } LIMIT 10"
```

### 6.2 Integration Testing

```python
# Test complete flow
async def test_symptom_search():
    # First call - cache miss, queries GraphDB
    response1 = await search_by_symptom(
        SymptomSearchRequest(symptom="chest pain", radius=25)
    )
    assert len(response1.providers) > 0

    # Second call - cache hit, returns from MongoDB
    response2 = await search_by_symptom(
        SymptomSearchRequest(symptom="chest pain", radius=25)
    )
    assert response1 == response2
```

---

## Phase 7: Documentation

### 7.1 GraphDB Setup Guide

Create: `backend/docs/GRAPHDB_SETUP.md`

### 7.2 Data Model Documentation

Create: `backend/docs/DATA_MODEL.md`
- Explain ontology structure
- Show example SPARQL queries
- Document all .ttl files

---

## Implementation Schedule

### Week 1: GraphDB Setup
- [ ] Install GraphDB
- [ ] Create repository
- [ ] Test basic SPARQL queries

### Week 2: Data Generation
- [ ] Create TTL generator script
- [ ] Generate all .ttl files
- [ ] Validate RDF syntax

### Week 3: Integration
- [ ] Update seed script
- [ ] Implement SPARQL queries
- [ ] Update search service

### Week 4: Testing & Documentation
- [ ] Test complete flow
- [ ] Performance testing
- [ ] Write documentation

---

## Success Criteria

✅ **GraphDB is primary data source**
- All queries go to GraphDB first
- SPARQL queries return correct results
- Ontology properly loaded

✅ **MongoDB is cache only**
- Only stores query results
- Has TTL expiration
- Improves performance on cache hits

✅ **Complete data flow works**
- Frontend → Backend → Cache check → SPARQL → Cache store → Response
- All entity relationships preserved
- Geospatial queries work correctly

✅ **Performance acceptable**
- First query: < 2 seconds (GraphDB SPARQL)
- Cached query: < 200ms (MongoDB)
- No degradation with 1000+ providers

---

## Next Steps

**Immediate Actions:**

1. **Install GraphDB** (1 hour)
   ```bash
   brew install --cask graphdb-desktop
   # Or use Docker
   ```

2. **Create TTL Generator** (4 hours)
   - Script to generate .ttl files
   - Match ontology structure
   - Include sample data

3. **Update Seed Script** (2 hours)
   - Load GraphDB first
   - Then generate MongoDB cache

4. **Implement SPARQL Queries** (3 hours)
   - Symptom search query
   - Provider search query
   - Hospital/pharmacy queries

5. **Test Integration** (2 hours)
   - End-to-end testing
   - Verify cache works

**Total Estimated Time: 12-15 hours**

---

## Resources

- **GraphDB Documentation**: https://graphdb.ontotext.com/documentation/
- **SPARQL Tutorial**: https://www.w3.org/TR/sparql11-query/
- **RDF Turtle Syntax**: https://www.w3.org/TR/turtle/
- **SPARQLWrapper Python Docs**: https://sparqlwrapper.readthedocs.io/

---

## Contact & Support

For questions or issues during implementation:
1. Check GraphDB logs: `graphdb-data/logs/`
2. Validate SPARQL queries in GraphDB Workbench
3. Test RDF files with online validator: http://ttl.summerofcode.be/
