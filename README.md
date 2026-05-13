# Office Sync: Room & IT Operations Hub

A unified platform for managing conference room bookings and IT support tickets efficiently across multiple departments.

## 📁 Project Structure

- **`backend/`**: FastAPI server handling authentication, room bookings, IT tickets, and real-time updates via Socket.io.
- **`frontend/`**: React + Vite application for the dashboard, room booking engine, and KT library.

## 🚀 Quick Start

### 1. Installation
Run the following command from the root directory to install both frontend and backend dependencies:
```bash
npm run install:all
```

### 2. Configuration
- Create a `.env` file in the `backend/` directory with the following variables:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=office_sync
```

### 3. Running the Application
To build the frontend and start the backend server in one go:
```bash
npm run dev
```

The application will be available at [http://localhost:8000](http://localhost:8000).

## 🛠️ Tech Stack

- **Backend**: FastAPI, MySQL, Socket.io
- **Frontend**: React, Vite, CSS (Modern & Premium Design)
- **Features**: Collision-proof booking engine, Real-time status updates, Role-based access control.
