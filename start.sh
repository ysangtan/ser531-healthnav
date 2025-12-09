#!/bin/bash

# Healthcare Navigator Startup Script

set -e

echo "=================================="
echo "Healthcare Navigator Startup"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "\n${BLUE}[1/6]${NC} Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗${NC} Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗${NC} Python is not installed. Please install Python 3.9+ first."
    exit 1
fi
echo -e "${GREEN}✓${NC} Python $(python3 --version)"

# Check MongoDB
if ! command -v mongod &> /dev/null && ! nc -z localhost 27017 &> /dev/null; then
    echo -e "${RED}✗${NC} MongoDB is not installed or not running."
    echo "Please install MongoDB or start the MongoDB service."
    exit 1
fi
echo -e "${GREEN}✓${NC} MongoDB is available"

# Setup backend
echo -e "\n${BLUE}[2/6]${NC} Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
if [ ! -f "venv/.dependencies_installed" ]; then
    echo "Installing Python dependencies..."
    pip install --quiet --upgrade pip
    pip install --quiet -r requirements.txt
    touch venv/.dependencies_installed
else
    echo "Dependencies already installed"
fi

# Check if database needs seeding
if ! python3 -c "from app.db.mongodb import mongodb_client; import asyncio; asyncio.run(mongodb_client.connect()); asyncio.run(mongodb_client.test_connection())" &> /dev/null; then
    echo "Seeding database..."
    python3 ops/seed.py
fi

echo -e "${GREEN}✓${NC} Backend setup complete"

# Setup frontend
echo -e "\n${BLUE}[3/6]${NC} Setting up frontend..."
cd ../healthnav-ui-kit

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install --silent
else
    echo "Dependencies already installed"
fi

echo -e "${GREEN}✓${NC} Frontend setup complete"

# Start backend
echo -e "\n${BLUE}[4/6]${NC} Starting backend server..."
cd ../backend
source venv/bin/activate

# Start backend in background
python3 -m app.main > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid

# Wait for backend to be ready
echo "Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:8000/api/v1/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend is running (PID: $BACKEND_PID)"
        break
    fi
    sleep 1
done

# Start frontend
echo -e "\n${BLUE}[5/6]${NC} Starting frontend server..."
cd ../healthnav-ui-kit

# Start frontend in background
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid

echo -e "${GREEN}✓${NC} Frontend is running (PID: $FRONTEND_PID)"

# Summary
echo -e "\n${BLUE}[6/6]${NC} Healthcare Navigator is running!"
echo ""
echo "=================================="
echo "Access your application:"
echo "=================================="
echo "Frontend:  http://localhost:5173"
echo "Backend:   http://localhost:8000"
echo "API Docs:  http://localhost:8000/docs"
echo ""
echo "Logs:"
echo "Backend:   tail -f backend.log"
echo "Frontend:  tail -f frontend.log"
echo ""
echo "To stop all services, run:"
echo "  ./stop.sh"
echo ""
echo "=================================="

# Open browser (optional)
if command -v open &> /dev/null; then
    echo "Opening browser..."
    sleep 2
    open http://localhost:5173
elif command -v xdg-open &> /dev/null; then
    echo "Opening browser..."
    sleep 2
    xdg-open http://localhost:5173
fi
