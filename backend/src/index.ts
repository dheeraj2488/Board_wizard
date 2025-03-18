// import express from "express";
// import cors from "cors";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { GameManager } from "./Game/GameManager";

dotenv.config();

// const app = express();
const PORT = 8000;

const wss = new WebSocketServer({ port: PORT });

const gameManager = new GameManager();

wss.on("connection", (ws) => {
    
    gameManager.listenSocket(ws);

    ws.send("Connected to the server.");

    console.log("New client connected...");

    ws.on('disconnect', () => {
        gameManager.removePlayer(ws);
    });
});

// app.use(cors());
// app.use(express.json());

// app.get("/", (req, res) => {
//     res.send("Hello from TypeScript backend!");
// });

// app.listen(PORT, () => {
//     console.log(`🚀 Server is running on http://localhost:${PORT}`);
// });
