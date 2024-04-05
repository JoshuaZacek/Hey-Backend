// Imports/Libraries
import express from "express";
import "dotenv/config";
import db from "./database/index.js";
import users from "./routes/users.js";

// Express Config
const app = express();
const port = 8080;
app.use(express.json());

// Routes
app.use("/users", users);

// Connect to PostgreSQL database
await db.connect();
console.log("Database Connection Successful!");

// Start HTTP Server
app.listen(port, () => {
  console.log(`Started Hey Backend. Port: ${port}`);
});
