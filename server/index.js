const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow any website (like your Vercel app) to connect
    methods: ["GET", "POST"],
  },
});

// --- YOUR ROOM LOGIC STARTS HERE ---
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
// --- YOUR ROOM LOGIC ENDS HERE ---


// --- DEPLOYMENT SETTINGS (The new part) ---
// Use the port Render gives us, OR use 3001 if we are on localhost
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
});