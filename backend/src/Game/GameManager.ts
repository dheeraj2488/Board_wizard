import { WebSocket } from "ws";
import { INIT_GAME, MOVE, NOT_FOUND, PLACE_BLOCKER } from "./Events";
import { Game } from "./Game";
import { v4 as uuidv4 } from 'uuid';

export class GameManager{
    private games : Map<string, Game>;
    private pendingUsers: WebSocket[];

    constructor(){
        this.games = new Map();                             
        this.pendingUsers = [];
    }

    public listenSocket(playerSocket : WebSocket){  

        playerSocket.on("message", (message) => {
            
            // console.log("Message recieved: ", message.toString());

            const data = JSON.parse(message.toString()); 


            if(data.type === INIT_GAME){
                // console.log("INIT_GAME message recieved");

                this.addPlayer(playerSocket);

            }else if(data.type === MOVE){
                
                const game = this.games.get(data.payload.gameId);
                
                if(!game){
                    playerSocket.send(JSON.stringify({
                        type: NOT_FOUND,
                        payload: "Game not found"
                    }));
                    return;
                }

                game.makeMove(playerSocket, data.payload.move);
                
            }else if( data.type === PLACE_BLOCKER ){
                const game = this.games.get(data.payload.gameId);

                if(!game){
                    playerSocket.send(JSON.stringify({
                        type: NOT_FOUND,
                        payload: "Game not found"
                    }));
                    return;
                }

                game.placeBlocker(playerSocket, data.payload.blocker);
            }
        });
    }


    private addPlayer(playerSocket : WebSocket){
        this.pendingUsers.push(playerSocket);

        if(this.pendingUsers.length >= 4){
            const players = [...this.pendingUsers];

            this.pendingUsers = [];

            //game board size hardcoded here, change this to make it dynamic later...
            const newGame = new Game(players, uuidv4(), 8); // uuidv4 is used to generate unique game id here

            this.games.set(newGame.gameId, newGame);
        }
    }

    public removePlayer(playerSocket : WebSocket){
        this.pendingUsers = this.pendingUsers.filter(player => player !== playerSocket);
    }
}