# Architecture

The application follows a standard client-server architecture.

## Client
- Built with React and Vite.
- Communicates with the backend via REST API calls.
- Uses `localStorage` to persist the current player's name across sessions.

## Server
- Built with Express.
- Exposes endpoints for game logic and player data management.
- Uses Mongoose to interact with the MongoDB database.

## Data Flow
1. The client sends a POST request to `/api/play` with the user's choice.
2. The server calculates the winner, updates the player's document in MongoDB, and returns the result and updated stats.
3. The client updates the UI based on the response.
