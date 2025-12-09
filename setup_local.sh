#!/bin/bash

# Healthcare Navigator - Local Development Setup Script
# This script sets up GraphDB and MongoDB locally for development

set -e

echo "========================================================================"
echo " Healthcare Navigator - Local Development Setup"
echo "========================================================================"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${YELLOW}Warning: This script is optimized for macOS. Adjustments may be needed for other OS.${NC}"
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

echo ""
echo "========================================================================"
echo " Step 1: Checking Prerequisites"
echo "========================================================================"

# Check Homebrew
if command_exists brew; then
    print_status 0 "Homebrew is installed"
else
    print_status 1 "Homebrew is not installed"
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_status 0 "Python ${PYTHON_VERSION} is installed"
else
    print_status 1 "Python 3 is not installed"
    echo "Installing Python..."
    brew install python@3.11
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js ${NODE_VERSION} is installed"
else
    print_status 1 "Node.js is not installed"
    echo "Installing Node.js..."
    brew install node
fi

echo ""
echo "========================================================================"
echo " Step 2: Installing and Starting MongoDB"
echo "========================================================================"

# Check MongoDB
if command_exists mongod; then
    print_status 0 "MongoDB is already installed"
else
    echo "Installing MongoDB..."
    brew tap mongodb/brew
    brew install mongodb-community
fi

# Start MongoDB
echo "Starting MongoDB..."
brew services start mongodb-community
sleep 3

# Check if MongoDB is running
if lsof -i :27017 >/dev/null 2>&1; then
    print_status 0 "MongoDB is running on port 27017"
else
    print_status 1 "Failed to start MongoDB"
    echo "Try manually: brew services start mongodb-community"
fi

echo ""
echo "========================================================================"
echo " Step 3: Installing and Starting GraphDB"
echo "========================================================================"

# Check if GraphDB is installed
if brew list graphdb-desktop >/dev/null 2>&1; then
    print_status 0 "GraphDB Desktop is already installed"
else
    echo "Installing GraphDB Desktop..."
    brew install --cask graphdb-desktop
fi

# Try to start GraphDB
echo ""
echo "Starting GraphDB..."
echo -e "${YELLOW}Note: GraphDB Desktop will open in a new window.${NC}"
echo -e "${YELLOW}Please wait for it to fully start (may take 30-60 seconds).${NC}"
echo ""

# Try to open GraphDB
if [[ -d "/Applications/GraphDB Desktop.app" ]]; then
    open -a "GraphDB Desktop"
    print_status 0 "GraphDB Desktop launched"
else
    print_status 1 "GraphDB Desktop application not found"
    echo "You may need to manually install GraphDB from:"
    echo "https://www.ontotext.com/products/graphdb/download/"
fi

echo ""
echo "Waiting for GraphDB to start (checking port 7200)..."
for i in {1..30}; do
    if curl -s http://localhost:7200/rest/repositories >/dev/null 2>&1; then
        print_status 0 "GraphDB is running on port 7200"
        break
    fi
    if [ $i -eq 30 ]; then
        print_status 1 "GraphDB did not start within 30 seconds"
        echo "Please ensure GraphDB Desktop is running and accessible at http://localhost:7200"
        echo "You can manually check: open http://localhost:7200"
    fi
    sleep 1
    echo -n "."
done
echo ""

echo ""
echo "========================================================================"
echo " Step 4: Setting Up Backend Python Environment"
echo "========================================================================"

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    print_status 0 "Virtual environment created"
else
    print_status 0 "Virtual environment already exists"
fi

# Activate and install dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt
print_status 0 "Python dependencies installed"

# Copy environment file
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.local..."
    cp .env.local .env
    print_status 0 ".env file created for local development"
else
    print_status 0 ".env file already exists"
fi

echo ""
echo "========================================================================"
echo " Step 5: Loading Data into GraphDB"
echo "========================================================================"

echo ""
echo "Generating RDF/Turtle data files..."
python ops/generate_ttl_data.py

echo ""
echo "Loading data into GraphDB..."
python ops/seed_graphdb.py

echo ""
echo "Running complete seeding (includes MongoDB cache setup)..."
python ops/seed_complete.py

cd ..

echo ""
echo "========================================================================"
echo " Step 6: Setting Up Frontend"
echo "========================================================================"

cd healthnav-ui-kit

if [ ! -f ".env.local" ]; then
    echo "Creating frontend .env.local file..."
    cat > .env.local << EOF
VITE_API_URL=http://localhost:8000/api/v1
EOF
    print_status 0 "Frontend .env.local created"
else
    print_status 0 "Frontend .env.local already exists"
fi

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    print_status 0 "Frontend dependencies installed"
else
    print_status 0 "Frontend dependencies already installed"
fi

cd ..

echo ""
echo "========================================================================"
echo " ✓ Setup Complete!"
echo "========================================================================"
echo ""
echo "Your local development environment is ready!"
echo ""
echo "Services Status:"
echo "  - MongoDB:  http://localhost:27017 (running)"
echo "  - GraphDB:  http://localhost:7200 (check GraphDB Desktop)"
echo ""
echo "Next Steps:"
echo ""
echo "1. Start the backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python -m app.main"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd healthnav-ui-kit"
echo "   npm run dev"
echo ""
echo "3. Open your browser:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:8000/docs"
echo "   GraphDB: http://localhost:7200"
echo ""
echo "4. Test the system:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python ops/test_complete_system.py"
echo ""
echo "========================================================================"
echo ""
echo "Configuration Notes:"
echo "  - Local config:  backend/.env (currently active)"
echo "  - Production:    backend/.env.production (template)"
echo ""
echo "To switch to production later:"
echo "  1. Update backend/.env.production with your hosted DB URLs"
echo "  2. Copy: cp backend/.env.production backend/.env"
echo ""
echo "========================================================================"
