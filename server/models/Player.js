const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, lowercase: true, trim: true },
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

module.exports = mongoose.model("Player", playerSchema);
