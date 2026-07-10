# 🏙️ VMC Smart City — Citizen Complaint Portal

> A full-stack web application for **Vadodara Municipal Corporation (VMC)** that enables citizens to report civic issues (potholes, garbage, street lights) with live map pinning and photo evidence. Built as a Semester 6 project.

---

## 🚀 Live Features

| Feature | Description |
|---|---|
| 🗺️ **Interactive Map** | Citizens pin exact issue location on OpenStreetMap |
| 📸 **Camera Capture** | Live camera with snap, retake, and flip — or upload from gallery |
| 🔐 **Role-Based Login** | 4 roles: Admin, Field Worker, Ward Engineer, Zone Officer |
| 📊 **Live Admin Dashboard** | Real-time stats pulled from MongoDB |
| ✅ **Status Workflow** | Pending → In Progress → Resolved across all dashboards |
| 🛡️ **Route Protection** | Unauthenticated users redirected to login |
| 📱 **Responsive UI** | Glassmorphism design, works on mobile & desktop |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **Vite**
- **React Router v7**
- **Leaflet / React-Leaflet** (interactive maps)
- **Lucide React** (icons)
- Vanilla CSS with Glassmorphism design

### Backend
- **Node.js + Express**
- **MongoDB** + **Mongoose**
- **Multer** (photo uploads)
- **bcryptjs** (password hashing)
- **dotenv**, **cors**

---

## 📁 Project Structure

```
PROJECT-SEM-6/
├── vmc-app/          # React frontend (Vite)
│   └── src/
│       ├── components/   # All UI components
│       └── api.js        # Centralized API calls
└── vmc-backend/      # Node.js + Express API
    ├── models/           # Mongoose schemas
    ├── routes/           # API routes
    ├── config/           # DB connection
    ├── uploads/          # Uploaded photos
    ├── server.js         # Entry point
    └── seed.js           # Default users seeder
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB installed locally

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/vmc-smart-city.git
cd vmc-smart-city
```

### 2. Start MongoDB
```bash
mkdir -p ~/vmc-mongo-data
mongod --dbpath ~/vmc-mongo-data &
```

### 3. Setup & run the Backend
```bash
cd vmc-backend
npm install
node seed.js       # Creates default users in DB
node server.js     # Starts API on http://localhost:5000
```

### 4. Setup & run the Frontend
```bash
cd vmc-app
npm install
npm run dev        # Starts app on http://localhost:5173
```

---

## 🔐 Default Login Credentials

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Admin (full access) |
| `fieldworker` | `admin123` | Field Worker (update status) |
| `wardengineer` | `admin123` | Ward Engineer (assign tasks) |
| `zoneofficer` | `admin123` | Zone Officer (monitor zone) |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login and get role |
| POST | `/api/complaints` | Submit complaint with photo |
| GET | `/api/complaints` | Get all complaints |
| GET | `/api/complaints/stats` | Get category/status counts |
| PATCH | `/api/complaints/:id/status` | Update complaint status |

---

## 👨‍💻 Author

**Vaibhav Sarswat** — Semester 6 Project, 2026  
Vadodara Municipal Corporation — Smart Citizen Complaint System

---

## 📄 License

This project is for academic purposes.
