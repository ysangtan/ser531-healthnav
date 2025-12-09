# 🚀 Healthcare Navigator - START HERE

## Quick Setup Guide for Ontotext GraphDB Integration

This guide gets you from zero to a running knowledge graph-powered healthcare navigator in **~1 hour**.

---

## ✅ Prerequisites Check

Run these commands to verify:

```bash
# 1. Node.js (for frontend)
node --version
# Need: >= 18.0.0

# 2. Python (for backend)
python3 --version
# Need: >= 3.9.0

# 3. MongoDB (for cache)
mongod --version
# Need: >= 5.0.0

# 4. Docker (optional, for GraphDB)
docker --version
# Need: >= 20.0.0
```

**Install missing prerequisites:**

```bash
# macOS
brew install node python@3.11 mongodb-community docker

# Ubuntu/Linux
sudo apt-get install nodejs python3.11 mongodb docker.io
```

---

## 📦 Step 1: Install Ontotext GraphDB (Choose One)

### Option A: GraphDB Desktop (Easiest - Recommended)

```bash
# macOS
brew install --cask graphdb-desktop

# Start GraphDB Desktop (GUI will open)
open -a GraphDB

# OR manually start and access at:
# http://localhost:7200
```

### Option B: Docker (For Production)

```bash
# Pull and run GraphDB
docker run -d \
  --name healthnav-graphdb \
  -p 7200:7200 \
  -v $(pwd)/graphdb-data:/opt/graphdb/home \
  -e GDB_JAVA_OPTS="-Xmx2g -Xms1g" \
  ontotext/graphdb:10.6.3-free

# Check logs
docker logs -f healthnav-graphdb

# Wait for: "Started GraphDB"
```

### Option C: Use Docker Compose (All Services)

```bash
# Start GraphDB + MongoDB together
docker-compose up -d graphdb mongodb

# Check status
docker-compose ps
```

**Verify GraphDB is running:**
```bash
curl http://localhost:7200/rest/repositories
# Should return: []  (empty list initially)
```

---

## 🔧 Step 2: Setup Backend

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python3 -m venv venv

# 3. Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# 4. Install dependencies
pip install -r requirements.txt

# 5. Verify .env file exists
cat .env
# Should see: GRAPHDB_URL=http://localhost:7200
```

---

## 📊 Step 3: Generate & Load Data into GraphDB

This is the **critical step** where we load the knowledge graph!

```bash
# Make sure you're in backend/ with venv activated
cd backend
source venv/bin/activate

# Run complete seeding (does everything)
python ops/seed_complete.py
```

**What this does:**
1. ✅ Generates RDF/Turtle (.ttl) data files
2. ✅ Creates `healthnav` repository in GraphDB
3. ✅ Loads ontology (`HealthcareNavigator_Team4.owl`)
4. ✅ Loads all data files into GraphDB
5. ✅ Validates data with SPARQL queries
6. ✅ Sets up MongoDB cache

**Expected output:**
```
======================================================================
 Healthcare Navigator - Complete Data Seeding
 Following PDF Architecture: GraphDB → MongoDB Cache
======================================================================

[1/5] Generating RDF/Turtle data files...
✓ Generated: specialties.ttl
✓ Generated: conditions_symptoms.ttl
...

[2/5] Loading data into GraphDB (source of truth)...
✓ Connected to GraphDB
✓ Repository 'healthnav' created successfully
Loading healthnav.owl... ✓
Loading specialties.ttl... ✓
...
Total triples loaded: 2847

[3/5] Validating GraphDB data...
✓ GraphDB connection successful
✓ Found 21 specialties in GraphDB
✓ Found 3 hospitals in GraphDB

[4/5] Generating MongoDB cache from GraphDB...
✓ Connected to MongoDB
✓ MongoDB cache ready

[5/5] Final verification...
✓ Data Flow Architecture:
  1. GraphDB      → Source of Truth (RDF/OWL)
  2. SPARQL       → Query language
  3. FastAPI      → Orchestration layer
  4. MongoDB      → Cache layer (performance)
  5. React        → Frontend

✓ Seeding complete!
```

---

## 🚀 Step 4: Start Backend API

```bash
# In backend/ directory with venv activated
python -m app.main
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Test the API:**

```bash
# In a new terminal:

# 1. Health check
curl http://localhost:8000/api/v1/health

# Expected:
# {
#   "status": "healthy",
#   "version": "1.0.0",
#   "graphdb_connected": true,   ← Should be true!
#   "mongodb_connected": true
# }

# 2. Search by symptom (first query - will query GraphDB)
curl "http://localhost:8000/api/v1/search/providers?symptom=chest%20pain&limit=5"

# Watch backend logs - should see:
# INFO: ✗ Cache MISS - Querying GraphDB for symptom: chest pain
# INFO: GraphDB returned X results
# INFO: ✓ Cached result for symptom: chest pain

# 3. Same query again (should use cache)
curl "http://localhost:8000/api/v1/search/providers?symptom=chest%20pain&limit=5"

# Watch backend logs - should see:
# INFO: ✓ Cache HIT for symptom: chest pain
```

---

## 🎨 Step 5: Start Frontend

```bash
# In a NEW terminal (keep backend running)

# 1. Navigate to frontend
cd healthnav-ui-kit

# 2. Install dependencies (first time only)
npm install

# 3. Start development server
npm run dev
```

