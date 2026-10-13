# API Reference

All API endpoints are prefixed with `/api`.

## Endpoints
- `POST /api/play`: Submits a move. Requires a JSON body: `{ "name": "string", "choice": "rock" | "paper" | "scissors" }`.
- `GET /api/players/:name`: Retrieves statistics for a specific player.
- `POST /api/players/:name/reset`: Deletes statistics for a specific player.
- `GET /api/leaderboard`: Returns the top 5 players based on wins and streaks.
