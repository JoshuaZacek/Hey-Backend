// Imports/Libraries
import random_integer from "../functions/random_integer.js";
import db from "./index.js";

export default class Verification_Codes {
  static async create(session_id: string) {
    // Generate 6-digit verification code
    const verification_code = random_integer(100000, 999999);

    const current_time = new Date();
    current_time.setMinutes(current_time.getMinutes() + 15); // Add 15 Minutes To Current Time
    const expiry = current_time.toISOString(); // Get Current Time + 15 Minutes As ISO Date String, UTC+0

    // values is cast as type unknown[] to avoid errors with TypeScript
    const values: unknown[] = [session_id, verification_code, expiry];
    const query =
      "INSERT INTO Verification_Codes (Session_ID, Code, Expires) VALUES ($1, $2, $3) RETURNING *";

    await db.query(query, values);

    return verification_code;
  }

  static async find_by_session_id(session_id: string) {
    const query = "SELECT * FROM Verification_Codes WHERE Session_ID = $1";

    const { rows } = await db.query(query, [session_id]); // Only 1 or 0 rows are returned
    const verification_code = rows[0];

    return verification_code;
  }
}
