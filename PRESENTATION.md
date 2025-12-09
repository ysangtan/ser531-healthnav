# Healthcare Navigator

## Project Presentation Structure

**Course:** SER531 - Semantic Web Engineering
**Team:** Team 4

---

## Slide 1: Title Slide

**Healthcare Navigator**
_A Knowledge Graph-Driven Healthcare Navigation System_

---

## Slide 2: Problem Statement

**Challenge:**
Healthcare information is fragmented across multiple heterogeneous data sources, making it difficult for patients to:

- Find appropriate physicians based on symptoms
- Locate quality-rated hospitals
- Identify nearby pharmacies
- Understand treatment precautions

**Our Solution:**
A semantic knowledge graph that integrates diverse healthcare datasets to enable intelligent, symptom-driven healthcare provider discovery.

**Why Knowledge Graphs?**

- Semantic relationships between symptoms, conditions, and providers
- Inference capabilities for intelligent recommendations
- Unified query interface across heterogeneous data
- Standards-based approach (RDF/OWL/SPARQL)

---

# PART 1: KNOWLEDGE GRAPH & OWL ONTOLOGY

## Slide 3: OWL Ontology Design

**Core Ontology:** `HealthcareNavigator_Team4.owl`

### Main Classes Hierarchy

```
:Agent
└── :Person (≡ schema:Person)
    ├── :Patient
    └── :Physician (≡ schema:Physician)

:Organization (≡ schema:Organization)
├── :Hospital (≡ schema:Hospital)
└── :Pharmacy (≡ schema:Pharmacy)

:MedicalCondition (≡ schema:MedicalCondition)
:Symptom (⊂ skos:Concept)
:Precaution (⊂ skos:Concept)
:Specialty (⊂ skos:Concept)
:Procedure (≡ schema:MedicalProcedure)

Supporting Classes:
├── :Address (≡ schema:PostalAddress)
├── :GeoLocation (≡ schema:GeoCoordinates)
├── :Rating (≡ schema:Rating)
└── :InsurancePlan (≡ schema:HealthPlan)
```

**Design Principles:**

- Schema.org alignment for interoperability
- SKOS for controlled vocabularies
- Clean class hierarchy
- Domain-driven modeling

---

## Slide 4: Object Properties - Semantic Relationships

**Medical Relationships:**

```
:hasSymptom
  Domain: :MedicalCondition
  Range: :Symptom
  Example: :CAD :hasSymptom :ChestPain

:treatsCondition
  Domain: :Physician
  Range: :MedicalCondition
  Example: :DrSmith :treatsCondition :CAD

:recommendedPrecaution
  Domain: :Symptom
  Range: :Precaution
  Example: :ChestPain :recommendedPrecaution :Call911
```

**Organizational Relationships:**

```
:affiliatedWith
  Domain: :Physician
  Range: :Hospital
  Example: :DrSmith :affiliatedWith :BannerUMCPhoenix

:hasSpecialty
  Domain: :Physician
  Range: :Specialty
  Example: :DrSmith :hasSpecialty :Cardiology

:locatedAt
  Domain: :Organization
  Range: :Address
  Example: :BannerUMCPhoenix :locatedAt :BannerUMCPhoenix_Address
```

**Geospatial & Quality:**

```
:hasGeo
  Domain: :Address
  Range: :GeoLocation

:hasRating
  Domain: :Organization
  Range: :Rating
```

---

## Slide 5: Data Properties - Attributes

**Identity Properties:**

```
:name              Range: xsd:string (≡ schema:name)
:npi               Domain: :Physician, Range: xsd:string
:cmsOrgId          Domain: :Hospital, Range: xsd:string
```

**Address Properties:**

```
:addressLine       Domain: :Address, Range: xsd:string
:city              Domain: :Address, Range: xsd:string
:state             Domain: :Address, Range: xsd:string
:postalCode        Domain: :Address, Range: xsd:string
```

**Geospatial Properties:**

```
:latitude          Domain: :GeoLocation, Range: xsd:decimal
:longitude         Domain: :GeoLocation, Range: xsd:decimal
```

**Quality Metrics:**

```
:hcahpsOverallScore    Domain: :Hospital, Range: xsd:decimal
:ratingValue           Domain: :Rating, Range: xsd:decimal
:ratingCount           Domain: :Rating, Range: xsd:integer
```

**Contact Properties:**

```
:phone             Domain: :Organization, Range: xsd:string
:website           Domain: :Organization, Range: xsd:anyURI
```

---

## Slide 6: Sample Ontology Instance

**Real Example from Our Knowledge Graph:**

