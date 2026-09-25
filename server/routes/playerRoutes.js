const express = require("express");
const {
    playRound,
    getPlayerStats,
    resetPlayerStats,
    getLeaderboard,
} = require("../controllers/playerController");

const router = express.Router();

router.post("/api/play", playRound);
router.get("/api/players/:name", getPlayerStats);
router.post("/api/players/:name/reset", resetPlayerStats);
router.get("/api/leaderboard", getLeaderboard);

module.exports = router;
