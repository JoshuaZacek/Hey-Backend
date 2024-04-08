// Imports/Libraries
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import "dotenv/config";
import db from "./database/index.js";
import users from "./routes/users.js";
import sessions from "./routes/sessions.js";
import cookieParser from "cookie-parser";

// Express Config
const app = express();
const port = 8080;
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/users", users);
app.use("/sessions", sessions);

// Express Error Handling
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  return res.status(500).send("Something Went Wrong On Our Side.");
});

// Connect to PostgreSQL database
await db.connect();
console.log("Database Connection Successful!");

// Start HTTP Server
app.listen(port, () => {
  console.log(`Started Hey Backend. Port: ${port}`);
});
