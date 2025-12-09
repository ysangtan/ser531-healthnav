# Ontotext GraphDB Setup & Integration Guide

## Overview

This guide covers the complete setup of **Ontotext GraphDB** as the knowledge graph source of truth for Healthcare Navigator, as specified in the project deliverable.

## Why Ontotext GraphDB?

From the PDF (Section IV):
> "Ontotext GraphDB (Knowledge Graph) serves as the **source of truth**; an RDF/OWL 2 database storing the healthnav.owl ontology and all semantic triples for complex graph queries."

**Features we use:**
- RDF/OWL 2 database
- SPARQL 1.1 query support
- RDFS-Plus reasoning
- REST API for data loading
- Visual SPARQL editor
- Repository management

## Installation Options

### Option 1: GraphDB Desktop (Recommended for Development)

**Advantages:**
- Easy GUI interface
- Built-in SPARQL editor
- Visual graph explorer
- No command line needed

**Installation:**

#### macOS:
```bash
# Using Homebrew
brew install --cask graphdb-desktop

# Or download directly from:
# https://www.ontotext.com/products/graphdb/download/

# Start GraphDB Desktop
open -a GraphDB
```

#### Windows:
1. Download installer from: https://www.ontotext.com/products/graphdb/download/
2. Run `graphdb-desktop-{version}.exe`
3. Follow installation wizard
4. Launch GraphDB Desktop from Start Menu

#### Linux:
```bash
# Download .deb or .rpm from Ontotext website
# For Ubuntu/Debian:
wget https://maven.ontotext.com/repository/owlim-releases/com/ontotext/graphdb/graphdb-desktop/10.6.3/graphdb-desktop-10.6.3.deb
sudo dpkg -i graphdb-desktop-10.6.3.deb

# Start GraphDB
graphdb-desktop
```

**First Launch:**
1. GraphDB Desktop will start on `http://localhost:7200`
2. Open browser to http://localhost:7200
3. Accept license agreement
4. You'll see the GraphDB Workbench

### Option 2: Docker (Recommended for Production)

**Advantages:**
- Consistent environment
- Easy deployment
- Portable
- Part of Docker Compose stack

**Setup:**

```bash
# Pull GraphDB Free Edition
docker pull ontotext/graphdb:10.6.3-free

# Run GraphDB
docker run -d \
  --name healthnav-graphdb \
  -p 7200:7200 \
  -v $(pwd)/graphdb-data:/opt/graphdb/home \
  -e GDB_JAVA_OPTS="-Xmx2g -Xms1g" \
  ontotext/graphdb:10.6.3-free

# Check logs
docker logs -f healthnav-graphdb

# Wait for startup (look for "Started GraphDB")
# Access at: http://localhost:7200
```

**Using Docker Compose** (integrated with project):

```yaml
# Already configured in docker-compose.yml
services:
  graphdb:
    image: ontotext/graphdb:10.6.3-free
    container_name: healthnav-graphdb
    ports:
      - "7200:7200"
    volumes:
      - graphdb-data:/opt/graphdb/home
    environment:
      - GDB_JAVA_OPTS=-Xmx2g -Xms1g
    networks:
      - healthnav-network
```

Start with:
```bash
docker-compose up -d graphdb
```

### Option 3: Standalone Server (Production)

**For production deployments:**

```bash
# Download GraphDB
wget https://maven.ontotext.com/repository/owlim-releases/com/ontotext/graphdb/graphdb-free/10.6.3/graphdb-free-10.6.3-dist.zip

# Extract
unzip graphdb-free-10.6.3-dist.zip
cd graphdb-free-10.6.3

# Start server
./bin/graphdb -d

# Or with custom port:
./bin/graphdb -p 7200 -d
```

## Creating the Repository

### Via GraphDB Workbench (GUI)

1. **Open GraphDB Workbench**: http://localhost:7200

2. **Go to Setup → Repositories**

3. **Click "Create new repository"**

4. **Configure Repository:**
   - **Repository ID**: `healthnav`
   - **Repository title**: Healthcare Navigator Knowledge Graph
   - **Ruleset**: `RDFS-Plus (Optimized)` ✅
   - **Disable context index**: No
   - **Enable predicate list**: Yes
   - **Enable literal index**: Yes
   - **Base URL**: `http://example.org/healthnav#`

5. **Click "Create"**

6. **Verify**: Repository should appear in the list

### Via REST API (Automated)