```turtle
# Medical Condition with Symptoms
:CAD a :MedicalCondition ;
    :name "Coronary artery disease" ;
    :hasSymptom :ChestPain, :ShortnessOfBreath .

# Symptoms with Precautions
:ChestPain a :Symptom ;
    :name "Chest pain" ;
    :recommendedPrecaution :Call911 .

:Call911 a :Precaution ;
    :name "If chest pain is severe or accompanied by shortness
           of breath, call emergency services immediately." .

# Specialty
:Cardiology a :Specialty ;
    :name "Cardiology" .

# Hospital with Location & Quality
:BannerUMCPhoenix a :Hospital ;
    :name "Banner – University Medical Center Phoenix" ;
    :cmsOrgId "CMS123456" ;
    :hcahpsOverallScore "74.0"^^xsd:decimal ;
    :locatedAt :BannerUMCPhoenix_Address .

:BannerUMCPhoenix_Address a :Address ;
    :addressLine "1111 E McDowell Rd" ;
    :city "Phoenix" ;
    :state "AZ" ;
    :postalCode "85006" ;
    :hasGeo :BannerUMCPhoenix_Geo .

:BannerUMCPhoenix_Geo a :GeoLocation ;
    :latitude "33.4665"^^xsd:decimal ;
    :longitude "-112.0553"^^xsd:decimal .

# Physician connecting everything
:DrSmith a :Physician ;
    :name "Dr. Alex Smith" ;
    :npi "1234567890" ;
    :hasSpecialty :Cardiology ;
    :treatsCondition :CAD ;
    :affiliatedWith :BannerUMCPhoenix .
```

**This single physician connects:**

- Specialty → Cardiology
- Condition → CAD
- Symptoms → Chest Pain, Shortness of Breath
- Precautions → Call 911
- Hospital → Banner UMC Phoenix (with location & quality score)

---

## Slide 7: Knowledge Graph Structure

**RDF Triple Store Statistics:**

| Component              | Count  | Format                              |
| ---------------------- | ------ | ----------------------------------- |
| **Total Triples**      | ~3,000 | RDF/Turtle                          |
| **Physicians**         | 30     | With NPI, specialties, affiliations |
| **Hospitals**          | 3      | Phoenix area with HCAHPS scores     |
| **Pharmacies**         | 15     | Geospatially distributed            |
| **Medical Conditions** | 5      | With symptom mappings               |
| **Symptoms**           | 15+    | With precautions                    |
| **Specialties**        | 21     | Medical specialties                 |
| **Precautions**        | 10+    | Symptom-specific guidance           |

**RDF Data Files:**

```
backend/ops/ttl_data/
├── specialties.ttl              # 21 medical specialties
├── conditions_symptoms.ttl      # Conditions with symptom links
├── symptoms_precautions.ttl     # Safety precautions
├── hospitals.ttl                # Hospital entities
├── hospitals_hcahps.ttl         # Quality ratings
├── physicians.ttl               # Provider data with affiliations
└── pharmacies.ttl               # Pharmacy locations
```

**Knowledge Graph Database:** Ontotext GraphDB (Industry-standard RDF store)

---

## Slide 8: SPARQL Query Examples

### Query 1: Find Providers by Symptom

**Use Case:** Patient has "chest pain" - find relevant specialists

```sparql
PREFIX : <http://example.org/healthnav#>

SELECT DISTINCT
    ?physicianName ?specialtyName ?hospitalName ?hcahpsScore
WHERE {
    # Find the symptom
    ?symptom a :Symptom ;
             :name ?symptomName .
    FILTER (CONTAINS(LCASE(?symptomName), "chest pain"))

    # Traverse to condition
    ?condition a :MedicalCondition ;
               :hasSymptom ?symptom ;
               :name ?conditionName .

    # Find physicians who treat this condition
    ?physician a :Physician ;
              :name ?physicianName ;
              :treatsCondition ?condition .

    # Get specialty
    ?physician :hasSpecialty ?specialty .
    ?specialty :name ?specialtyName .

    # Get affiliated hospital with quality score
    ?physician :affiliatedWith ?hospital .
    ?hospital :name ?hospitalName ;
             :hcahpsOverallScore ?hcahpsScore .
}
ORDER BY DESC(?hcahpsScore)
```

**Result:** Cardiologists at highly-rated hospitals who treat coronary conditions

---

### Query 2: Hospital Details with Location

```sparql
PREFIX : <http://example.org/healthnav#>

SELECT DISTINCT
    ?hospitalName ?hcahpsScore
    ?addressLine ?city ?state
    ?lat ?lng ?phone
WHERE {
    ?hospital a :Hospital ;
             :name ?hospitalName ;
             :hcahpsOverallScore ?hcahpsScore ;
             :locatedAt ?address .

    ?address :addressLine ?addressLine ;
            :city ?city ;
            :state ?state ;
            :hasGeo ?geo .

    ?geo :latitude ?lat ;
         :longitude ?lng .

    OPTIONAL { ?hospital :phone ?phone . }
}
ORDER BY DESC(?hcahpsScore)
```

