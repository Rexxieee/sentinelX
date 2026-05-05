# SentinelX: Cyber-Security Intelligence Suite 🛡️🌐

SentinelX is a production-ready, high-fidelity security monitoring dashboard designed for real-time threat detection and visualization. It combines a robust FastAPI backend with a cutting-edge Next.js frontend, featuring a 3D Earth visualization for global threat telemetry.

## 🚀 Key Features

### 📡 Real-Time Honeypot Sensor
SentinelX includes a live network listener that acts as a "Honeypot." It monitors Port `2222` for unauthorized connection attempts. 
- **Automatic IP Geolocating**: Every intrusion is instantly mapped to its physical location.
- **WebSocket Broadcasting**: Threats are pushed to the dashboard in real-time with zero latency.

### 🌍 3D Global Threat Vector Mapping
A high-fidelity 3D Earth globe built with **Three.js** and **React Three Fiber**.
- **Vector Mapping**: Uses a 25,000-point vector cloud for a stable, high-performance "mission control" aesthetic.
- **Dynamic Arcs**: Real-time threat vectors are drawn from the attacker's location directly to your node in Lagos, Nigeria.

### 📊 Advanced Security Analytics
- **Live Traffic Monitoring**: Visualizes network volume and packet frequency.
- **Incident Lifecycle Management**: Track, escalate, and resolve threats directly from the "Active Threats" command center.
- **Administrative "Danger Zone"**: Secure controls for system resets, rule management, and log flushing.

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Asynchronous Python framework for high-performance API delivery.
- **SQLAlchemy (Async)**: Modern ORM for PostgreSQL interaction.
- **Supabase**: Managed PostgreSQL for secure, scalable data storage.
- **WebSockets**: Bi-directional communication for instant alert delivery.

### Frontend
- **Next.js 14+**: React framework with App Router and Server Components.
- **Three.js / React Three Fiber**: For the immersive 3D globe visualization.
- **Tailwind CSS**: Premium, dark-mode cyberpunk styling.
- **Zustand**: Lightweight state management for real-time alert synchronizing.

## 📦 Installation & Setup

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- A Supabase account (PostgreSQL)

### 2. Backend Setup
```bash
cd fastapi_backend
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements.txt
```
Create a `.env` file:
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/dbname
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```
Run the server:
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd nextjs_frontend
npm install
```
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/alerts
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```
Run the dashboard:
```bash
npm run dev
```

## 🎮 Usage

### Triggering a Test Threat
To verify the system is working, you can simulate an intrusion attempt from your own terminal:
```powershell
Test-NetConnection -ComputerName localhost -Port 2222
```
The dashboard will instantly reflect this "Intrusion Detected" event.

## 🛡️ Security
SentinelX is built with a "Security First" mindset:
- **JWT Authentication**: All administrative actions are protected by secure token-based auth.
- **CORS Protection**: Configurable origins for safe cross-site communication.
- **Data Integrity**: Full audit logs for every network event and incident escalation.

## 📜 License
This project is licensed under the MIT License.

---
**Developed with ❤️ for the Cyber-Security Community.**