The `seed_graphdb.py` script does this automatically:

```python
# Repository configuration in Turtle format
config = """
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>.
@prefix rep: <http://www.openrdf.org/config/repository#>.
@prefix sr: <http://www.openrdf.org/config/repository/sail#>.
@prefix sail: <http://www.openrdf.org/config/sail#>.
@prefix owlim: <http://www.ontotext.com/trree/owlim#>.

[] a rep:Repository ;
    rep:repositoryID "healthnav" ;
    rdfs:label "Healthcare Navigator Repository" ;
    rep:repositoryImpl [
        rep:repositoryType "graphdb:FreeSailRepository" ;
        sr:sailImpl [
            sail:sailType "graphdb:FreeSail" ;
            owlim:ruleset "rdfsplus-optimized" ;
            owlim:enable-context-index "true" ;
            owlim:enablePredicateList "true" ;
            owlim:in-memory-literal-properties "true" ;
            owlim:enable-literal-index "true" ;
        ]
    ].
"""

# Create via API
requests.post(
    "http://localhost:7200/rest/repositories",
    headers={'Content-Type': 'text/turtle'},
    data=config
)
```

## Loading Data into GraphDB

### Step 1: Generate RDF Data

```bash
cd backend/ops
python generate_ttl_data.py
```

**Output** (in `backend/ops/ttl_data/`):
```
ttl_data/
├── specialties.ttl               # 21 medical specialties
├── conditions_symptoms.ttl       # Conditions with symptom links
├── symptoms_precautions.ttl      # Precautions for symptoms
├── hospitals.ttl                 # Phoenix hospitals with addresses
├── hospitals_hcahps.ttl          # HCAHPS quality scores
├── physicians.ttl                # Physicians with affiliations
└── pharmacies.ttl                # Pharmacy locations
```

### Step 2: Load Ontology + Data

**Automated (Recommended):**
```bash
cd backend/ops
python seed_graphdb.py
```

**Manual via Workbench:**

1. **Go to "Import" → "RDF" tab**

2. **Load files in order:**
   - Upload `HealthcareNavigator_Team4.owl` (ontology first!)
   - Upload `specialties.ttl`
   - Upload `conditions_symptoms.ttl`
   - Upload `symptoms_precautions.ttl`
   - Upload `hospitals.ttl`
   - Upload `hospitals_hcahps.ttl`
   - Upload `physicians.ttl`
   - Upload `pharmacies.ttl`

3. **For each file:**
   - Click "Upload RDF files"
   - Select file
   - Base IRI: `http://example.org/healthnav#`
   - Named graph: leave empty (default graph)
   - Click "Import"

4. **Verify import:** Check for success messages

### Step 3: Verify Data

**Via Workbench:**

1. Go to **Explore** → **Class hierarchy**
2. You should see:
   - Physician
   - Hospital
   - Symptom
   - MedicalCondition
   - Pharmacy
   - etc.

3. Go to **SPARQL** tab
4. Run test query:

```sparql
PREFIX : <http://example.org/healthnav#>

SELECT (COUNT(*) as ?count)
WHERE {
    ?s ?p ?o
}
```

Expected result: Several thousand triples

**Via API:**
```bash
curl -X POST http://localhost:7200/repositories/healthnav \
  -H "Accept: application/sparql-results+json" \
  -d "query=SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }"
```

## SPARQL Queries

### Query 1: Count Entities

```sparql
PREFIX : <http://example.org/healthnav#>

SELECT ?type (COUNT(?s) as ?count)
WHERE {
    ?s a ?type .
    FILTER (STRSTARTS(STR(?type), "http://example.org/healthnav#"))
}
GROUP BY ?type
ORDER BY DESC(?count)
```

### Query 2: Find Physicians by Symptom

```sparql
PREFIX : <http://example.org/healthnav#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?physicianName ?specialtyName ?hospitalName ?hcahpsScore
WHERE {
    # Find symptom
    ?symptom a :Symptom ;
             :name ?symptomName .
    FILTER (CONTAINS(LCASE(?symptomName), "chest pain"))

    # Find condition with this symptom
    ?condition a :MedicalCondition ;
               :hasSymptom ?symptom .

    # Find physicians treating this condition
    ?physician a :Physician ;
              :name ?physicianName ;
              :treatsCondition ?condition .

    # Get specialty
    OPTIONAL {
        ?physician :hasSpecialty ?specialty .
        ?specialty :name ?specialtyName .
    }

    # Get hospital affiliation
    OPTIONAL {
        ?physician :affiliatedWith ?hospital .
        ?hospital :name ?hospitalName ;
                 :hcahpsOverallScore ?hcahpsScore .
    }
}
ORDER BY DESC(?hcahpsScore)
LIMIT 10
```

