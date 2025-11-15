# Development Scripts

This directory contains all development and utility scripts for the Financial Hub project.

## Directory Structure

```
scripts/
├── dev/                    # Development start/stop scripts
│   ├── start-all.ps1      # Start all services (PowerShell)
│   ├── start-all.sh       # Start all services (Bash)
│   ├── start-dev.ps1      # Start backend only (PowerShell)  
│   ├── start-dev.sh       # Start backend only (Bash)
│   ├── start-frontend.ps1 # Start frontend only (PowerShell)
│   ├── start-frontend.sh  # Start frontend only (Bash)
│   ├── start-celery.sh    # Start Celery worker (Bash)
│   ├── stop-all.ps1       # Stop all services (PowerShell)
│   └── stop-all.sh        # Stop all services (Bash)
├── smoke_test.ps1         # API smoke tests (PowerShell)
├── smoke_test.sh          # API smoke tests (Bash)
├── check_matview.ps1      # Check materialized view (PowerShell)
└── check_matview.sh       # Check materialized view (Bash)
```

## Quick Start

From the repository root, use the simple launchers:

**Windows:**
```cmd
dev.bat start          # Start all services
dev.bat backend         # Start backend only
dev.bat frontend        # Start frontend only
dev.bat stop            # Stop all services
```

**macOS/Linux:**
```bash
./dev.sh start          # Start all services
./dev.sh backend        # Start backend only
./dev.sh frontend       # Start frontend only
./dev.sh stop           # Stop all services
```

## Direct Script Usage

You can also run scripts directly:

```bash
# Start all services
./scripts/dev/start-all.sh         # Linux/macOS
./scripts/dev/start-all.ps1        # Windows PowerShell

# Start individual services
./scripts/dev/start-dev.sh         # Backend only
./scripts/dev/start-frontend.sh    # Frontend only
./scripts/dev/start-celery.sh      # Celery worker only

# Stop all services
./scripts/dev/stop-all.sh          # Linux/macOS
./scripts/dev/stop-all.ps1         # Windows PowerShell
```

## Environment Variables

All scripts support environment variable overrides:

- `USE_SQLITE=true` - Use SQLite instead of PostgreSQL
- `DEBUG=true` - Enable debug mode
- `SKIP_DB_INIT=true` - Skip database initialization on startup
- `VITE_API_URL=http://localhost:8000` - Frontend API endpoint
- `REDIS_URL=redis://localhost:6379/0` - Redis connection for Celery

## Testing Scripts

- `smoke_test.sh/.ps1` - Run API smoke tests after starting services
- `check_matview.sh/.ps1` - Verify materialized view creation in PostgreSQL

## Service URLs

After starting services:

- **Backend API:** http://localhost:8000
- **Frontend:** http://localhost:3000 or http://localhost:5173
- **API Documentation:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health