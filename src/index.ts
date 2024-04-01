// Libraries
import express from "express";

// Express Config
const app = express();
const port = 8080;

// Routes
app.get("/index", (req, res) => {
  res.send("Hello, World!");
});

// Start HTTP Server
app.listen(port, () => {
  console.log(`Started Hey Backend. Port: ${port}`);
});
