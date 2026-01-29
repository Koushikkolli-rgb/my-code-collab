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

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    const { room, username } = data;
    socket.join(room);
    userMap[socket.id] = { room, username };
    console.log(`${username} joined room: ${room}`);
    // Notify EVERYONE in the room (including sender) to be safe
    io.to(room).emit("notification", `${username} has joined the room!`);
  });

  socket.on("code_change", (data) => {
    socket.to(data.room).emit("receive_code", data.code);
  });

  socket.on("disconnect", () => {
    const user = userMap[socket.id];
    if (user) {
      socket.to(user.room).emit("notification", `${user.username} has left the room.`);
      delete userMap[socket.id];
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
});