### Query 3: Get Hospital Details with Location

```sparql
PREFIX : <http://example.org/healthnav#>

SELECT ?hospitalName ?address ?city ?state ?lat ?lng ?hcahpsScore ?phone
WHERE {
    ?hospital a :Hospital ;
             :name ?hospitalName ;
             :hcahpsOverallScore ?hcahpsScore ;
             :locatedAt ?address_node .

    ?address_node :addressLine ?address ;
                 :city ?city ;
                 :state ?state ;
                 :hasGeo ?geo .

    ?geo :latitude ?lat ;
         :longitude ?lng .

    OPTIONAL { ?hospital :phone ?phone . }
}
ORDER BY DESC(?hcahpsScore)
```

### Query 4: Get Precautions for Symptom

```sparql
PREFIX : <http://example.org/healthnav#>

SELECT ?symptomName ?precautionText
WHERE {
    ?symptom a :Symptom ;
             :name ?symptomName ;
             :recommendedPrecaution ?precaution .

    ?precaution :name ?precautionText .

    FILTER (CONTAINS(LCASE(?symptomName), "chest pain"))
}
```

### Query 5: Find Nearby Pharmacies (requires FILTER)

```sparql
PREFIX : <http://example.org/healthnav#>

SELECT ?pharmacyName ?address ?lat ?lng
WHERE {
    ?pharmacy a :Pharmacy ;
             :name ?pharmacyName ;
             :locatedAt ?address_node .

    ?address_node :addressLine ?address ;
                 :hasGeo ?geo .

    ?geo :latitude ?lat ;
         :longitude ?lng .

    # Note: Distance filtering done in Python backend
}
```

## Testing GraphDB Integration

### Test 1: Basic Connection

```bash
# Test if GraphDB is running
curl http://localhost:7200/rest/repositories

# Expected: JSON with "healthnav" repository
```

### Test 2: Count Triples

```bash
curl -X POST http://localhost:7200/repositories/healthnav \
  -H "Accept: application/sparql-results+json" \
  -d 'query=SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }'

# Expected: {"results": {"bindings": [{"count": {"value": "XXXX"}}]}}
```

### Test 3: Query Physicians

```bash
curl -X POST http://localhost:7200/repositories/healthnav \
  -H "Accept: application/sparql-results+json" \
  -d 'query=PREFIX : <http://example.org/healthnav#> SELECT * WHERE { ?s a :Physician } LIMIT 5'
```

### Test 4: Python Client Test

```python
from SPARQLWrapper import SPARQLWrapper, JSON

sparql = SPARQLWrapper("http://localhost:7200/repositories/healthnav")

sparql.setQuery("""
    PREFIX : <http://example.org/healthnav#>
    SELECT ?name WHERE {
        ?s a :Physician ;
           :name ?name .
    } LIMIT 5
""")

sparql.setReturnFormat(JSON)
results = sparql.query().convert()

for result in results["results"]["bindings"]:
    print(result["name"]["value"])
```

## Backend Integration

### Updated Search Service

The backend now queries GraphDB first:

```python
async def search_by_symptom(request: SymptomSearchRequest):
    # 1. Generate cache key
    cache_key = generate_cache_key({
        "symptom": request.symptom,
        "lat": request.lat,
        "lng": request.lng,
        "radius": request.radius
    })

    # 2. Check MongoDB cache
    cached = await mongodb_client.get_cached_search_result(cache_key)
    if cached:
        logger.info(f"Cache HIT for: {request.symptom}")
        return cached

    # 3. Cache MISS → Query GraphDB
    logger.info(f"Cache MISS - Querying GraphDB for: {request.symptom}")
    results = await graphdb_client.search_by_symptom(
        symptom=request.symptom,
        limit=request.limit
    )

    # 4. Process SPARQL results
    providers = process_sparql_results(results)

    # 5. Calculate distances
    if request.lat and request.lng:
        providers = calculate_distances(providers, request.lat, request.lng)
        providers = filter_by_radius(providers, request.radius)
        providers = rank_providers(providers)

    # 6. Build response
    response = {
        "symptom": request.symptom,
        "providers": providers,
        "totalResults": len(providers)
    }

    # 7. Cache for next time
    await mongodb_client.cache_search_result(cache_key, response)
    logger.info(f"Cached result for: {request.symptom}")

    return response
```

