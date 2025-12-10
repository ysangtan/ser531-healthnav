# Healthcare Navigator

A knowledge graph-driven healthcare navigation system that helps patients find suitable physicians, hospitals, and pharmacies based on symptoms, location, and preferences.

## Project Overview

Healthcare Navigator integrates heterogeneous public datasets into a unified semantic knowledge graph to provide:
- **Symptom-based Search**: Find providers and get precautionary information based on symptoms
- **Multi-faceted Queries**: Filter by location, specialty, hospital quality ratings
- **Interactive Visualization**: Map-based interface showing providers, hospitals, and pharmacies
- **Semantic Integration**: Knowledge graph powered by OWL ontology and SPARQL queries

### Key Features

1. **Symptom-to-Provider Matching**: Enter symptoms to find relevant specialists
2. **Hospital Quality Ratings**: HCAHPS scores for patient satisfaction
3. **Geospatial Search**: Find nearby providers within a specified radius
4. **Pharmacy Locator**: Locate pharmacies near providers or your location
5. **Specialty Filtering**: Filter by medical specialties
6. **Interactive Map**: Visualize all results on an integrated map

## Architecture

### High-Level Design

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   GraphDB   │
│  (React +   │     │  (FastAPI)  │     │ (Knowledge  │
│   Vite)     │     │             │     │   Graph)    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   MongoDB   │
                    │   (Cache)   │
                    └─────────────┘
```

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- TailwindCSS + shadcn/ui
- Mapbox GL JS
- React Query

**Backend:**
- FastAPI (Python)
- MongoDB (caching layer)
- Ontotext GraphDB (knowledge graph)
- SPARQL for semantic queries

**Data Sources:**
- CMS Provider Data (physicians)
- HCAHPS (hospital ratings)
- OpenStreetMap (pharmacies)
- Custom ontology (symptoms/conditions)

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB (required for backend)
- Ontotext GraphDB 10.6+ (required for backend semantic queries)

**Note**: The frontend includes an automatic fallback system. If the backend is unavailable, the app will seamlessly switch to demo data, allowing you to explore the UI without a full backend setup.

### Option 1: Docker Compose (Recommended)

1. **Clone and navigate to project**:
   ```bash
   cd healthnav
   ```

2. **Start services**:
   ```bash
   docker-compose up -d
   ```

3. **Seed the database**:
   ```bash
   docker-compose exec backend python ops/seed.py
   ```

4. **Start frontend** (in a separate terminal):
   ```bash
   cd healthnav-ui-kit
   npm install
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Option 2: Local Development

#### Backend Setup

1. **Navigate to backend**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection details
   ```

5. **Start MongoDB**:
   ```bash
   # Ensure MongoDB is running on localhost:27017
   mongod
   ```

6. **Seed database**:
   ```bash
   python ops/seed.py
   ```

7. **Run backend**:
   ```bash
   python -m app.main
   ```

#### Frontend Setup

1. **Navigate to frontend**:
   ```bash
   cd healthnav-ui-kit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   # Create .env.local file
   echo "VITE_API_URL=http://localhost:8000/api/v1" > .env.local
   ```

4. **Run frontend**:
   ```bash
   npm run dev
   ```

5. **Access application**: http://localhost:5173

### Option 3: Full Stack with GraphDB (Complete Integration)

This option sets up the complete semantic knowledge graph integration.

#### Step 1: Install and Start GraphDB

1. **Download Ontotext GraphDB**:
   - Visit https://www.ontotext.com/products/graphdb/download/
   - Download GraphDB Free (version 10.6.3 recommended)
   - Or use Docker:
     ```bash
     docker run -d -p 7200:7200 ontotext/graphdb:10.6.3-free
     ```

2. **Start GraphDB**:
   - If using standalone: Launch GraphDB Workbench
   - Access GraphDB at http://localhost:7200

3. **Create Repository**:
   - Open GraphDB Workbench (http://localhost:7200)
   - Click "Setup" → "Repositories"
   - Click "Create new repository"
   - Repository ID: `healthnav`
   - Repository type: GraphDB Free
   - Click "Create"

#### Step 2: Start MongoDB

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB

# Or with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Verify MongoDB is running:
```bash
mongosh --eval "db.version()"
```

#### Step 3: Setup Backend

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment** (create `.env` file):
   ```env
   # MongoDB Configuration
   MONGODB_URL=mongodb://localhost:27017
   MONGODB_DB_NAME=healthnav

   # GraphDB Configuration
   GRAPHDB_URL=http://localhost:7200
   GRAPHDB_REPOSITORY=healthnav

   # CORS Settings
   CORS_ORIGINS=["http://localhost:5173","http://localhost:8080"]

   # Features
   ENABLE_CACHING=true
   DEFAULT_RADIUS_MILES=25
   ```

5. **Generate and load RDF data into GraphDB**:
   ```bash
   # Generate TTL (Turtle) files
   python ops/generate_ttl_data.py

   # Seed GraphDB repository with RDF triples
   python ops/seed_graphdb.py
   ```

   This will create ~3,000 RDF triples including:
   - 30 physicians with specialties
   - 3 hospitals with HCAHPS scores
   - 15 pharmacies
   - 21 medical specialties
   - Conditions and symptom relationships

6. **Start the backend server**:
   ```bash
   python -m app.main
   ```

   Expected output:
   ```
   INFO:     Started server process
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

