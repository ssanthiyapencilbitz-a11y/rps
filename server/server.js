require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;
const MOVES = ["rock", "paper", "scissors"];
const BEATS = { rock: "scissors", paper: "rock", scissors: "paper" };

if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI. Copy server/.env.example to server/.env and add your Atlas connection string.");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// ---- MongoDB model: one document per player ----
const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, lowercase: true, trim: true }, // lookup key
  displayName: { type: String, required: true },
  played: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  history: [{
    player: String,
    computer: String,
    result: String,
    at: { type: Date, default: Date.now },
  }],
});
const Player = mongoose.model("Player", playerSchema);

const NAME_RE = /^[a-z0-9 _-]{1,20}$/i;
const cleanName = (n) => String(n || "").trim();
const emptyStats = { played: 0, wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, history: [] };
const toStats = (p) => ({
  played: p.played, wins: p.wins, losses: p.losses, draws: p.draws,
  streak: p.streak, bestStreak: p.bestStreak, history: p.history,
});

// Server picks the computer's move, so the client can't cheat.
app.post("/api/play", async (req, res) => {
  try {
    const displayName = cleanName(req.body.name);
    const choice = String(req.body.choice || "").toLowerCase();
    if (!NAME_RE.test(displayName)) return res.status(400).json({ error: "Name must be 1-20 letters, numbers, spaces, - or _" });
    if (!MOVES.includes(choice)) return res.status(400).json({ error: "choice must be rock, paper or scissors" });

    const computer = MOVES[Math.floor(Math.random() * 3)];
    const result = choice === computer ? "draw" : BEATS[choice] === computer ? "win" : "loss";

    const key = displayName.toLowerCase();
    const p = (await Player.findOne({ name: key })) || new Player({ name: key, displayName });

    p.played++;
    if (result === "win") { p.wins++; p.streak++; p.bestStreak = Math.max(p.bestStreak, p.streak); }
    else { p.streak = 0; if (result === "loss") p.losses++; else p.draws++; }
    p.history.unshift({ player: choice, computer, result });
    p.history = p.history.slice(0, 10);
    await p.save();

    res.json({ player: choice, computer, result, stats: toStats(p) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/players/:name", async (req, res) => {
  const p = await Player.findOne({ name: cleanName(req.params.name).toLowerCase() });
  res.json(p ? toStats(p) : emptyStats);
});

app.post("/api/players/:name/reset", async (req, res) => {
  await Player.deleteOne({ name: cleanName(req.params.name).toLowerCase() });
  res.json(emptyStats);
});

app.get("/api/leaderboard", async (_req, res) => {
  const top = await Player.find({ played: { $gt: 0 } })
    .sort({ wins: -1, bestStreak: -1 })
    .limit(5)
    .select("displayName wins played bestStreak -_id");
  res.json(top);
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`RPS API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
