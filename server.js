const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.static(path.join(__dirname, "client")));

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

let waitingPlayer = null;
let rooms = {};

io.on("connection", (socket) => {

    console.log(socket.id + " Connected");

    socket.on("joinGame", (playerName) => {

        socket.playerName = playerName || "Player";

        if (waitingPlayer == null) {

            waitingPlayer = socket;

            socket.emit("waiting");

        } else {

            const room = "room-" + waitingPlayer.id + "-" + socket.id;

            waitingPlayer.join(room);
            socket.join(room);

            rooms[room] = {
                players: [
                    {
                        id: waitingPlayer.id,
                        name: waitingPlayer.playerName
                    },
                    {
                        id: socket.id,
                        name: socket.playerName
                    }
                ],
                winner: null,
                canTap: false
            };

            io.to(room).emit("startPlayers", rooms[room].players);

            let count = 3;

            io.to(room).emit("countdown", count);

            const timer = setInterval(() => {

                count--;

                if (count > 0) {

                    io.to(room).emit("countdown", count);

                } else {

                    clearInterval(timer);

                    io.to(room).emit("wait");

                    const delay = Math.floor(Math.random() * 3000) + 2000;

                    setTimeout(() => {

                        rooms[room].canTap = true;

                        io.to(room).emit("go");

                    }, delay);

                }

            },1000);

            waitingPlayer = null;

        }

    });

    socket.on("tap",()=>{

        const room = [...socket.rooms].find(r=>r.startsWith("room-"));

        if(!room) return;

        if(!rooms[room].canTap) return;

        if(rooms[room].winner) return;

        rooms[room].winner = socket.id;

        rooms[room].canTap = false;

        io.to(room).emit("winner",socket.id);

    });

    socket.on("disconnect",()=>{

        if(waitingPlayer && waitingPlayer.id===socket.id){

            waitingPlayer=null;

        }

    });

});

app.get("/",(req,res)=>{

    res.sendFile(path.join(__dirname,"client","index.html"));

});

server.listen(process.env.PORT || 3000,()=>{

    console.log("Server running on http://localhost:3000");

});