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

// server/index.js (Keep the top imports the same)

// Store user info: { "socket_id": { room: "123", username: "John" } }
const userMap = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    const { room, username } = data;
    socket.join(room);

    // Save the user's info
    userMap[socket.id] = { room, username };

    // Notify others in the room
    console.log(`${username} joined room: ${room}`);
    socket.to(room).emit("notification", `${username} has joined the room!`);
  });

  socket.on("code_change", (data) => {
    socket.to(data.room).emit("receive_code", data.code);
  });

  // Handle Disconnect (Closing the tab)
  socket.on("disconnect", () => {
    const user = userMap[socket.id];
    if (user) {
      // Notify the room that they left
      socket.to(user.room).emit("notification", `${user.username} has left the room.`);
      console.log(`${user.username} disconnected.`);

      // Remove them from our memory
      delete userMap[socket.id];
    }
  });
});

// (Keep the server.listen part the same)

server.listen(3001, () => {
  console.log("SERVER RUNNING ON PORT 3001");
});