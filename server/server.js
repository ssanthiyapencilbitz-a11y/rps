require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI) {
  console.error(
    "Missing MONGODB_URI. Copy server/.env.example to server/.env and add your Atlas connection string.",
  );
  process.exit(1);
}

connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`RPS API running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
