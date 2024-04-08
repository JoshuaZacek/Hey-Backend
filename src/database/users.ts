// Imports/Libraries
import db from "./index.js";
import random_integer from "../functions/random_integer.js";

export default class Users {
  static async create(email: string, name: string, avatar?: string) {
    const code = random_integer(100000000000, 999999999999);

    // values is cast as type unknown[] to avoid errors with TypeScript
    const values: unknown[] = [email, name, code, avatar];
    const query =
      "INSERT INTO Users (Email, Name, Code, Avatar) VALUES ($1, $2, $3, $4) RETURNING *";

    const { rows } = await db.query(query, values); // Only 1 row is returned
    const user = rows[0];

    return user;
  }

  static async find_by_email(email: string) {
    const query = "SELECT * FROM Users WHERE Email = $1";

    const { rows } = await db.query(query, [email]); // Only 1 row is returned
    const user = rows[0];

    if (rows.length == 0) {
      return null;
    } else {
      return user;
    }
  }
}
