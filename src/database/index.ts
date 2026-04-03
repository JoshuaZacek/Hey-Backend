import pg from "pg";

export default new pg.Client({
  connectionString: process.env.DATABASE_URL,
});