**Result:** Hospitals ranked by quality with complete location data

---

### Query 3: Specialty-Based Provider Search

```sparql
PREFIX : <http://example.org/healthnav#>

SELECT DISTINCT
    ?physicianName ?npi ?specialtyName
    ?hospitalName ?lat ?lng
WHERE {
    ?physician a :Physician ;
              :name ?physicianName ;
              :hasSpecialty ?specialty .

    ?specialty :name ?specialtyName .
    FILTER (CONTAINS(LCASE(?specialtyName), "cardiology"))

    OPTIONAL { ?physician :npi ?npi . }

    OPTIONAL {
        ?physician :affiliatedWith ?hospital .
        ?hospital :name ?hospitalName ;
                 :locatedAt ?address .
        ?address :hasGeo ?geo .
        ?geo :latitude ?lat ;
             :longitude ?lng .
    }
}
```

**Result:** All cardiologists with their hospital locations

---

## Slide 9: Semantic Reasoning Capabilities

**Knowledge Graph Enables:**

### 1. Transitive Reasoning

```
Patient experiences "chest pain"
→ Symptom linked to "Coronary Artery Disease"
  → Condition treated by "Cardiologists"
    → Physicians affiliated with "Banner UMC"
      → Hospital located at (33.47°N, 112.06°W)
        → Distance: 5.2 miles from patient
```

### 2. Multi-Hop Queries

- Single SPARQL query traverses 6 relationship hops
- Traditional SQL would require multiple JOIN operations
- Knowledge graph makes complex relationships explicit

### 3. Inference Examples

```sparql
# Infer: If physician treats condition,
# and condition has symptom,
# then physician is relevant for symptom

?physician :treatsCondition ?condition .
?condition :hasSymptom ?symptom .
# Implies: ?physician relevant_for ?symptom
```

### 4. Schema.org Alignment

```turtle
:Physician owl:equivalentClass schema:Physician .
:Hospital owl:equivalentClass schema:Hospital .
```

- Enables cross-dataset queries
- Facilitates data integration
- Standards compliance

---

## Slide 10: Data Integration Pipeline

**From Heterogeneous Sources to Unified Knowledge Graph:**

### Data Sources

1. **CMS Provider Data** - Physician NPI, names, specialties
2. **HCAHPS Scores** - Hospital quality ratings
3. **OpenStreetMap** - Pharmacy locations
4. **Medical Ontologies** - Symptoms, conditions, precautions

### Transformation Pipeline

```
CSV/JSON Data
    ↓ (Parse & Validate)
Python ETL Scripts
    ↓ (Map to OWL Schema)
RDF/Turtle Generation
    ↓ (Load into Triple Store)
Ontotext GraphDB
    ↓ (SPARQL Queries)
Backend API
```

### Code: RDF Generation Example

```python
def generate_physician_ttl(provider_data):
    ttl = f"""
    :{provider_id} a :Physician ;
        :name "{name}" ;
        :npi "{npi}" ;
        :hasSpecialty :{specialty_id} ;
        :affiliatedWith :{hospital_id} ;
        :treatsCondition :{condition_id} .
    """
    return ttl
```

**Result:** 7 TTL files with ~3,000 triples loaded into GraphDB

---

# PART 2: SYSTEM ARCHITECTURE

## Slide 11: High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   USER INTERFACE LAYER                      │
│            React 18 + TypeScript + TailwindCSS              │
│                  Mapbox GL JS (Geospatial)                  │
│                    http://localhost:5173                    │
└──────────────────────────┬─────────────────────────────────┘
                           │ REST API (HTTP/JSON)
                           ↓
┌────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                          │
│                   FastAPI (Python 3.9+)                     │
│                    http://localhost:8000                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │           Request Processing Pipeline:             │   │
│  │                                                      │   │
│  │  1. Receive search request (symptom/location)      │   │
│  │  2. Check MongoDB cache                             │   │
│  │  3. If MISS → Execute SPARQL on GraphDB            │   │
│  │  4. Apply geospatial filtering (Haversine)         │   │
│  │  5. Rank results (HCAHPS + distance)               │   │
│  │  6. Cache results in MongoDB (TTL: 5 min)          │   │
│  │  7. Return JSON response                            │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────┬──────────────────────────┬───────────────────┘
              │                          │
              ↓                          ↓
