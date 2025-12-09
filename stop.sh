#!/bin/bash

# Healthcare Navigator Stop Script

echo "=================================="
echo "Stopping Healthcare Navigator"
echo "=================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Stop backend
if [ -f backend.pid ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        rm backend.pid
        echo -e "${GREEN}✓${NC} Backend stopped"
    else
        echo "Backend not running"
        rm backend.pid
    fi
else
    echo "Backend PID file not found"
fi

# Stop frontend
if [ -f frontend.pid ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        rm frontend.pid
        echo -e "${GREEN}✓${NC} Frontend stopped"
    else
        echo "Frontend not running"
        rm frontend.pid
    fi
else
    echo "Frontend PID file not found"
fi

# Alternative: kill by port (if PIDs don't work)
echo ""
echo "Checking for any remaining processes on ports..."

if lsof -ti:8000 > /dev/null 2>&1; then
    echo "Killing process on port 8000..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
fi

if lsof -ti:5173 > /dev/null 2>&1; then
    echo "Killing process on port 5173..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
fi

echo ""
echo "=================================="
echo "All services stopped"
echo "=================================="
