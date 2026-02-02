# HeyChat – Web Chat Application 💬

HeyChat is a real-time web chat application built with **React, Node.js, Express, MongoDB, and Socket.IO**.  
It supports authentication, one-to-one chat, online/offline status, message read status, and a modern UI.

---

## 🚀 Features

- User authentication (Signup / Login)
- Real-time messaging with Socket.IO
- Online / Offline user status
- Message read status (Seen)
- Start new conversations
- Chat sidebar with unread message count
- Profile & conversation details
- Responsive and clean UI

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Socket.IO Client
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.IO
- JWT Authentication

---

## 📂 Project Structure

heychat-web-chat-application/
├── backend/
│ ├── src/
│ │ ├── controllers/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── middleware/
│ │ ├── socket.js
│ │ └── server.js
│ └── package.json
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── api/
│ │ ├── context/
│ │ └── socket.js
│ └── package.json
│
└── README.md


---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173


### Frontend (`frontend/.env`)
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001


⚠️ **Do not commit `.env` files**

---

## ▶️ Run Locally

### 1️⃣ Backend
```bash
cd backend
npm install
npm run dev
2️⃣ Frontend
cd frontend
npm install
npm run dev
Open:
👉 http://localhost:5173

🌍 Deployment
Backend: Render

Frontend: Vercel

Environment variables must be set in the respective dashboards.

✅ Status
Project is actively developed and production-ready.
```
---

👨‍💻 Author
Jitendra Kumar Gupta
GitHub: https://github.com/jitendrakumargupta07

