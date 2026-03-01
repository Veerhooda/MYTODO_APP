require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDb } = require("./db/schema");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize database
initDb();

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/rotation", require("./routes/rotation"));
app.use("/api/blocks", require("./routes/blocks"));
app.use("/api/habits", require("./routes/habits"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/analytics", require("./routes/analytics"));

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
