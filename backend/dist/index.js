"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import express from "express";
// import cors from "cors";
const ws_1 = require("ws");
const dotenv_1 = __importDefault(require("dotenv"));
const GameManager_1 = require("./Game/GameManager");
dotenv_1.default.config();
// const app = express();
const PORT = 8000;
const wss = new ws_1.WebSocketServer({ port: PORT });
const gameManager = new GameManager_1.GameManager();
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
