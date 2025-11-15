#!/usr/bin/env bash
# Financial Hub Development Launcher
# Simple launcher for development scripts

set -euo pipefail

SCRIPT_DIR="$(dirname "$0")/scripts/dev"

show_help() {
    echo "Financial Hub Development Launcher"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services (backend + frontend + celery)"
    echo "  backend     Start backend API server only"
    echo "  frontend    Start frontend development server only"
    echo "  celery      Start Celery worker only"
    echo "  stop        Stop all services"
    echo "  help        Show this help message"
    echo ""
    echo "Services will be available at:"
    echo "  Backend API: http://localhost:8000"
    echo "  Frontend:    http://localhost:3000 or http://localhost:5173"
    echo "  API Docs:    http://localhost:8000/docs"
}

case "${1:-help}" in
    "start")
        echo "🚀 Starting all Financial Hub services..."
        "$SCRIPT_DIR/start-all.sh"
        ;;
    "backend")
        echo "🚀 Starting backend API server..."
        "$SCRIPT_DIR/start-backend.sh"
        ;;
    "frontend")
        echo "🚀 Starting frontend development server..."
        "$SCRIPT_DIR/start-frontend.sh"
        ;;
    "celery")
        echo "🚀 Starting Celery worker..."
        "$SCRIPT_DIR/start-celery.sh"
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        "$SCRIPT_DIR/stop-all.sh"
        ;;
    "help"|*)
        show_help
        ;;
esac