const MOVES = ["rock", "paper", "scissors"];
const BEATS = { rock: "scissors", paper: "rock", scissors: "paper" };
const NAME_RE = /^[a-z0-9 _-]{1,20}$/i;

const cleanName = (value) => String(value || "").trim();
const emptyStats = {
    played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    streak: 0,
    bestStreak: 0,
    history: [],
};

const toStats = (player) => ({
    played: player.played,
    wins: player.wins,
    losses: player.losses,
    draws: player.draws,
    streak: player.streak,
    bestStreak: player.bestStreak,
    history: player.history,
});

module.exports = {
    MOVES,
    BEATS,
    NAME_RE,
    cleanName,
    emptyStats,
    toStats,
};
