const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// 1. Allow CORS for Express
app.use(cors());

// 2. Create the HTTP server
const server = http.createServer(app);

// 3. Create Socket.io Server with strict CORS settings
const io = new Server(server, {
  cors: {
    origin: "*", // <--- THIS IS CRITICAL. It allows Vercel to connect.
    methods: ["GET", "POST"],
  },
});

const userMap = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    const { room, username } = data;
    socket.join(room);
    userMap[socket.id] = { room, username };
    console.log(`${username} joined room: ${room}`);
    socket.to(room).emit("notification", `${username} has joined the room!`);
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

// 4. LISTEN ON THE SERVER, NOT THE APP
// If you use app.listen(), Socket.io will NOT work (404 Error)
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
});