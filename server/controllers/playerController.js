const Player = require("../models/Player");
const {
    MOVES,
    BEATS,
    NAME_RE,
    cleanName,
    emptyStats,
    toStats,
} = require("../utils/game");

exports.playRound = async (req, res) => {
    try {
        const displayName = cleanName(req.body.name);
        const choice = String(req.body.choice || "").toLowerCase();

        if (!NAME_RE.test(displayName)) {
            return res.status(400).json({
                error: "Name must be 1-20 letters, numbers, spaces, - or _",
            });
        }

        if (!MOVES.includes(choice)) {
            return res.status(400).json({ error: "choice must be rock, paper or scissors" });
        }

        const computer = MOVES[Math.floor(Math.random() * MOVES.length)];
        const result =
            choice === computer ? "draw" : BEATS[choice] === computer ? "win" : "loss";

        const key = displayName.toLowerCase();
        const player = (await Player.findOne({ name: key })) || new Player({ name: key, displayName });

        player.played += 1;

        if (result === "win") {
            player.wins += 1;
            player.streak += 1;
            player.bestStreak = Math.max(player.bestStreak, player.streak);
        } else if (result === "loss") {
            player.losses += 1;
            player.streak = 0;
        } else {
            player.draws += 1;
            player.streak = 0;
        }

        player.history.unshift({ player: choice, computer, result });
        player.history = player.history.slice(0, 10);
        await player.save();

        return res.json({ player: choice, computer, result, stats: toStats(player) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};

exports.getPlayerStats = async (req, res) => {
    const player = await Player.findOne({ name: cleanName(req.params.name).toLowerCase() });
    return res.json(player ? toStats(player) : emptyStats);
};

exports.resetPlayerStats = async (req, res) => {
    await Player.deleteOne({ name: cleanName(req.params.name).toLowerCase() });
    return res.json(emptyStats);
};

exports.getLeaderboard = async (_req, res) => {
    const topPlayers = await Player.find({ played: { $gt: 0 } })
        .sort({ wins: -1, bestStreak: -1 })
        .limit(5)
        .select("displayName wins played bestStreak -_id");

    return res.json(topPlayers);
};
