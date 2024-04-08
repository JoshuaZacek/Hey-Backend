// Imports/Libraries
import db from "./index.js";

export default class Transcation {
  static async begin() {
    await db.query("BEGIN");
  }

  static async commit() {
    await db.query("COMMIT");
  }

  static async rollback() {
    db.query("ROLLBACK");
  }
}
