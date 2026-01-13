from fastapi import FastAPI
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

@app.get("/")
def read_root():
    return {"message": "Welcome to World Cup Predictor API"}
