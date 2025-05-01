# 🧙‍♂️ BoardWizard

**BoardWizard** is a real-time, multiplayer, graph-based strategy game built with TypeScript and WebSockets. Players must navigate a shared board, leveraging both movement and path-blocking mechanics, while ensuring the board remains connected using advanced graph theory concepts like **Tarjan's Algorithm**.

## 🎮 Game Overview

- 4 players compete on a shared board.
- Each player has a unique target location (their respective axis corner) they must reach to win.
- Turns are taken in sequence, with each player having two options:
  - **Move** to an adjacent node.
  - **Block** a path by deleting an edge between two nodes (columns on the board).

## 🧠 Core Concepts

- **Graph-Based Board**: The entire game board is modeled as a graph with nodes and undirected edges.
- **Blocking Mechanism**: Players can place blockers to delete edges, altering the graph's connectivity.
- **Bridge Detection**: Before a block is placed, the system uses **Tarjan's Algorithm** to determine if the edge is a bridge. Bridges cannot be removed, as doing so would disconnect the graph and potentially trap players unfairly.
- **Real-Time Gameplay**: WebSocket integration ensures seamless communication and updates across all clients.

## 🛠️ Tech Stack

- **Language**: TypeScript , tailwindcss , Websockets
- **Real-time Communication**: WebSockets
- **Graph Theory**: Custom implementation of Tarjan's Algorithm for bridge detection
- **Frontend**: Interactive board with click-based edge manipulation
- **Backend**: WebSocket server handling game state, moves, and graph validation

## 📂 Features

- ✅ Multiplayer support (up to 4 players)
- ✅ Turn-based logic with real-time feedback
- ✅ Click-based path blocking
- ✅ Bridge safety check using Tarjan’s algorithm
- ✅ Graph integrity maintained throughout the game

🧪 Future Improvements
  
UI enhancements and animations

AI opponent for solo mode

In-game chat

Leaderboard and player stats



## 🚀 Setup Instructions

# Clone the repository
git clone https://github.com/your-username/BoardWizard.git
cd BoardWizard

# Install dependencies
cd front end
npm install

# Start the development server
npm run dev