7. **Verify backend health**:
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

   Expected response:
   ```json
   {
     "status": "healthy",
     "graphdb_connected": true,
     "mongodb_connected": true
   }
   ```

#### Step 4: Setup Frontend

1. **Navigate to frontend directory** (in a new terminal):
   ```bash
   cd healthnav-ui-kit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** (create `.env.local` file):
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```

4. **Start frontend development server**:
   ```bash
   npm run dev
   ```

   Expected output:
   ```
   VITE v5.4.19  ready in 292 ms
   ➜  Local:   http://localhost:8080/
   ```

5. **Access the application**:
   - Open http://localhost:8080 in your browser
   - You should see a green "Connected to backend" banner (auto-hides after 3s)
   - No "(Demo Data)" indicators should be visible
   - All data is now coming from the GraphDB knowledge graph!

#### Verification Steps

1. **Check Backend Connectivity**:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Refresh the page
   - Look for successful requests to:
     - `/api/v1/health` (should return 200)
     - `/api/v1/providers` (should return array of providers)
     - `/api/v1/hospitals` (should return array of hospitals)

2. **Verify GraphDB Integration**:
   - Navigate to Search page
   - Enter a symptom (e.g., "chest pain")
   - Click Search
   - Network tab should show `POST /api/v1/search/symptom`
   - Results should come from SPARQL queries to GraphDB

3. **Test Fallback System**:
   - Stop the backend server (Ctrl+C in backend terminal)
   - Refresh the frontend
   - Banner should show "Using demo data - Backend unavailable"
   - App continues to work with mock data
   - Restart backend to reconnect

#### Troubleshooting

**GraphDB Connection Failed**:
- Ensure GraphDB is running: http://localhost:7200
- Verify repository `healthnav` exists in GraphDB Workbench
- Check `.env` has correct `GRAPHDB_URL` and `GRAPHDB_REPOSITORY`

**MongoDB Connection Failed**:
- Ensure MongoDB is running: `mongosh --eval "db.version()"`
- Check `.env` has correct `MONGODB_URL`

**Frontend Shows "Using demo data"**:
- Verify backend health endpoint returns `"status": "healthy"`
- Check browser console for CORS errors
- Ensure `VITE_API_URL` in `.env.local` points to http://localhost:8000/api/v1

**Port Conflicts**:
- Backend requires port 8000 (change with `--port` flag)
- Frontend runs on 8080 or 5173 (Vite auto-selects)
- GraphDB requires port 7200
- MongoDB requires port 27017

## Frontend Fallback System

The frontend includes an intelligent fallback mechanism for offline-first development:

**How It Works**:
1. On page load, frontend attempts to connect to backend via health check
2. If backend is available:
   - Status banner briefly shows "Connected to backend" (green, auto-hides)
   - All data fetched from API endpoints
   - Real-time SPARQL queries executed on GraphDB
3. If backend is unavailable:
   - Status banner shows "Using demo data - Backend unavailable" (yellow)
   - App automatically switches to mock data
   - All features remain functional
   - User can click "Retry" to attempt reconnection

**Benefits**:
- **No backend required** for UI development and testing
- **Graceful degradation** when backend goes down
- **Seamless recovery** when backend comes back online
- **Full offline capability** with realistic demo data

**Implementation**:
- Located in `healthnav-ui-kit/src/lib/dataProvider.ts`
- Uses React Query for caching and automatic refetching
- Status monitoring in `healthnav-ui-kit/src/lib/hooks/useBackendStatus.ts`
- Visual feedback via `BackendStatusBanner` component

## Project Structure

