// Imports/Libraries
import db from "./index.js";
import generate_account_code from "../functions/generate_account_code.js";

export default class Users {
  static async create(email: string, name: string, avatar?: string) {
    const code = await generate_account_code();

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

  static async find_by_code(code: string) {
    const query = "SELECT * FROM Users WHERE Code = $1";

    const { rows } = await db.query(query, [code]);
    const user = rows[0]; // Only 1 or no results are returned, so rows[0] either gives addressee or 'undefined'

    if (rows.length == 0) {
      return null;
    } else {
      return user;
    }
  }
}
