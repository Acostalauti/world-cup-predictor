# Stage 1: Build Frontend
FROM node:20-alpine AS build
WORKDIR /app/frontend

# Copy frontend dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy frontend source
COPY frontend/ .
# Build the application
RUN npm run build

# Stage 2: Final Image
FROM python:3.12-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy backend dependencies
COPY backend/pyproject.toml backend/uv.lock ./

# Install backend dependencies
RUN uv sync --frozen --no-cache

# Copy backend source
COPY backend/ .

# Copy built frontend assets
COPY --from=build /app/frontend/dist /app/static

# Expose port
EXPOSE 8000

# Run application
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
