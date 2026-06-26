# 🌌 Project Zenith: The Celestial Eye

> **A Real-Time Cosmic Radar for Any Location on Earth**

Project Zenith is an immersive astronomy platform that transforms any location on Earth into a live window to the cosmos. Users can explore the sky in real time, track satellites, discover planets, stars, and constellations, and travel through time to visualize celestial events from the past or future.

Built with modern web technologies, Project Zenith combines real-time data, interactive visualizations, and premium UI/UX to create a seamless space exploration experience.

---

## ✨ Features

### 🌍 Interactive 3D Globe
- Interactive WebGL/Three.js 3D Earth visualization.
- Captures user clicks on any geographic coordinates to automatically load regional cosmic maps.
- Real-time display of satellite orbit paths.

### 🛰️ Real-Time ISS Tracking & Telemetry
- Live ISS location, altitude, and orbital speed tracking.
- Automatic updates every few seconds.
- Predictive ISS pass times: Calculates when the station will cross your horizon next based on SGP4 propagation.

### 🪐 Planet Explorer
- Real-time planetary positions (azimuth, elevation, distance) relative to observer coordinates.
- Fetched directly from the **NASA Horizons API** with local mathematical Keplerian fallback propagation.
- Detailed planet profiles including rise and set times.

### 🔭 Sky View & Star Catalog
- Interactive celestial dome overlay mapping over **119,000+ stars** from the HYG database.
- Real-time azimuth and elevation coordinates calculated for stars, constellations, and boundaries.

### 🌌 Constellation Mythology
- Deep coverage of all 88 constellations with mythologies, seasonal visibility, and brightest stars.
- Renders boundaries dynamically according to IAU standards.

### ⏳ Time Travel Mode
- Step backward or forward in time to simulate planetary paths, solar/lunar configurations, and celestial conditions.
- Deep space exploration timeline journeying through cosmic history.

### 🌠 Space Weather & NEOs
- Real-time Near-Earth Asteroid tracking from NASA NeoWs.
- NOAA K-index aurora forecast warnings.
- Upcoming launch alerts from SpaceDevs.

---

## 🛠 Tech Stack

### Frontend (Client Root)
- **Next.js 15 & React 18**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Zustand** (Local settings & state persistence)
- **TanStack React Query** (Data fetching and caching)
- **Howler.js** (Synthesized sound waves and local mp3/wav ambient audio)

### Backend (`/server`)
- **Node.js & Express**
- **TypeScript**
- **MongoDB & Mongoose** (Settings persistence & timeline storage)
- **satellite.js** (SGP4 orbital propagation)
- **node-cache** (API caching layer)

---

## 📂 Project Structure

```text
Project_Zenith/
│
├── app/                  # Next.js App Router Pages
├── components/           # React Components (Globe, ISS, SkyView, etc.)
├── constants/            # Client Query Keys & Constants
├── hooks/                # React Hooks & Custom Audios
├── services/             # Frontend API request methods
├── store/                # Zustand global state configurations
├── utils/                # Ported SunCalc astronomical math algorithms
├── public/               # Public assets (mp3/wav audios, sitemaps, robots)
│
├── server/               # Backend Express Server Folder
│   ├── src/
│   │   ├── config/       # MongoDB connection handlers
│   │   ├── controllers/  # Settings & Space handlers
│   │   ├── middleware/   # Authentication & limits
│   │   ├── models/       # Mongoose Schemas (Settings, Timeline)
│   │   ├── services/     # SpaceService cache & Horizons propagation
│   │   └── server.ts     # Express server setup
│   ├── data/             # Cache directory (Constellations, Satellites, HYG)
│   ├── .env.example      # Backend environment configurations
│   └── package.json
│
├── Dockerfile            # Multi-stage production container build config
├── .env.example          # Main configuration template
├── README.md
└── package.json          # Frontend packages configurations
```

---

## 🚀 Installation & Running Locally

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/project-zenith.git
cd project-zenith
```

### 2. Configure Environment Variables
Copy `.env.example` in both folders and fill in your keys:
```bash
# In the root directory (Frontend)
cp .env.example .env

# In the server directory (Backend)
cp server/.env.example server/.env
```

#### Frontend Variables (`.env`):
*   `NEXT_PUBLIC_BACKEND_URL`: URL of the deployed Express backend (e.g. `https://project-zenith-xjc5.onrender.com`, required in production for WebSockets).
*   `BACKEND_URL`: URL of the deployed Express backend (required in production for API rewrites).
*   `NEXT_PUBLIC_SITE_URL`: Public site domain for SEO metadata (e.g. `https://project-zenith-sigma.vercel.app`).
*   `NASA_API_KEY`: NASA API key (defaults to `DEMO_KEY`).

#### Backend Variables (`server/.env`):
*   `MONGO_URI`: MongoDB connection string.
*   `JWT_SECRET`: Secret key for authentication tokens.
*   `NASA_API_KEY`: NASA API key (defaults to `DEMO_KEY`).
*   `PORT`: Port on which the backend server will run (defaults to `5001`).

### 3. Run Backend Express Server
```bash
cd server
npm install
npm run dev
```
Starts backend server on port `5001`.

### 4. Run Frontend Client
In a new terminal in the root directory:
```bash
npm install
npm run dev
```
Starts development hot-reloading server on [http://localhost:3000](http://localhost:3000).

---

## 🎯 Verification & Quality Check
*   **Zero Compiler Errors**: Tested with `tsc --noEmit` on the client and `tsc` compile on the server.
*   **Linter Approved**: Evaluated with `eslint` showing 0 warnings or errors.
*   **Production Standalone Build**: Fully verified production compilation via `next build`.
