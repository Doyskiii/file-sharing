#!/bin/bash

echo "=========================================="
echo "  File Sharing Application - Quick Start"
echo "=========================================="
echo ""

# Check if backend exists
if [ ! -d "backend" ]; then
  echo "Error: backend directory not found"
  exit 1
fi

# Check if frontend exists
if [ ! -d "frontend" ]; then
  echo "Error: frontend directory not found"
  exit 1
fi

echo "[1] Installing backend dependencies..."
cd backend
npm install > /dev/null 2>&1
echo "[OK] Backend dependencies installed"

echo ""
echo "[2] Installing frontend dependencies..."
cd ../frontend
npm install > /dev/null 2>&1
echo "[OK] Frontend dependencies installed"

echo ""
echo "[3] Running database migrations..."
cd ../backend
node ace migration:run > /dev/null 2>&1
echo "[OK] Migrations completed"

echo ""
echo "[4] Seeding database..."
node ace db:seed > /dev/null 2>&1
echo "[OK] Database seeded"

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "To start development:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Backend:  http://localhost:3333"
echo "Frontend: http://localhost:3001"
echo ""
echo "Default test account:"
echo "  Email:    Superadmin@example.com"
echo "  Password: password"
echo ""
