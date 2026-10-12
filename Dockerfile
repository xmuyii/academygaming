# ==============================================================================
# Sovereign Academy LMS — Production Multi-Stage Dockerfile for Railway
# Deploys React Frontend + FastAPI Multi-Timeframe Leaderboards Backend
# ==============================================================================

# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN npm install

# Build static assets
COPY . .
RUN npm run build

# --- Stage 2: Production Python Backend ---
FROM python:3.11-slim AS production

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code, migrations, and scripts
COPY main.py ./
COPY phase1/ ./phase1/
COPY phase2/ ./phase2/
COPY phase3/ ./phase3/
COPY phase4/ ./phase4/

# Copy compiled frontend build from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Railway provides $PORT at runtime
EXPOSE 8000

# Start Uvicorn serving both API and static frontend
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
