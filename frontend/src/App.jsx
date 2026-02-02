import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import socket from "./socket";
import { useAuth } from "./context/AuthContext";

const App = () => {
  const { user, loading } = useAuth();

  // Connect / disconnect socket based on auth
  useEffect(() => {
    if (loading) return;

    if (user) {
      socket.auth = {
        token: localStorage.getItem("token"),
      };

      if (!socket.connected) {
        socket.connect();
      }

      socket.emit("setup", user._id);
    } else {
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }, [user, loading]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
