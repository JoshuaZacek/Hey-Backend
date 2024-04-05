import pg from "pg";

export default new pg.Client({
  database: "hey",
});
