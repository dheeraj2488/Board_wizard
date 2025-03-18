import { useEffect, useRef, useState } from "react";
import { GameBoard } from "../components/GameBoard";
import { Player } from "../Game/Player";
import Board from "../Game/Board";
import { getInitialisedPlayers } from "../utils/helper";
import { useSocket } from "../hooks/useSocket";
import '@ant-design/v5-patch-for-react-19';
import {
   ERROR,
   GAME_OVER,
   INIT_GAME,
   MOVE,
   PLACE_BLOCKER,
} from "../Game/Events";
import { message } from "antd";

const GamePage = () => {
   const [board, setBoard] = useState(new Board(8));
   const [blockerReq, setBlockerReq] = useState(false);
   const [players, setPlayers] = useState<Player[]>([]);
   const playersRef = useRef(players);
   const [turn, setTurn] = useState<string | null>(null);
   const [currPlayer, setCurrPlayer] = useState<string | null>(null);

   const [gameId, setGameId] = useState<string | null>(null);
   const [active, setActive] = useState<boolean>(false);
   const [winner, setWinner] = useState<string | null>(null);
   const [findMatch, setFindMatch] = useState<boolean>(false);

   const activeRef = useRef(false);

   const socket = useSocket();

   useEffect(() => {
      playersRef.current = players;
   }, [players]);

   useEffect(() => {
      if (!socket) return;

      socket.onmessage = (event) => {
         const data = JSON.parse(event.data);

         if (data.type === INIT_GAME) {
            const newPlayers = [...getInitialisedPlayers(8)];
            setPlayers(newPlayers);
            playersRef.current = newPlayers;

            setCurrPlayer(data.payload.color);
            setTurn("r");
            setGameId(data.payload.gameId);
            setActive(true);
            setFindMatch(false);
            activeRef.current = true;

         } else if (data.type === MOVE) {
            const { playerColor, move } = data.payload;
            const { from, to } = move;
            setTurn(data.payload.turn);
            updatePlayerPosition(playerColor, from, to);

         } else if (data.type === GAME_OVER) { 
            setWinner(data.payload.winner);
            setActive(false);
            activeRef.current = false;
            setTurn(null);
            setCurrPlayer(null);
            setGameId(null);

         } else if (data.type === PLACE_BLOCKER) {
            const { blocker, playerColor } = data.payload;

            console.log(playerColor);
            
            const newBoard = new Board(8, board.getBoardState().board, board.getBoardState().bridges);

            const player = playersRef.current.find(player => player.color === playerColor);

            console.log("Placing blocker", blocker, player?.position);

            newBoard.placeBlocker(blocker, player ? player.position : -1);

            setBoard(newBoard);
            setTurn(data.payload.turn);

         } else if (data.type === ERROR) {
            message.error(data.payload.message);
         }
      };
   }, [socket]);

   const updatePlayerPosition = (
      playerColor: string,
      _from: number,
      to: number
   ) => {
      const newPlayers = playersRef.current.map((player) => {
         if (player.color === playerColor) {
            player.position = to;
         }
         return player;
      });

      setPlayers(newPlayers);
      playersRef.current = newPlayers;
   };

   const startMatchMaking = () => {
      if (activeRef.current || !socket) return;
      setFindMatch(true);
      socket.send(JSON.stringify({ type: INIT_GAME }));
   };

   if (!socket) return <div>Connecting to server...</div>;

   return (
      <div className="flex items-center justify-center h-screen w-screen bg-zinc-800">
         <div className="grid md:grid-cols-10 grid-cols-1">
            <div className="md:col-span-7">
               <GameBoard
                  blockerReq={blockerReq}
                  setBlockerReq={setBlockerReq}
                  board={board}
                  setBoard={setBoard}
                  players={players}
                  setPlayers={setPlayers}
                  turn={turn}
                  currPlayer={currPlayer}
                  socket={socket}
                  gameId={gameId}
               />
            </div>

            <div className="md:col-span-3 bg-zinc-700 flex py-4 px-6 justify-center items-center">
               {!active && !winner ? (
                  <div>
                     <button
                        className={`px-6 py-3 text-center bg-green-500 text-white text-3xl rounded-lg ${
                           findMatch ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                        }`}
                        onClick={startMatchMaking}>
                        {findMatch ? "Matchmaking..." : "Play Game"}
                     </button>
                  </div>
               ) : (
                  <div> 
                     {winner && (
                        <div className="flex flex-col gap-4">
                           <div>
                           <h1 className="text-3xl font-bold text-white">Game Over</h1>
                           <h1 className="text-3xl font-bold text-white">winner is "{winner}"</h1>
                           </div>
                           <button
                              className="px-6 py-3 text-center bg-green-500 text-white text-3xl rounded-lg"
                              onClick={() => {
                                 setWinner(null)
                                 setPlayers([]);
                                 playersRef.current = [];
                              }}>
                              Play Again
                           </button>
                        </div>
                     )}
                  </div>
               )}

               {active && (
                  <div>
                     <button
                        className={`bg-red-500 text-white px-4 py-2 rounded-lg text-xl ${blockerReq ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                        onClick={() =>{ 
                           if( turn === currPlayer ){
                              setBlockerReq(true)
                           }else{
                              message.error("Not your turn")
                           }
                        }}>
                           Place Blocker
                     </button>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default GamePage;