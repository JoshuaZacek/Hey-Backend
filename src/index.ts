// Libraries
import express from "express";
import "dotenv/config";
import { db } from "./db/index.js";

// Express Config
const app = express();
const port = 8080;

// Routes
app.get("/index", (req, res) => {
  res.send("Hello, World!");
});

// Connect to PostgreSQL database
await db.connect();
console.log("Database Connection Successful!");

// Start HTTP Server
app.listen(port, () => {
  console.log(`Started Hey Backend. Port: ${port}`);
});
