# Healthcare Navigator Backend

Backend API for the Healthcare Navigator project - a knowledge graph-driven healthcare navigation system.

## Features

- **Symptom-based Search**: Semantic search through medical knowledge graph
- **Provider Search**: Find healthcare providers with advanced filters
- **Geospatial Queries**: Location-based search with distance calculations
- **Hospital Information**: Browse hospitals with quality ratings (HCAHPS scores)
- **Pharmacy Finder**: Locate nearby pharmacies
- **Caching Layer**: MongoDB caching for improved performance
- **Knowledge Graph**: GraphDB integration for semantic queries

## Tech Stack

- **Framework**: FastAPI
- **Databases**:
  - GraphDB (Ontotext) - Knowledge Graph
  - MongoDB - Caching layer
- **Python**: 3.9+

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── routes/          # API endpoints
│   ├── core/
│   │   └── config.py        # Application configuration
│   ├── db/
│   │   ├── graphdb.py       # GraphDB client
│   │   └── mongodb.py       # MongoDB client
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── services/
│   │   ├── geo.py           # Geospatial utilities
│   │   └── search.py        # Search logic
│   └── main.py              # FastAPI application
├── ops/
│   ├── generate_sample_data.py
│   └── seed.py              # Database seeding script
├── requirements.txt
├── .env.example
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.9+
- MongoDB (local or MongoDB Atlas)
- Ontotext GraphDB (optional - for full knowledge graph features)

### Installation

1. **Clone and navigate to backend**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # MongoDB (required)
   MONGODB_URL=mongodb://localhost:27017
   MONGODB_DB_NAME=healthnav

   # GraphDB (optional for demo)
   GRAPHDB_URL=http://localhost:7200
   GRAPHDB_REPOSITORY=healthnav

   # CORS - add your frontend URL
   CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
   ```

5. **Seed the database**:
   ```bash
   python ops/seed.py
   ```

   This will generate sample data and populate MongoDB cache.

6. **Run the server**:
   ```bash
   python -m app.main
   ```

   Or with auto-reload:
   ```bash
   uvicorn app.main:app --reload
   ```

7. **Access the API**:
   - API: http://localhost:8000
   - Interactive Docs: http://localhost:8000/docs
   - Health Check: http://localhost:8000/api/v1/health

## API Endpoints

### Health Check
- `GET /api/v1/health` - Check API and database connections

### Search
- `POST /api/v1/search/symptom` - Search by symptom
- `POST /api/v1/search/providers` - Search providers with filters
- `GET /api/v1/search/providers` - Search providers (GET method)

### Providers
- `GET /api/v1/providers` - Get all providers
- `GET /api/v1/providers/{id}` - Get provider by ID

### Hospitals
- `GET /api/v1/hospitals` - Get all hospitals
- `GET /api/v1/hospitals/{id}` - Get hospital by ID

### Pharmacies
- `POST /api/v1/pharmacies/search` - Search pharmacies by location
- `GET /api/v1/pharmacies` - Get nearby pharmacies

### Specialties
- `GET /api/v1/specialties` - Get all medical specialties

## Example API Calls

### Search by Symptom
```bash
curl -X POST "http://localhost:8000/api/v1/search/symptom" \
  -H "Content-Type: application/json" \
  -d '{
    "symptom": "chest pain",
    "lat": 33.4484,
    "lng": -112.0740,
    "radius": 25,
    "minHcahps": 80,
    "limit": 10
  }'
```

### Search Providers
```bash
curl "http://localhost:8000/api/v1/search/providers?symptom=headache&radius=10&lat=33.4484&lng=-112.0740"
```

### Get Nearby Pharmacies
```bash
curl "http://localhost:8000/api/v1/pharmacies?lat=33.4484&lng=-112.0740&radius=5"
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DB_NAME` | MongoDB database name | `healthnav` |
| `GRAPHDB_URL` | GraphDB URL | `http://localhost:7200` |
| `GRAPHDB_REPOSITORY` | GraphDB repository name | `healthnav` |
| `CORS_ORIGINS` | Allowed CORS origins (JSON array) | `["http://localhost:5173"]` |
| `ENABLE_CACHING` | Enable MongoDB caching | `true` |
| `DEFAULT_RADIUS_MILES` | Default search radius | `25` |

## Development

### Running Tests
```bash
pytest tests/
```

### Code Formatting
```bash
black app/
```

### Type Checking
```bash
mypy app/
```

## Deployment

### Docker
```bash
docker build -t healthnav-backend .
docker run -p 8000:8000 healthnav-backend
```

### Environment-specific Configurations

For production, update `.env`:
```env
DEBUG=false
ENVIRONMENT=production
SECRET_KEY=<your-secure-key>
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

### GraphDB Not Available
- The app works without GraphDB using cached data
- To use full semantic search, install GraphDB and load the ontology

### CORS Errors
- Add your frontend URL to `CORS_ORIGINS` in `.env`
- Restart the backend after changing `.env`

## License

Part of the Healthcare Navigator project - ASU SER531 Course Project

## Contributors

- Rahul Marathervar
- Balaji Radhakrishnan Padmanabhan
- Akshat Aggarwal
- Yogesh Sangtani
- Charani Tirumalareddy
