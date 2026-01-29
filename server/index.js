const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

// --- THE FIX IS HERE ---
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  // We allow BOTH methods so Render is happy
  transports: ['websocket', 'polling'], 
  allowEIO3: true // Support older clients just in case
});

const userMap = {};
const roomCodeMap = {}; // 1. NEW: Store code for each room here

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    const { room, username } = data;
    socket.join(room);
    userMap[socket.id] = { room, username };
    console.log(`${username} joined room: ${room}`);
    
    io.to(room).emit("notification", `${username} has joined the room!`);

    // 2. NEW: Check if there is existing code in this room
    // If yes, send it ONLY to the new user who just joined
    if (roomCodeMap[room]) {
      socket.emit("receive_code", roomCodeMap[room]);
    }
  });

  socket.on("code_change", (data) => {
    // 3. NEW: Update the stored code every time someone types
    roomCodeMap[data.room] = data.code;
    
    socket.to(data.room).emit("receive_code", data.code);
  });

  socket.on("disconnect", () => {
    const user = userMap[socket.id];
    if (user) {
      socket.to(user.room).emit("notification", `${user.username} has left the room.`);
      delete userMap[socket.id];
      // Note: We keep the code in roomCodeMap even if everyone leaves, 
      // so if they come back, the code is still there!
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
});