┌──────────────────────────┐  ┌─────────────────────────────┐
│   ONTOTEXT GRAPHDB       │  │        MONGODB              │
│   Port: 7200             │  │        Port: 27017          │
│                          │  │                             │
│  SOURCE OF TRUTH         │  │  CACHING LAYER              │
│                          │  │                             │
│  • RDF Triple Store      │  │  • Query Results Cache      │
│  • OWL Ontology          │  │  • TTL: 5 minutes           │
│  • SPARQL 1.1 Endpoint   │  │  • Performance Boost        │
│  • ~3,000 Triples        │  │  • 50ms cached queries      │
│  • Semantic Reasoning    │  │  • No persistent storage    │
└──────────────────────────┘  └─────────────────────────────┘
```

**Key Design Decisions:**

- GraphDB = Source of Truth (all data originates here)
- MongoDB = Cache Only (no independent data)
- FastAPI = Orchestration (business logic, geospatial calculations)
- React = User Experience (interactive maps, filtering)

---

## Slide 12: Data Flow - Symptom Search

**Example: User searches for "chest pain" near Phoenix**

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User Input                                          │
│ ─────────────────────────────────────────────────────────── │
│ Frontend: Search form                                        │
│   - Symptom: "chest pain"                                   │
│   - Location: (33.4484°N, 112.0740°W)                       │
│   - Radius: 25 miles                                        │
│   - Min HCAHPS: 70                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓ POST /api/v1/search/symptom
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Backend Cache Check                                │
│ ─────────────────────────────────────────────────────────── │
│ cache_key = hash("chest_pain_33.4484_-112.074_25_70")      │
│ result = await mongodb.search_cache.find_one(cache_key)    │
└─────────────────────────────────────────────────────────────┘
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
    ┌──────────────────┐    ┌──────────────────┐
    │  Cache HIT       │    │  Cache MISS      │
    │  (50ms)          │    │  (1-2 seconds)   │
    └──────────────────┘    └──────────────────┘
              │                       ↓
              │             ┌─────────────────────────────────┐
              │             │ STEP 3: SPARQL Query to GraphDB│
              │             │ ─────────────────────────────── │
              │             │ Find:                           │
              │             │  • Symptoms matching input      │
              │             │  • Related conditions           │
              │             │  • Physicians treating them     │
              │             │  • Hospital affiliations        │
              │             │  • Locations & quality scores   │
              │             └─────────────────────────────────┘
              │                       ↓
              │             ┌─────────────────────────────────┐
              │             │ STEP 4: Geospatial Processing  │
              │             │ ─────────────────────────────── │
              │             │ For each provider:              │
              │             │  • Calculate distance           │
              │             │    (Haversine formula)          │
              │             │  • Filter by radius (25 mi)     │
              │             └─────────────────────────────────┘
              │                       ↓
              │             ┌─────────────────────────────────┐
              │             │ STEP 5: Ranking Algorithm      │
              │             │ ─────────────────────────────── │
              │             │ score = (0.6 × HCAHPS_norm)     │
              │             │       + (0.4 × distance_norm)   │
              │             │                                 │
              │             │ Sort DESC by score              │
              │             └─────────────────────────────────┘
              │                       ↓
              │             ┌─────────────────────────────────┐
              │             │ STEP 6: Cache Result           │
              │             │ ─────────────────────────────── │
              │             │ await mongodb.search_cache      │
              │             │   .insert_one({                 │
              │             │     key: cache_key,             │
              │             │     result: providers,          │
              │             │     expires: now + 5min         │
              │             │   })                            │
              │             └─────────────────────────────────┘
              │                       │
              └───────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: JSON Response                                       │
│ ─────────────────────────────────────────────────────────── │
│ {                                                            │
│   "providers": [                                            │
│     {                                                        │
│       "name": "Dr. Emily Chen",                             │
│       "specialty": "Cardiology",                            │
│       "hospital": "Banner UMC Phoenix",                     │
│       "hcahps_score": 78.5,                                 │
│       "distance_miles": 5.2,                                │
│       "location": {"lat": 33.4665, "lng": -112.0553},      │
│       "rank_score": 0.89                                    │
│     },                                                       │
│     ...                                                      │
│   ],                                                         │
│   "precautions": ["If severe, call 911 immediately"]       │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Frontend Rendering                                 │
│ ─────────────────────────────────────────────────────────── │
│  • Map markers at provider locations                        │
│  • List view with filtering/sorting                         │
│  • Provider cards with details                              │
│  • Precaution alerts                                        │
└─────────────────────────────────────────────────────────────┘
```

**Performance:**

- First query: 1-2 seconds (SPARQL + processing)
- Cached query: ~50ms (MongoDB lookup)
- Cache TTL: 5 minutes
