# Healthcare Navigator - Quick Start Guide

Get your Healthcare Navigator up and running in 5 minutes!

## Prerequisites Check

Run these commands to verify you have everything:

```bash
node --version   # Should be >= 18
python3 --version # Should be >= 3.9
mongod --version  # Should return MongoDB version

# Start MongoDB if not running:
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongodb
```

## Three Ways to Start

### Option 1: One-Command Startup (Easiest) ⚡

```bash
./start.sh
```

This script will:
1. Check all prerequisites
2. Set up backend and install dependencies
3. Set up frontend and install dependencies
4. Seed the database with sample data
5. Start both servers
6. Open the app in your browser

**To stop everything:**
```bash
./stop.sh
```

### Option 2: Docker Compose (Recommended for Deployment) 🐳

```bash
# Start all services
docker-compose up -d

# Seed database (one-time)
docker-compose exec backend python ops/seed.py

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

### Option 3: Manual Setup (For Development) 🛠️

#### Terminal 1 - Backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python ops/seed.py
python -m app.main
```

#### Terminal 2 - Frontend:
```bash
cd healthnav-ui-kit
npm install
npm run dev
```

## Access Your Application

Once started, access:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health

## First Steps

1. **Test the Search**:
   - Go to http://localhost:5173
   - Enter a symptom like "chest pain" or "headache"
   - Adjust radius and filters
   - View results on the map

2. **Explore API**:
   - Visit http://localhost:8000/docs
   - Try the `/api/v1/search/symptom` endpoint
   - Test different parameters

3. **Browse Data**:
   - Click "Providers" to see all physicians
   - Click "Hospitals" to view hospitals
   - Use "Compare" feature to compare providers

## Common Commands

```bash
# Backend
cd backend
source venv/bin/activate
python -m app.main                    # Start server
python ops/seed.py                    # Reseed database
python ops/generate_sample_data.py    # Generate new data

# Frontend
cd healthnav-ui-kit
npm run dev                           # Start dev server
npm run build                         # Build for production
npm run preview                       # Preview production build

# Docker
docker-compose up -d                  # Start all services
docker-compose down                   # Stop all services
docker-compose logs backend           # View backend logs
docker-compose logs frontend          # View frontend logs
```

## Troubleshooting

### MongoDB Not Running
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Windows
# Start MongoDB service from Services app
```

### Port Already in Use
```bash
# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### No Data Showing
```bash
# Reseed the database
cd backend
source venv/bin/activate
python ops/seed.py
```

### Can't Connect to Backend
1. Check backend is running: `curl http://localhost:8000/api/v1/health`
2. Verify `.env.local` in frontend has: `VITE_API_URL=http://localhost:8000/api/v1`
3. Check CORS settings in `backend/.env`

## What's Included

**Sample Data:**
- 8 Hospitals in Phoenix, AZ area
- 50 Healthcare Providers across 21 specialties
- 20 Pharmacies
- 10+ Medical Conditions with symptoms
- Precautions for common symptoms

**Features:**
- Symptom-based search
- Location-based filtering (geospatial)
- Hospital quality ratings (HCAHPS)
- Interactive map visualization
- Provider comparison
- Pharmacy finder

## Next Steps

- Read the full [README.md](README.md) for detailed information
- Check [SETUP.md](SETUP.md) for detailed setup instructions
- Explore the [API Documentation](http://localhost:8000/docs)
- Customize sample data in `backend/ops/generate_sample_data.py`

## Getting Help

If you encounter issues:

1. Check logs:
   - Backend: `tail -f backend.log` or console output
   - Frontend: Browser console (F12)

2. Verify prerequisites are installed and running

3. Try the automated startup script: `./start.sh`

4. Use Docker Compose for a clean environment

## Project Structure

```
healthnav/
├── backend/              # FastAPI backend
│   ├── app/             # Application code
│   ├── ops/             # Database seeding scripts
│   └── .env             # Backend configuration
├── healthnav-ui-kit/    # React frontend
│   ├── src/             # Frontend code
│   └── .env.local       # Frontend configuration
├── start.sh             # Quick start script
├── stop.sh              # Stop script
└── docker-compose.yml   # Docker configuration
```

## Summary

🎯 **Goal**: Healthcare navigation system with symptom search, provider matching, and interactive maps

🛠️ **Tech**: FastAPI + React + MongoDB + GraphDB (optional)

📊 **Data**: Real-world structure based on CMS data with sample Phoenix, AZ providers

🚀 **Deploy**: Ready for Docker deployment, includes Docker Compose config

---

**Ready to start?** Run `./start.sh` and visit http://localhost:5173

Enjoy using Healthcare Navigator! 🏥
