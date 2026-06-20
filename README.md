# Queue Cure ’26 (Smart Clinic Queue SaaS) 🏥✨

Queue Cure ’26 is a real-time smart clinic queue management solution built to modernize patient check-ins. Written with high-performance frameworks, it replaces paper-based tickets or static clipboard sheets with an elegant, synced waiting-experience across reception consoles, patient smartphones, and wallTV monitors.

---

## 🏗️ Folder Structure

```text
/
├── backend/                       # Python FastAPI Core Production Microservice
│   ├── database.py                # Dual DB Engine connection (PostgreSQL/SQLite)
│   ├── models.py                  # SQLAlchemy declarative models
│   ├── schemas.py                 # Pydantic data validation schemas
│   ├── crud.py                    # Analytical waiting-time rules and CRUD
│   ├── websocket_manager.py       # Async websocket listener room coordinator
│   └── main.py                    # Routes, CORS layers & exception handlers
├── src/                           # React + TypeScript + Tailwind SPA Core
│   ├── components/
│   │   ├── Navbar.tsx             # Interactive header & WS pinger
│   │   ├── Footer.tsx             # Responsive footer with metadata tags
│   │   ├── LandingPage.tsx        # Healthcare SaaS portal with a Live Playground
│   │   ├── Dashboard.tsx          # Reception console (Add, complete, skip, reset)
│   │   ├── WaitingScreen.tsx      # WALL TV monitor & Web Audio synthesizer chime
│   │   └── Notification.tsx       # Sliding Toast Notification trigger manager
│   ├── App.tsx                    # Sync engines, state stores & view router
│   ├── index.css                  # Tailwinds directives
│   ├── main.tsx                   # StrictMode setup
│   └── types.ts                   # WS contracts and clinic structure definitions
├── server.ts                      # Sandbox Express node wrapper serving SPA & WS
├── package.json                   # Build parameters, packages, & start configs
├── metadata.json                  # Sandbox metadata configurations
├── tsconfig.json                  # Strict typings
└── README.md                      # Design logs and deployment parameters (This document)
```

---

## 📡 Mermaid Socket Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Rec as Front-Desk Reception
    participant Srv as FastAPI / Express Server
    actor Lou as Waiting Lounge (TV Wall)
    actor Pat as Patient Smartphone

    Note over Rec, Pat: Connection Lifecycle Establishes
    Pat->>Srv: Upgrade http to WebSocket [wss://]
    Rec->>Srv: Upgrade http to WebSocket [wss://]
    Lou->>Srv: Upgrade http to WebSocket [wss://]
    Srv-->>Pat: INIT_STATE (Seeded Patient array)
    Srv-->>Rec: INIT_STATE (Seeded Patient array)
    Srv-->>Lou: INIT_STATE (Seeded Patient array)

    Note over Rec, Srv: Queue Mutation Events
    Rec->>Srv: Add patient: "Zoe" (via React Form)
    Srv->>Srv: Generate Token 105 & Compute Wait
    Srv-->>Pat: Broadcast QUEUE_UPDATED
    Srv-->>Lou: Broadcast QUEUE_UPDATED
    Srv-->>Rec: Broadcast NOTIFICATION: "Token 105 Registered"

    Note over Rec, Srv: Real-Time Consultation Dispatch
    Rec->>Srv: Trigger CALL_NEXT
    Srv->>Srv: Finalize Token 104 -> Complete; Call Token 105
    Srv-->>Lou: Broadcast QUEUE_UPDATED (Token 105 Active)
    Lou->>Lou: Synthesize Clinic Chime (E5 -> A5)
    Srv-->>Pat: Broadcast NOTIFICATION: "Token 105 Called"
```

---

## 🛠️ Technology Stack & Environment Adaptations

### 1. Unified Development Port Configuration (Express + Vite)
In our sandbox workspace, Cloud Run restricts external routing strictly to **Port 3000** through an nginx reverse proxy. To allow the developers to test the real-time websocket loop and SPA router as a unified process, we implemented an Express wrapper (`server.ts`) which:
- Mounts Vite as a middleware.
- Spawns the native `ws` library on the **same port (3000)** alongside raw HTTP.
- Automatically serves SPA Fallbacks dynamically in product compilation.

### 2. Python FastAPI production release
To meet strict production-grade specifications, we have created the exact equivalents (`/backend`) using Python’s top async frameworks. The production bundle is backed by **FastAPI** with Starlette’s WebSockets, and database synchronization is powered by **SQLAlchemy** connected securely to **PostgreSQL**.

---

## ⏰ Queue Wait-Time Logic

The estimated wait-time is never hardcoded. It uses a clean, predictable mathematical clinical queueing logic:

$$\text{Estimated Wait Time} = \text{Patients Ahead} \times \text{Clinic Average Consultation Interval}$$

- **Patients Ahead**: Obtained by fetching the index of the patient inside the waiting array relative to the active line.
- **Clinic Average Consultation Interval**: Controllable by the receptionist on-the-fly (`ClinicSettings.avgConsultationTime`). State updates instantly recalculate wait timers globally without requiring server restarts.
- **Average Waiting Time today**: Generated dynamically by averaging completed transactions (`called_at` - `created_at`).

---

## 🚀 Deployment Guide

### I. Frontend Hosting (Vercel)
Vercel is ideal for our static React SPA bundle:
1. Initialize a new repo and push the codebase to GitHub.
2. Link the repository inside your Vercel Dashboard.
3. Select the **Vite** framework preset.
4. Set **Build Command**: `vite build` or `npm run build`
5. Set **Output Directory**: `dist`
6. Add `.env` config variables matching your backend production URL. E.g. `VITE_APP_WS_URL` matching `wss://your-fastapi-backend.onrender.com`.

### II. Backend Production Hosting (Render)
Render offers native support for continuous deployment of full-stack python apps:
1. Select **Web Service** on Render.
2. Link your repository.
3. Choose the **Python** environment.
4. Set **Build Command**: `pip install -r requirements.txt` (including standard packages: `fastapi, uvicorn, sqlalchemy, pydantic`).
5. Set **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
6. Set Environment Variables:
   - `DATABASE_URL`: Add your PostgreSQL connection URI. If left blank, it defaults to container SQLite (`sqlite:///./queue_cure.db`) automatically.

---

## 🧠 Architectural Goals & Thought Process

- **Single Screen vs Multi-View Integrity**: Since users can navigate views inside the browser, we designed the navbar tab buttons to switch screens smoothly using **Framer Motion** transitions. This gives the app a cohesive, solid SPA feel.
- **Interactive Playground on Landing Page**: Users can register mock patient names immediately from the marketing landing page. This gives hackathon judges an immediate, interactive way to test the live-sync dashboard in real-time.
- **Audio Chime Engineering**: Instead of depending on fragile hosted audio files (`.wav`/`.mp3`) which could break due to CORS, sandboxing, or invalid paths, we engineered a native synthesizer using the **HTML5 Web Audio API**. It programmatically executes a pleasant medical alert dual-frequency chime when active patient tokens update, resulting in a robust, zero-dependency, and instantly functional chime experience.
- **Resilient Offline Fallback**: In restricted frame environments or during network drops, the React applet seamlessly runs a synchronized local storage and memory queue engine. This guarantees the UI never freezes or throws breaks, providing a flawless demonstration under any sandbox constraint.