```
healthnav/
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── api/routes/          # API endpoints
│   │   ├── core/                # Configuration
│   │   ├── db/                  # Database clients
│   │   ├── models/              # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   └── main.py              # FastAPI app
│   ├── ops/
│   │   ├── generate_sample_data.py
│   │   └── seed.py              # Database seeding
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── README.md
├── healthnav-ui-kit/            # React frontend
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── layout/         # Layout components (AppLayout, TopNav, etc.)
│   │   │   ├── search/         # Search components (SearchBar, Filters, etc.)
│   │   │   ├── providers/      # Provider components (ProviderCard, etc.)
│   │   │   ├── map/            # MapView component
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   └── BackendStatusBanner.tsx  # Connection status indicator
│   │   ├── pages/              # Page components
│   │   │   ├── Search.tsx      # Main search page
│   │   │   ├── Providers.tsx   # All providers list
│   │   │   ├── Hospitals.tsx   # All hospitals list
│   │   │   ├── ProviderDetail.tsx
│   │   │   └── HospitalDetail.tsx
│   │   ├── lib/                # Utilities & API integration
│   │   │   ├── api.ts          # API client (Axios)
│   │   │   ├── config.ts       # Environment configuration
│   │   │   ├── dataProvider.ts # API hooks with fallback logic
│   │   │   └── hooks/
│   │   │       ├── useApi.ts           # React Query hooks
│   │   │       └── useBackendStatus.ts # Backend connectivity monitor
│   │   ├── data/               # Type definitions & mock data
│   │   │   ├── providers.ts    # Provider interface & mock
│   │   │   ├── hospitals.ts    # Hospital interface & mock
│   │   │   └── pharmacies.ts   # Pharmacy interface & mock
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.local              # Environment variables
├── HealthcareNavigator_Team4.owl # OWL ontology
├── TESTING_CHECKLIST.md        # Comprehensive testing guide
├── INTEGRATION.md              # Integration architecture docs
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Health
- `GET /api/v1/health` - Health check

### Search
- `POST /api/v1/search/symptom` - Search by symptom
- `GET /api/v1/search/providers` - Search providers with filters

### Providers
- `GET /api/v1/providers` - List all providers
- `GET /api/v1/providers/{id}` - Get provider details

### Hospitals
- `GET /api/v1/hospitals` - List all hospitals
- `GET /api/v1/hospitals/{id}` - Get hospital details

### Pharmacies
- `GET /api/v1/pharmacies` - Search pharmacies by location

### Specialties
- `GET /api/v1/specialties` - List all medical specialties

## Ontology Structure

The Healthcare Navigator ontology (`HealthcareNavigator_Team4.owl`) defines:

**Classes:**
- `Patient`, `Physician`, `Hospital`, `Pharmacy`
- `MedicalCondition`, `Symptom`, `Precaution`
- `Specialty`, `InsurancePlan`
- `Address`, `GeoLocation`, `Rating`

**Properties:**
- `hasSymptom`, `treatsCondition`, `recommendedPrecaution`
- `affiliatedWith`, `locatedAt`, `acceptsInsurance`
- `hasSpecialty`, `hasPrimaryPhysician`

## Usage Examples

### Search by Symptom

1. Enter a symptom (e.g., "chest pain")
2. Set your location or use default
3. Adjust filters (radius, minimum HCAHPS score)
4. View results on map and list

### Find Providers by Specialty

1. Navigate to Search page
2. Select specialties from filter
3. Set radius and other preferences
4. Browse providers sorted by quality and distance

### Compare Hospitals

1. Browse providers or hospitals
2. Click "Compare" button on multiple items
3. View side-by-side comparison
4. See detailed metrics and ratings

## Development

### Backend Development

```bash
cd backend

# Run with auto-reload
uvicorn app.main:app --reload

# Run tests
pytest tests/

# Format code
black app/
```

### Frontend Development

```bash
cd healthnav-ui-kit

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Configuration

### Backend (.env)

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=healthnav

# GraphDB (optional)
GRAPHDB_URL=http://localhost:7200
GRAPHDB_REPOSITORY=healthnav

# CORS
CORS_ORIGINS=["http://localhost:5173"]

# Features
ENABLE_CACHING=true
DEFAULT_RADIUS_MILES=25
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Testing

See **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** for a comprehensive manual testing guide covering:

- Frontend standalone mode (backend offline)
- Full stack integration (backend online)
- Backend failure and recovery scenarios
- Error handling and edge cases
- Data consistency with optional fields
- Performance benchmarks
- Browser compatibility
- Mobile responsiveness
- Accessibility compliance

Quick test commands:

```bash
# Backend tests (if available)
cd backend
pytest tests/

# Frontend TypeScript check
cd healthnav-ui-kit
npm run build  # Checks for type errors

# Manual testing
npm run dev    # Start dev server and follow checklist
```

## Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build -d

# Seed database
docker-compose exec backend python ops/seed.py

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Integration Architecture

For detailed information about the frontend-backend integration and the fallback system, see **[INTEGRATION.md](./INTEGRATION.md)**.

Key integration features:
- Automatic API fallback to mock data
- Real-time backend status monitoring
- Graceful error handling
- TypeScript type safety with optional fields
- React Query for efficient data fetching and caching

## License

This project is part of the SER531 course at Arizona State University.

## Acknowledgments

- CMS for provider and hospital data
- OpenStreetMap for pharmacy locations
- ASU SER531 course instructors

## Contact

For questions or issues, please contact the team members listed above.
