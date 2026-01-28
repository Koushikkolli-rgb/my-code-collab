const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

// Create the standard HTTP server
const server = http.createServer(app);

// Initialize Socket.io (The Magic Spell)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow the React app to connect
    methods: ["GET", "POST"],
  },
});

// Listen for connections
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // When a user types code, send it to everyone else
  socket.on("code_change", (data) => {
    // Broadcast to everyone EXCEPT the sender
    socket.broadcast.emit("receive_code", data);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING ON PORT 3001");
});