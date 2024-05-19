// Imports/Libraries
import db from "./index.js";
import { randomBytes } from "crypto";
import Transcation from "./transactions.js";

export default class Sessions {
  static async create(user_id: string) {
    // Generate Session ID
    const bytes = randomBytes(128);
    const session_id = bytes.toString("base64url");

    const current_time = new Date();
    current_time.setMonth(current_time.getMonth() + 1); // Add 1 Month To Current Time
    const expiry = current_time.toISOString(); // Get Current Time + 1 Month As ISO Date String, UTC+0

    const values = [session_id, expiry, user_id];
    const query =
      "INSERT INTO Sessions (Session_ID, Expires, User_ID) VALUES ($1, $2, $3) RETURNING *";

    const { rows } = await db.query(query, values); // Only 1 row is returned
    const session = rows[0];

    return session;
  }

  static async verify(session_id: string) {
    const queries = [
      "UPDATE Sessions SET Verified = true WHERE Session_ID = $1",
      "DELETE FROM Verification_Codes WHERE Session_ID = $1",
    ];

    // Start Transaction
    Transcation.begin();

    // Run Queries In Order They're Stored In Array
    for (let i in queries) {
      db.query(queries[i], [session_id]);
    }

    const { rows } = await db.query(
      "SELECT users.User_ID, users.Email, users.Name, users.Code, users.Avatar FROM users JOIN sessions ON users.user_id = sessions.user_id WHERE sessions.session_id = $1",
      [session_id]
    );

    // Save Changes
    Transcation.commit();

    return rows[0];
  }

  static async delete(session_id: string) {
    await db.query("DELETE FROM Sessions WHERE Session_ID = $1", [session_id]);
  }

  static async find_by_id(session_id: string) {
    const { rows } = await db.query(
      "SELECT s.Session_ID, json_build_object('user_id', u.user_id, 'name', u.name, 'avatar', u.avatar) AS user, s.Expires, s.Verified FROM Sessions s JOIN Users u ON s.User_ID = u.User_ID WHERE s.Session_ID = $1",
      [session_id]
    );
    const session = rows[0];

    return session;
  }
}
