import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket.js";

dotenv.config();

const PORT = process.env.PORT ?? 5001;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();

    // initialize socket ONLY after DB is connected
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 HeyChat server running on http://localhost:${PORT}`);
      console.log(`🟢 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