**Expected output:**
```
  VITE v5.4.19  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Open your browser:**
- http://localhost:5173

**Try it out:**
1. Enter symptom: "chest pain"
2. See providers appear
3. View on map
4. Check backend logs - first search queries GraphDB, second uses cache!

---

## 🔍 Step 6: Explore GraphDB (Optional but Cool!)

**Open GraphDB Workbench:**
- http://localhost:7200

**Navigate to:**
1. **Repositories** → Select `healthnav`
2. **Explore** → See class hierarchy
   - Physician
   - Hospital
   - Symptom
   - MedicalCondition
3. **SPARQL** → Try queries:

```sparql
PREFIX : <http://example.org/healthnav#>

# Count all entities
SELECT ?type (COUNT(?s) as ?count)
WHERE {
    ?s a ?type .
    FILTER (STRSTARTS(STR(?type), "http://example.org/healthnav#"))
}
GROUP BY ?type
ORDER BY DESC(?count)
```

```sparql
PREFIX : <http://example.org/healthnav#>

# Find physicians treating chest pain
SELECT DISTINCT ?physicianName ?hospitalName ?hcahpsScore
WHERE {
    ?symptom a :Symptom ;
             :name ?symptomName .
    FILTER (CONTAINS(LCASE(?symptomName), "chest pain"))

    ?condition :hasSymptom ?symptom .
    ?physician :name ?physicianName ;
              :treatsCondition ?condition .

    OPTIONAL {
        ?physician :affiliatedWith ?hospital .
        ?hospital :name ?hospitalName ;
                 :hcahpsOverallScore ?hcahpsScore .
    }
}
ORDER BY DESC(?hcahpsScore)
LIMIT 10
```

---

## ✅ Verification Checklist

Run through this checklist to ensure everything is working:

- [ ] GraphDB running at http://localhost:7200
- [ ] GraphDB repository `healthnav` exists
- [ ] GraphDB has data (check in Workbench → Explore)
- [ ] MongoDB running on port 27017
- [ ] Backend API running on port 8000
- [ ] `/api/v1/health` shows `graphdb_connected: true`
- [ ] First symptom search logs "Cache MISS - Querying GraphDB"
- [ ] Second identical search logs "Cache HIT"
- [ ] Frontend running on port 5173
- [ ] Frontend can search and display results
- [ ] Map shows provider locations

---

## 🐛 Troubleshooting

### GraphDB won't start

```bash
# Check if port 7200 is in use
lsof -i :7200

# Kill process if needed
lsof -ti:7200 | xargs kill -9

# Check GraphDB logs
tail -f ~/Library/Application\ Support/com.ontotext.graphdb/logs/main.log
```

### Repository creation fails

```bash
# Try creating manually via Workbench:
# 1. Go to http://localhost:7200
# 2. Setup → Repositories → Create new repository
# 3. ID: healthnav
# 4. Ruleset: RDFS-Plus (Optimized)
# 5. Click Create
```

### Backend shows "graphdb_connected: false"

```bash
# Check GraphDB is running
curl http://localhost:7200/rest/repositories

# Check backend .env has correct URL
cat backend/.env | grep GRAPHDB_URL
# Should be: GRAPHDB_URL=http://localhost:7200

# Restart backend
```

### No data in GraphDB

```bash
# Re-run seeding
cd backend
source venv/bin/activate
python ops/seed_complete.py
```

### MongoDB connection failed

```bash
# Start MongoDB
# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongodb

# Verify:
mongosh --eval "db.version()"
```

---

## 📚 Documentation

For more details, see:

| Document | Purpose |
|----------|---------|
| `ONTOTEXT_GRAPHDB_GUIDE.md` | Complete GraphDB setup & SPARQL queries |
| `GRAPHDB_IMPLEMENTATION_PLAN.md` | Detailed implementation steps |
| `IMPLEMENTATION_SUMMARY.md` | Architecture overview |
| `README.md` | Project overview |
| `SETUP.md` | Detailed troubleshooting |

---

## 🎯 Architecture Summary

```
┌─────────────┐
│   Frontend  │  React + TypeScript
│   :5173     │  User Interface
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│   Backend   │  FastAPI
│   :8000     │  Orchestration
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐  ┌──────────────┐
│   GraphDB   │  │   MongoDB    │
│   :7200     │  │   :27017     │
│             │  │              │
│ SOURCE OF   │  │ CACHE ONLY   │
│ TRUTH       │  │ (performance)│
│             │  │              │
│ - RDF/OWL   │  │ - Query      │
│ - SPARQL    │  │   cache      │
│ - Reasoning │  │ - TTL        │
└─────────────┘  └──────────────┘
```

**Data Flow:**
1. User searches for "chest pain"
2. Frontend → Backend API
3. Backend checks MongoDB cache
4. **Cache MISS** → Query GraphDB via SPARQL
5. Process results, calculate distances, rank
6. Store in MongoDB cache
7. Return to user
8. **Next query** → Cache HIT! Fast response

---

## 🎉 Success!

You now have a **fully functional knowledge graph-powered healthcare navigator**!

**What you've built:**
- ✅ RDF/OWL ontology in GraphDB
- ✅ Semantic search via SPARQL
- ✅ MongoDB caching for performance
- ✅ FastAPI backend orchestration
- ✅ React frontend with maps
- ✅ Docker deployment ready

**As specified in your PDF deliverable!**

---

## 🚀 Next Steps

1. **Explore the data** in GraphDB Workbench
2. **Try different symptoms** in the frontend
3. **Watch the logs** to see cache hits/misses
4. **Customize the data** by editing `generate_ttl_data.py`
5. **Add more SPARQL queries** in `app/db/graphdb.py`
6. **Deploy** using `docker-compose up`

---

**Questions?** Check the documentation or the backend logs!

**Happy navigating!** 🏥🗺️
