### 1. Frontend development using Lovable and integration with GitHub.

Prompt 
```

You are a senior product designer and frontend engineer.

Build the FRONTEND for a web application called:

“Prode Mundial FIFA 2026”

This is a web responsive application (desktop + mobile) for managing football predictions (prode) between groups of friends during the FIFA World Cup 2026.

========================
1. PRODUCT GOAL
========================

The goal of the app is to allow private groups of friends to:
- Predict match results
- Compete through rankings
- Have a simple, clean and intuitive experience

The app is:
- Free
- No ads
- No social features (no chat, no comments)
- Focused only on FIFA World Cup 2026

Tone:
- Clean
- Modern
- Minimal
- Fun but not childish
- Football-inspired, but NOT overloaded with graphics

========================
2. USER ROLES
========================

There are 3 roles:

1) Platform Admin (no UI needed for MVP, ignore)
2) Group Admin
3) Player

Only registered users can create groups.

========================
3. CORE SCREENS
========================

Design the following screens and flows:

### 3.1 Authentication
- Login with email
- Simple, clean login screen
- Option to register if user has no account

---
### 3.2 Home / Dashboard
After login, the user should see:

- Welcome message
- List of groups the user belongs to
- CTA buttons:
  - “Create new group”
  - “Join group via invitation”

Each group card shows:
- Group name
- Number of players
- Current position of the user in that group

---
### 3.3 Create Group
Form with:
- Group name
- Group description (optional)
- Scoring system configuration (simple UI, selectable options)
- Create button

After creation:
- Show invitation link or invitation code

---
### 3.4 Group Detail
Main group screen with tabs or sections:

Tabs:
1) Matches
2) Ranking
3) My Predictions

Header shows:
- Group name
- Number of players
- Countdown to next match (if available)

---

### 3.5 Matches & Predictions
For each match:
- Teams
- Match date & time
- Status:
  - Upcoming
  - In progress (predictions locked)
  - Finished

Prediction inputs (ONLY if match not started):
- Winner (home / draw / away)
- Exact score
- Goals

Once match starts:
- Inputs disabled
- Show “Predictions closed”

---

### 3.6 Ranking
Ranking table per group:
- Position
- Player name
- Total points

Highlight:
- Top 3 players (🥇🥈🥉)
- Current user row highlighted

---

### 3.7 Prediction Visibility Rule
Important UX rule:

- Users CANNOT see other players’ predictions during a matchday
- Predictions are visible ONLY AFTER the full matchday is completed

Design this clearly:
- Use labels like “Predictions will be revealed after the matchday ends”

---

========================
4. UI / UX REQUIREMENTS
========================

- Fully responsive (mobile first)
- Clean typography
- Card-based layout
- Clear CTAs
- Avoid clutter
- Use subtle football references (green accents, pitch-like separators, etc.)

Do NOT:
- Add chat
- Add comments
- Add emojis overload
- Add betting / money concepts

========================
5. COMPONENTS
========================

Use reusable components:
- Group card
- Match card
- Prediction form
- Ranking table
- Buttons (primary / secondary)
- Alerts (prediction closed, info messages)

========================
6. OUTPUT EXPECTATION
========================

Generate:
- Complete UI screens
- Navigation flow
- Consistent visual system
- Dummy data where needed
- Clear separation of screens/components

This frontend will later be connected to a backend API.
Focus ONLY on UI, UX and structure.

```

### 2. Development continues using Codespaces and Antigravity as the IDE.

#### 2.1 Initial configuration of MCP and AGENTS.md

#### 2.2 MCP Server Configuration (Context7)

To enhance the AI agent with **up-to-date and authoritative library documentation**, I configured an **MCP (Model Context Protocol) server** using **Context7**.

Context7 allows the agent to retrieve **real-time, version-accurate documentation** directly from official sources, avoiding outdated or hallucinated references when working with frameworks and libraries.  

**Configuration in Antigravity**
1. **Register the MCP Server**
	The Context7 MCP server is declared in the Antigravity configuration as an external context provider:
	
```json
"mcp": {
  "servers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

2. **Enable MCP for Agents**: MCP is explicitly enabled at the agent level (see AGENTS.md):
#### 2.3 AGENTS.md

 I created an AGENTS.md file to define the operational rules and conventions the AI agent must follow throughout the development process. This includes standardized dependency management for backend development using uv, guidelines for frequent Git commits, and an explicit instruction to always leverage the Context7 MCP server for library and API documentation, code generation, and configuration steps—ensuring consistency, accuracy, and up-to-date implementations without requiring explicit prompts from the user.

```
For backend, use uv for dependency management. A few useful commands are:
uv sync

uv add <PACKAGE-NAME>

uv run python <PYTHON-FILE>

Regularly commit code to git

Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

```
#### 2.4 Frontend test creation
Prompt 
```
I want to add some test for the frontend
```
#### 2.5 API Spec creation
Prompt
```
Analyse the content of the client (Frontend Folder) and create OpenAPI specs based on what it needs. Later we want to implement backend base on these specs
```
#### 2.6 Backend development
Prompt
```
Based on the OpenAPI specs, create fastapi backend for now use a mock database, which we will later replace with the real one, create test to make sure implementation works.

Follow the guidelines in AGENTS.md
```
#### 2.7 Frontend–backend integration
Prompt
```
Now make frontend use backend. Use OpenAPI Specs for guidance follow the guidelines in AGENTS.md
```
#### 2.6 Running Backend
Prompt
```
Create a makefile for running backend
```
#### 2.6 Running frontend and backend
Prompt
 ```
 I want to use concurrently for running both frontend and backend.
 ```
#### 2.7 Adding Database for backend
Prompt
```
Now for backend let's use postgres and sqlite database (via sqlalchemy)
```
#### 2.8 Integration test
Prompt
```
Let's add some integration tests (using sqlite) to make sure things works
put the integration test in a separate folder tests_integration
```
#### 2.9   Conteneraizing application and Running it in Docker-Compose
Prompt
```
Right now we have frontend backend and database (Sqlite) 
let's put everything into docker compose and use postgres there. We can serve frontend with ngix or wheteaver you recommend 
```
#### 2.10 Create one container for frontend and backend
Prompt
```
For Deployment we need to put together backend and frontend in one container. Let's do that.
```
#### 2.11 Deployment to the cloud
Prompt
```
I want to deploy to the cloud with render
```
#### 2.12 CI / CD Implementation
Prompt
```
I want to create CI/CD pipeline with github actions with two parts: 
	- First we run the test (frontend + backend) 
	- If tests pass, I want to deploy update to render
```
