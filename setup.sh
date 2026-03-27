#!/bin/bash

# ==========================================
# NSMPI - National Student Mental Performance Initiative
# Automated Setup Script
# ==========================================

echo "🚀 Starting NSMPI Setup..."

# Check for Docker
if ! command -v docker &> /dev/null
then
    echo "❌ Error: Docker is not installed. Please install it first."
    exit 1
fi

# 1. Setup Backend
echo "📦 Setting up Backend..."
cd nsmpi/backend
if [ ! -f .env ]; then
    echo "📄 Creating .env for Backend..."
    cp .env.example .env
fi
npm install
cd ../..

# 2. Setup Frontend
echo "📦 Setting up Frontend..."
cd nsmpi/frontend
if [ ! -f .env ]; then
    echo "📄 Creating .env for Frontend..."
    cp .env.example .env
fi
npm install
cd ../..

# 3. Start Infrastructure (PostgreSQL & Redis)
echo "🐳 Starting Infrastructure with Docker Compose..."
docker-compose up -d

echo "⏳ Waiting for Database to be ready..."
sleep 5

# 4. Database Migration & Seed
echo "🗄️ Running Database Migrations..."
cd nsmpi/backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ../..

echo "✅ Setup Complete!"
echo "👉 Run 'cd nsmpi/backend && npm run dev' to start Backend"
echo "👉 Run 'cd nsmpi/frontend && npm run dev' to start Frontend"
