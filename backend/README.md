# World Cup Predictor Backend

FastAPI backend for the World Cup Predictor application.

## Setup

1. Install dependencies:
   ```bash
   uv sync
   ```

## Running the Server

Start the development server:

```bash
uv run uvicorn app.main:app --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000).
Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs).

## Running Tests

Run tests with pytest:

```bash
uv run pytest
```
