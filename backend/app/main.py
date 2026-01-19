from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, groups, matches, predictions, admin
from .database import engine, SessionLocal
from . import sql_models, seeder

# Create tables
sql_models.Base.metadata.create_all(bind=engine)

# Seed data
db = SessionLocal()
try:
    seeder.seed_data(db)
finally:
    db.close()

app = FastAPI(
    title="World Cup Predictor API",
    description="API for the World Cup Predictor application.",
    version="1.0.0"
)

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Vite default
    "http://localhost:8080", # Codespaces default
    "https://*.onrender.com", # Render deployment domains
    "*" # For development convenience to avoid further issues
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(groups.router)
app.include_router(matches.router)
app.include_router(predictions.router)
app.include_router(admin.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Serve Frontend in Production
# We assume the frontend build is copied to a 'static' directory in the same relative location
# (e.g., inside the container at /app/static)
static_dir = "static"
if os.path.exists(static_dir):
    # Mount assets (hashed files from Vite build usually go here)
    if os.path.exists(os.path.join(static_dir, "assets")):
        app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    # Serve index.html for the root route
    @app.get("/")
    async def read_root():
        return FileResponse(os.path.join(static_dir, "index.html"))

    # Catch-all for SPA routing (any other path returns index.html)
    # Exclude API routes (which are handled above because they are defined first)
    @app.get("/{full_path:path}")
    async def catch_all(full_path: str):
        # Optional: check if file actually exists in static root (like favicon.ico)
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Otherwise return index.html for client-side routing
        return FileResponse(os.path.join(static_dir, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"message": "Welcome to World Cup Predictor API (Frontend not built/served)"}
