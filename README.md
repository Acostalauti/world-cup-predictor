# ⚽ World Cup Predictor

A full-stack web application that allows users to predict World Cup match results, compete with friends in groups, and track their prediction accuracy.

## 🚀 Features

- **User Authentication**: Secure registration and login with password hashing
- **Group Management**: Create and join prediction groups with friends
- **Match Predictions**: Predict scores for World Cup matches
- **Leaderboards**: Track and compare prediction accuracy within groups
- **Admin Panel**: Platform administration for managing users and groups
- **Real-time Updates**: Live match results and standings
- **Responsive Design**: Modern UI built with React and Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn-ui** component library
- **React Router** for navigation
- **Vitest** for testing

### Backend
- **FastAPI** (Python)
- **PostgreSQL** database
- **SQLAlchemy** ORM
- **Pydantic** for data validation
- **pytest** for testing
- **uv** for dependency management

### Infrastructure
- **Docker** & **Docker Compose**
- **Nginx** for serving frontend
- **PostgreSQL 15** Alpine

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) 18+ (for local frontend development)
- [Python](https://www.python.org/) 3.11+ (for local backend development)
- [uv](https://github.com/astral-sh/uv) (for backend dependency management)

## 🚀 Quick Start with Docker

The easiest way to run the entire application:

```bash
# Clone the repository
git clone <repository-url>
cd world-cup-predictor

# Start all services
docker-compose up --build

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

To stop the services:

```bash
docker-compose down
```

To stop and remove all data:

```bash
docker-compose down -v
```

## ☁️ Deployment to Render

The application is configured for easy deployment to [Render](https://render.com) using a Blueprint configuration.

### Prerequisites

- A [Render account](https://render.com) (free tier available)
- Your code in a GitHub, GitLab, or Bitbucket repository

### Deploy with Blueprint (Recommended)

The easiest way to deploy is using the included `render.yaml` Blueprint file:

1. **Push the code** to your Git repository (if not already done)

2. **Create a Blueprint in Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **"New"** → **"Blueprint"**
   - Connect your repository
   - Render will automatically detect `render.yaml` and configure:
     - Web Service (combined frontend + backend)
     - PostgreSQL Database
     - Environment variables

3. **Wait for deployment**:
   - Initial build takes 5-10 minutes
   - Database will be automatically provisioned
   - Application will seed initial data on first startup

4. **Access your app**:
   - Render provides a URL like: `https://worldcup-predictor.onrender.com`
   - Database automatically seeded with sample users, matches, and groups

### Manual Deployment (Alternative)

If you prefer to set up services manually:

1. **Create PostgreSQL Database**:
   - Go to **"New"** → **"PostgreSQL"**
   - Name: `worldcup-db`
   - Plan: Free (or higher)
   - Copy the **Internal Database URL**

2. **Create Web Service**:
   - Go to **"New"** → **"Web Service"**
   - Connect your repository
   - Settings:
     - **Name**: `worldcup-predictor`
     - **Runtime**: Docker
     - **Dockerfile Path**: `./Dockerfile`
     - **Plan**: Free (or higher)
   - Add Environment Variable:
     - **Key**: `DATABASE_URL`
     - **Value**: `<paste internal database URL>`
   - **Health Check Path**: `/api/health`

3. **Deploy**: Click "Create Web Service"

### Environment Variables

The application requires only one environment variable:

- `DATABASE_URL`: PostgreSQL connection string (automatically set when using Blueprint)

### Post-Deployment

- **First login**: Use seeded credentials:
  - Admin: `admin@example.com` / `password123`
  - User: `alice@example.com` / `password123`
- **Database persistence**: Data persists across deployments
- **Free tier notes**:
  - Services spin down after 15 minutes of inactivity
  - First request after spin-down may take 30-60 seconds
  - PostgreSQL free tier expires after 90 days

### Troubleshooting

- **Build fails**: Check Docker build works locally with `docker build -t test .`
- **Database connection errors**: Verify `DATABASE_URL` is set correctly
- **CORS errors**: Ensure your Render URL matches the pattern in `backend/app/main.py`


## 💻 Local Development

### Backend Setup

```bash
cd backend

# Install dependencies
uv sync

# Run database migrations (if applicable)
# <migration commands here>

# Seed the database with sample data
uv run python verify_seed.py

# Start the development server
uv run uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000 with interactive docs at http://localhost:8000/docs.

#### Run Backend Tests

```bash
# Run unit tests
uv run pytest tests/

# Run integration tests
uv run pytest tests_integration/

# Run all tests with coverage
uv run pytest --cov=app
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:5173 (Vite default port).

#### Run Frontend Tests

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 📁 Project Structure

```
world-cup-predictor/
├── backend/                 # FastAPI backend application
│   ├── app/                # Application code
│   │   ├── api/           # API routes
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── utils/         # Utility functions
│   ├── tests/             # Unit tests
│   ├── tests_integration/ # Integration tests
│   ├── Dockerfile         # Backend Docker image
│   └── pyproject.toml     # Python dependencies
│
├── frontend/              # React frontend application
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilities and API client
│   ├── Dockerfile        # Frontend Docker image (Nginx)
│   └── package.json      # Node dependencies
│
├── docker-compose.yml    # Docker Compose configuration
└── README.md            # This file
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

#### Backend (configured in docker-compose.yml)
- `DATABASE_URL`: PostgreSQL connection string
  - Default: `postgresql://user:password@db/worldcup`

#### Database (configured in docker-compose.yml)
- `POSTGRES_USER`: Database user (default: `user`)
- `POSTGRES_PASSWORD`: Database password (default: `password`)
- `POSTGRES_DB`: Database name (default: `worldcup`)

## 🧪 Testing

### Backend Tests
- **Unit Tests**: Located in `backend/tests/`
- **Integration Tests**: Located in `backend/tests_integration/`
- Run with: `uv run pytest`

### Frontend Tests
- **Component Tests**: Located alongside components
- Run with: `npm run test`

## 📝 API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

Alternative documentation is available at http://localhost:8000/redoc.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests to ensure everything works
4. Submit a pull request

## 📄 License

[Add your license information here]

## 👥 Authors

Lautaro Acosta + AI

## 🙏 Acknowledgments

- FIFA for match data and fixtures
- The open-source community for the amazing tools and libraries
