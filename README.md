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
- MongoDB
- (Optional) Ontotext GraphDB

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
│   │   ├── pages/               # Page components
│   │   ├── lib/                 # Utilities & API client
│   │   ├── data/                # Type definitions
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── HealthcareNavigator_Team4.owl # OWL ontology
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

### Production Deployment

1. **Backend**: Deploy to AWS EC2, Google Cloud Run, or similar
2. **Frontend**: Deploy to Vercel, Netlify, or S3 + CloudFront
3. **MongoDB**: Use MongoDB Atlas for managed database
4. **GraphDB**: Deploy on dedicated server or use Ontotext Cloud

## Troubleshooting

### Backend won't start
- Ensure MongoDB is running
- Check `.env` configuration
- Verify Python version (3.9+)

### Frontend can't connect to backend
- Check `VITE_API_URL` in `.env.local`
- Verify backend is running on correct port
- Check CORS settings in backend `.env`

### No data showing
- Run seed script: `python ops/seed.py`
- Check MongoDB connection
- Verify data in MongoDB collections

### Docker issues
- Run `docker-compose down -v` to reset volumes
- Rebuild: `docker-compose up --build`
- Check logs: `docker-compose logs backend`

## Team

- **Rahul Marathervar** - Data & Ontology, Infrastructure
- **Balaji Radhakrishnan Padmanabhan** - Backend & Infrastructure
- **Akshat Aggarwal** - Backend & Data
- **Yogesh Sangtani** - Frontend & Data
- **Charani Tirumalareddy** - Data & Ontology

## License

This project is part of the SER531 course at Arizona State University.

## Acknowledgments

- CMS for provider and hospital data
- OpenStreetMap for pharmacy locations
- ASU SER531 course instructors

## Contact

For questions or issues, please contact the team members listed above.
