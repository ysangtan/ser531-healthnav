# Healthcare Navigator - Complete Setup Guide

This guide will walk you through setting up the Healthcare Navigator project from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Recommended)](#quick-start-recommended)
3. [Detailed Setup](#detailed-setup)
4. [Verification](#verification)
5. [Common Issues](#common-issues)

## Prerequisites

### Required

- **Node.js**: Version 18 or higher
  ```bash
  node --version  # Should be >= 18
  ```

- **Python**: Version 3.9 or higher
  ```bash
  python --version  # Should be >= 3.9
  ```

- **MongoDB**: Local installation or MongoDB Atlas account
  - **Option A - Local MongoDB**:
    ```bash
    # macOS (Homebrew)
    brew install mongodb-community
    brew services start mongodb-community

    # Ubuntu/Debian
    sudo apt-get install mongodb
    sudo systemctl start mongodb

    # Windows: Download from mongodb.com
    ```

  - **Option B - MongoDB Atlas**:
    - Create free account at https://www.mongodb.com/cloud/atlas
    - Create a cluster
    - Get connection string
    - Whitelist your IP address

### Optional (for full features)

- **Docker & Docker Compose**: For containerized deployment
  ```bash
  docker --version
  docker-compose --version
  ```

- **Ontotext GraphDB**: For full semantic search capabilities
  - Download from: https://www.ontotext.com/products/graphdb/download/
  - Free edition works fine for development

## Quick Start (Recommended)

This is the fastest way to get up and running with sample data.

### Step 1: Clone and Setup

```bash
# Navigate to project
cd healthnav

# Create backend .env file
cp backend/.env.example backend/.env

# Create frontend .env file
echo "VITE_API_URL=http://localhost:8000/api/v1" > healthnav-ui-kit/.env.local
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Edit .env if needed (especially MongoDB connection)
# nano .env  # or use your preferred editor

# Seed database with sample data
python ops/seed.py

# Start backend server
python -m app.main
```

You should see:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Frontend Setup

Open a **new terminal** (keep backend running):

```bash
# Navigate to frontend
cd healthnav/healthnav-ui-kit

# Install dependencies
npm install

# Start development server
npm run dev
```

You should see:
```
  VITE v5.4.19  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 4: Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health

## Detailed Setup

### Backend Detailed Setup

#### 1. Install Python Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install --upgrade pip
pip install -r requirements.txt
```

#### 2. Configure Environment

Edit `backend/.env`:

```env
# MongoDB - REQUIRED
MONGODB_URL=mongodb://localhost:27017
# For MongoDB Atlas, use:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/

MONGODB_DB_NAME=healthnav

# GraphDB - OPTIONAL (works without it)
GRAPHDB_URL=http://localhost:7200
GRAPHDB_REPOSITORY=healthnav

# CORS - Add your frontend URL
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Application
DEBUG=true
ENVIRONMENT=development

# Data defaults (Phoenix, AZ area)
DEFAULT_LAT=33.4484
DEFAULT_LNG=-112.0740
DEFAULT_RADIUS_MILES=25

# Features
ENABLE_CACHING=true
```

#### 3. Verify MongoDB Connection

```bash
# Test MongoDB connection
python -c "
from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
print('MongoDB version:', client.server_info()['version'])
print('Connection successful!')
"
```

#### 4. Generate and Seed Sample Data

```bash
# Generate sample data
python ops/generate_sample_data.py

# Seed MongoDB
python ops/seed.py
```

Expected output:
```
============================================================
Healthcare Navigator - Database Seeding
============================================================

[1/4] Connecting to MongoDB...
✓ Connected to MongoDB

[2/4] Generating sample data...
✓ Generated:
  - 8 hospitals
  - 50 providers
  - 20 pharmacies
  - 21 specialties

[3/4] Seeding MongoDB...
✓ Cached 8 hospitals
✓ Cached 50 providers
✓ Cached 20 pharmacies

[4/4] Verifying seeded data...
✓ Verified:
  - 8 hospitals in cache
  - 50 providers in cache
  - 20 pharmacies in cache

============================================================
✓ Database seeding completed successfully!
============================================================
```

#### 5. Start Backend Server

```bash
# Development mode (with auto-reload)
python -m app.main

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 6. Test Backend

```bash
# In a new terminal, test the API
curl http://localhost:8000/api/v1/health

# Should return:
# {
#   "status": "healthy",
#   "version": "1.0.0",
#   "graphdb_connected": false,
#   "mongodb_connected": true
# }
```

### Frontend Detailed Setup

#### 1. Install Node Dependencies

```bash
cd healthnav-ui-kit
npm install
```

If you encounter issues, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 2. Configure Environment

Create `.env.local`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

#### 3. Verify Configuration

```bash
# Check that Vite can read the env variable
npm run dev -- --clearCache
```

#### 4. Start Development Server

```bash
npm run dev
```

Options:
```bash
# Expose to network
npm run dev -- --host

# Use different port
npm run dev -- --port 3000

# Open in browser automatically
npm run dev -- --open
```

### Docker Setup (Alternative)

If you prefer using Docker:

#### 1. Using Docker Compose

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Seed database (one-time)
docker-compose exec backend python ops/seed.py

# Stop all services
docker-compose down

# Remove all data and start fresh
docker-compose down -v
docker-compose up -d
docker-compose exec backend python ops/seed.py
```

#### 2. Access Services

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- MongoDB: localhost:27017

## Verification

### 1. Backend Health Check

```bash
curl http://localhost:8000/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "graphdb_connected": false,
  "mongodb_connected": true
}
```

### 2. Test Search API

```bash
curl "http://localhost:8000/api/v1/search/providers?symptom=chest%20pain&limit=5"
```

### 3. Frontend Verification

1. Open http://localhost:5173
2. You should see the Healthcare Navigator interface
3. Try searching for a symptom like "chest pain"
4. You should see results appear

### 4. Database Verification

```bash
# Connect to MongoDB
mongo healthnav  # or mongosh healthnav

# Check collections
show collections

# Count documents
db.providers_cache.countDocuments()
db.hospitals_cache.countDocuments()
db.pharmacies_cache.countDocuments()

# View a sample provider
db.providers_cache.findOne()
```

## Common Issues

### Issue 1: MongoDB Connection Failed

**Error**: `Failed to connect to MongoDB`

**Solutions**:
```bash
# Check if MongoDB is running
# macOS:
brew services list | grep mongodb

# Ubuntu/Linux:
sudo systemctl status mongodb

# Start MongoDB if not running
# macOS:
brew services start mongodb-community

# Ubuntu/Linux:
sudo systemctl start mongodb

# Windows:
# Start MongoDB service from Services app
```

### Issue 2: Port Already in Use

**Error**: `Address already in use: 8000` or `Port 5173 is in use`

**Solutions**:
```bash
# Find and kill process using the port
# macOS/Linux:
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use different ports:
# Backend:
uvicorn app.main:app --port 8001

# Frontend:
npm run dev -- --port 3000
# Update .env.local: VITE_API_URL=http://localhost:8001/api/v1
```

### Issue 3: No Data in Frontend

**Problem**: Frontend loads but shows no providers/hospitals

**Solutions**:
1. Check backend is running: http://localhost:8000/api/v1/health
2. Verify database was seeded:
   ```bash
   cd backend
   python ops/seed.py
   ```
3. Check browser console for errors (F12)
4. Verify `.env.local` has correct API URL
5. Check CORS settings in `backend/.env`

### Issue 4: CORS Errors

**Error**: `Access to fetch at 'http://localhost:8000' blocked by CORS policy`

**Solution**:

Edit `backend/.env`:
```env
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

Restart backend after changes.

### Issue 5: Python Module Not Found

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows

# Reinstall dependencies
pip install -r requirements.txt

# Verify installation
pip list | grep fastapi
```

### Issue 6: npm Install Fails

**Error**: Various npm install errors

**Solutions**:
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use older Node version if necessary
nvm install 18
nvm use 18
npm install
```

### Issue 7: Frontend Can't Connect to Backend

**Problem**: API calls fail with network errors

**Checklist**:
1. ✓ Backend is running on port 8000
2. ✓ `.env.local` exists with `VITE_API_URL=http://localhost:8000/api/v1`
3. ✓ CORS origins include frontend URL in `backend/.env`
4. ✓ No firewall blocking localhost connections
5. ✓ Restart both frontend and backend

## Next Steps

After successful setup:

1. **Explore the API**: http://localhost:8000/docs
2. **Try Different Searches**: Test various symptoms and filters
3. **Customize Data**: Modify `ops/generate_sample_data.py` for custom data
4. **Set Up GraphDB** (optional): For full semantic search capabilities
5. **Deploy**: See deployment guides for production setup

## Getting Help

If you encounter issues not covered here:

1. Check the logs:
   ```bash
   # Backend logs
   python -m app.main  # Terminal output

   # Frontend logs
   # Browser console (F12)

   # Docker logs
   docker-compose logs backend
   docker-compose logs mongodb
   ```

2. Verify all prerequisites are met
3. Ensure all environment files are configured correctly
4. Try the Docker setup as an alternative

## Summary

Quick checklist for setup:

- [ ] MongoDB installed and running
- [ ] Python 3.9+ with virtual environment
- [ ] Backend dependencies installed
- [ ] Backend `.env` configured
- [ ] Database seeded
- [ ] Backend running on port 8000
- [ ] Node.js 18+ installed
- [ ] Frontend dependencies installed
- [ ] Frontend `.env.local` configured
- [ ] Frontend running on port 5173
- [ ] Health check passes
- [ ] Can see data in frontend

You're all set! 🎉
