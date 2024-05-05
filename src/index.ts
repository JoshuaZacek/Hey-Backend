// Imports/Libraries
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import "dotenv/config";
import db from "./database/index.js";
import users from "./routes/users.js";
import sessions from "./routes/sessions.js";
import messages from "./routes/messages.js";
import friendships from "./routes/friendships.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import ws, { WebSocketServer } from "ws";
import cookie from "cookie";
import { check_session_id } from "./functions/verified_session.js";

// Express Config
const app = express();
const port = 8080;
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS,
    credentials: true,
  })
);

// Routes
app.use("/users", users);
app.use("/sessions", sessions);
app.use("/friendships", friendships);
app.use("/messages", messages);

// Express Error Handling
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  return res.status(500).send("Something Went Wrong On Our Side.");
});

// Connect to PostgreSQL database
await db.connect();
console.log("Database Connection Successful!");

// Start HTTP Server
const server = app.listen(port, () => {
  console.log(`Started Hey Backend. Port: ${port}`);
});

// Create Websocket Server
const wss = new WebSocketServer({ server });

// Store Websockets in a map
export const websockets = new Map();

declare interface CustomWebSocket extends ws.WebSocket {
  id: string;
}

wss.on("connection", async (ws: CustomWebSocket, req) => {
  const session_id = cookie.parse(`${req.headers.cookie}`).session;

  // Make sure cookie is given
  if (!session_id) {
    ws.send("Session Cookie Is Required To Use Websockets.");
    ws.terminate();
  }

  // Make sure session is valid
  const [status, data] = await check_session_id(session_id);
  if (status == "error") {
    ws.send(data);
    ws.terminate();
  }

  // Get user_id
  const user_id = data.user.user_id;

  // Initialize array for user's websockets
  if (!websockets.get(user_id)) {
    websockets.set(user_id, []);
  }

  // Add ID to websocket
  const websocket_id = crypto.randomUUID();
  ws.id = websocket_id;

  // Add this websocket to user's array of websockets
  websockets.get(user_id).push(ws);

  // Ping/Pong
  let closeWebSocket: NodeJS.Timeout | undefined;

  function ping() {
    ws.ping();

    closeWebSocket = setTimeout(() => {
      const other_websockets = websockets
        .get(user_id)
        .filter((websocket: CustomWebSocket) => websocket.id != websocket_id);

      websockets.set(user_id, other_websockets);

      ws.terminate();
    }, 10000);
  }

  function pong() {
    clearTimeout(closeWebSocket);
  }

  setInterval(() => {
    ping();
  }, 30000);

  ws.on("pong", pong);

  ws.on("close", () => {
    const other_websockets = websockets
      .get(user_id)
      .filter((websocket: CustomWebSocket) => websocket.id != websocket_id);

    websockets.set(user_id, other_websockets);
  });
});