## Performance Optimization

### Enable Query Caching in GraphDB

1. **Go to Setup → Repositories → healthnav → Edit**
2. **Enable:**
   - Query timeout: 30s
   - Query limit results: 10000
   - Throw exception on timeout: Yes

### Monitor Queries

**Via Workbench:**
- Go to **Monitor** → **Queries**
- See running queries
- View query performance

**Via Logs:**
```bash
tail -f graphdb-data/logs/main.log
```

### Optimize SPARQL Queries

**Use OPTIONAL wisely:**
```sparql
# Good - OPTIONAL at end
SELECT ?physician ?hospital
WHERE {
    ?physician a :Physician .
    OPTIONAL { ?physician :affiliatedWith ?hospital . }
}

# Bad - OPTIONAL too early
SELECT ?physician ?hospital
WHERE {
    OPTIONAL { ?physician :affiliatedWith ?hospital . }
    ?physician a :Physician .
}
```

**Use LIMIT:**
```sparql
SELECT ?s ?p ?o
WHERE { ?s ?p ?o }
LIMIT 100  # Always limit in development
```

## Backup & Restore

### Backup Repository

**Via Workbench:**
1. Go to **Setup** → **Repositories**
2. Click **Export** next to `healthnav`
3. Select format: **Turtle (.ttl)**
4. Download export

**Via API:**
```bash
curl http://localhost:7200/repositories/healthnav/statements \
  -H "Accept: text/turtle" \
  > healthnav-backup.ttl
```

### Restore Repository

**Via Workbench:**
1. Create new repository
2. Go to **Import** → **RDF**
3. Upload `healthnav-backup.ttl`

**Via API:**
```bash
curl -X POST http://localhost:7200/repositories/healthnav/statements \
  -H "Content-Type: text/turtle" \
  --data-binary @healthnav-backup.ttl
```

## Troubleshooting

### GraphDB Won't Start

**Check Java:**
```bash
java -version
# Need Java 11 or higher
```

**Check Port:**
```bash
lsof -i :7200
# Kill if something else using port
```

**Check Logs:**
```bash
# Desktop version
tail -f ~/Library/Application\ Support/com.ontotext.graphdb/logs/main.log

# Server version
tail -f graphdb-free-10.6.3/logs/main.log
```

### Repository Creation Fails

**Check permissions:**
```bash
chmod -R 755 graphdb-data/
```

**Try manual creation via Workbench**

### SPARQL Query Returns Empty

**Check:**
1. Data loaded: `SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }`
2. Correct prefix: `PREFIX : <http://example.org/healthnav#>`
3. Case sensitivity: Use `LCASE()` for filters
4. Repository selected in Workbench

### Performance Issues

**Increase memory:**
```bash
# Docker
docker run -e GDB_JAVA_OPTS="-Xmx4g -Xms2g" ...

# Standalone
export GDB_JAVA_OPTS="-Xmx4g -Xms2g"
./bin/graphdb
```

**Check query complexity:**
- Avoid Cartesian products
- Use LIMIT during development
- Add more specific filters

## Next Steps

1. ✅ GraphDB installed and running
2. ✅ Repository created
3. ✅ Data loaded
4. ✅ SPARQL queries working

**Continue to:**
- Update backend to use GraphDB-first architecture
- Test complete flow
- Deploy to production

## Resources

- **GraphDB Documentation**: https://graphdb.ontotext.com/documentation/
- **SPARQL 1.1 Spec**: https://www.w3.org/TR/sparql11-query/
- **Ontotext Support**: https://www.ontotext.com/support/
- **GraphDB Free Download**: https://www.ontotext.com/products/graphdb/download/

## Summary

✅ **Ontotext GraphDB is now your knowledge graph source of truth**
- Stores RDF/OWL ontology
- Enables SPARQL semantic queries
- Provides graph reasoning
- Supports the architecture specified in your PDF

✅ **MongoDB is cache only**
- Stores query results
- Improves performance
- No source data stored

✅ **Complete semantic web stack**
- OWL ontology
- RDF data
- SPARQL queries
- Knowledge graph navigation

**Ready to query!** 🎉
