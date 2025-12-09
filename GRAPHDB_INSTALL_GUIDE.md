# GraphDB Installation Guide

Since GraphDB isn't available via Homebrew cask, here are the recommended installation methods:

## Option 1: Docker (Recommended - Easiest)

### Install Docker Desktop manually:
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Install and start Docker Desktop
3. Wait for Docker to fully start (whale icon in menu bar)

### Then run GraphDB:
```bash
cd /Users/yogeshsangtani/Desktop/ASU/SER531/Project/healthnav

# Start GraphDB using docker-compose
docker-compose up -d graphdb

# Check logs
docker-compose logs -f graphdb

# Wait for "Started GraphDB" message
```

### Verify GraphDB is running:
```bash
curl http://localhost:7200/rest/repositories
# Should return: []
```

## Option 2: Manual Download (If Docker not preferred)

### Download GraphDB Free:
1. Go to: https://www.ontotext.com/products/graphdb/download/
2. Select "GraphDB Free"
3. Choose "Standalone Server" (works on macOS)
4. Fill the form and download

### Install and Run:
```bash
# Extract the downloaded file
unzip graphdb-free-*.zip
cd graphdb-free-*

# Start GraphDB
./bin/graphdb

# GraphDB will start on http://localhost:7200
```

### Verify:
```bash
# Open in browser
open http://localhost:7200

# Or check via curl
curl http://localhost:7200/rest/repositories
```

## Option 3: Use Docker without Docker Desktop (Advanced)

If you prefer not to install Docker Desktop:

```bash
# Install colima (lightweight Docker alternative for macOS)
brew install colima docker

# Start colima
colima start

# Now you can use docker commands
docker run -d \
  --name healthnav-graphdb \
  -p 7200:7200 \
  -e GDB_JAVA_OPTS="-Xmx2g -Xms1g" \
  ontotext/graphdb:10.6.3-free

# Check logs
docker logs -f healthnav-graphdb
```

## After GraphDB is Running

Once GraphDB is accessible at http://localhost:7200:

```bash
cd backend
source venv/bin/activate

# Generate and load data
python ops/seed_complete.py
```

This will:
1. ✓ Generate RDF/Turtle data files
2. ✓ Create 'healthnav' repository in GraphDB
3. ✓ Load ontology and data
4. ✓ Verify data with SPARQL queries
5. ✓ Set up MongoDB cache

## Troubleshooting

### Port 7200 already in use:
```bash
# Find what's using the port
lsof -i :7200

# Kill it if needed
kill -9 <PID>
```

### GraphDB won't start:
- Check Java is installed: `java -version` (GraphDB needs Java 11+)
- Check logs for errors
- Ensure port 7200 is free

### Can't access http://localhost:7200:
- Check firewall settings
- Try http://127.0.0.1:7200 instead
- Ensure GraphDB finished starting (check logs)

## Production Configuration

For production, update `backend/.env.production`:

```env
# GraphDB Cloud or your hosted instance
GRAPHDB_URL=https://your-graphdb-instance.com:7200
GRAPHDB_REPOSITORY=healthnav
GRAPHDB_USERNAME=your-username
GRAPHDB_PASSWORD=your-password
```

Then use:
```bash
cp backend/.env.production backend/.env
```

## Quick Test

Once installed:
```bash
# Test GraphDB connection
curl http://localhost:7200/rest/repositories

# Should see [] (empty list) or [{"id":"healthnav",...}] if already seeded
```

---

**Need help?** Check the official docs: https://graphdb.ontotext.com/documentation/
