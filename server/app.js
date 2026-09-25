const express = require("express");
const cors = require("cors");
const playerRoutes = require("./routes/playerRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(playerRoutes);

module.exports = app;
