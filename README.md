# Rock Paper Scissors (React + Node/Express + MongoDB Atlas)

The Express server picks the computer's move, decides the winner and saves each player's stats in MongoDB.
The React (Vite) client only shows the UI.

## 1. Create a free MongoDB Atlas database
1. Sign up at https://www.mongodb.com/atlas and create a free **M0** cluster.
2. **Database Access** -> Add a database user (username + password). Avoid special characters in the password, or URL-encode them.
3. **Network Access** -> Add IP address -> "Allow access from anywhere" (0.0.0.0/0) for learning/testing.
4. **Database** -> Connect -> Drivers -> copy the connection string.

## 2. Configure the server
```bash
cd server
cp .env.example .env      # on Windows: copy .env.example .env
```
Open `server/.env` and paste your connection string into `MONGODB_URI` (replace `<username>` and `<password>`).
The database name `rps` in the string is created automatically.

## 3. Run it
Requires Node.js 18+. From the project root:
```bash
npm run setup   # installs root, server and client dependencies (once)
npm run dev     # API on :5000, React app on :5173
```
Open http://localhost:5173. You should see "Connected to MongoDB" in the terminal.

## API
- POST /api/play                  body: { "name": "asha", "choice": "rock" | "paper" | "scissors" }
- GET  /api/players/:name         a player's stats
- POST /api/players/:name/reset   delete a player's stats
- GET  /api/leaderboard           top 5 players by wins

## Deploy (Code to Cloud)
- Backend: Render/Railway, root directory `server`, start command `npm start`, add `MONGODB_URI` as an environment variable.
- Frontend: Vercel/Netlify, root `client`, build `npm run build`.
  Change the `/api/...` fetch URLs in `client/src/App.jsx` to your deployed API URL, and restrict CORS to your frontend domain.
- Never commit your `.env` file.
