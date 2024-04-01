import pg from "pg";

export const db = new pg.Client({
  database: "hey",
});
