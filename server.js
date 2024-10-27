import express from "express";
const app = express();
import http from "http";
import { Server } from "socket.io";
import { ACTIONS } from "./src/Actions.js"
import path from "path";
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app);
const io = new Server(server);


app.use(express.static("dist"));
app.use((req,res,next) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

//storing in memory
const userSocketMap = {};

function getAllConnectedClients(roomId) {
  //MAP
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  ); //if not return empty map
}

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    
    const clients = getAllConnectedClients(roomId);
    // console.log(clients);

    //notifying all clients about new joiner
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED , {
        clients,
        username: username,
        socketId: socket.id,
      });
    })
    //this is to be listened from frontend
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    //sending to all clients in room except current user
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });
  
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    })

    delete userSocketMap[socket.id];
    socket.leave();
  })

});

const PORT = process.env.PORT || 5000;
// console.log(process.env.REACT_APP_BACKEND_URL);
server.listen(PORT, () => console.log(`listening on port ${PORT}`));
