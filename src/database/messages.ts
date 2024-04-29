import db from "./index.js";

export default class Messages {
  static async create(
    sent_by: string,
    sent_to: string,
    message_text: string,
    is_group_chat: boolean
  ) {
    const sent_to_field = is_group_chat ? "Sent_To_Group" : "Sent_To_User";

    // values is cast as type unknown[] to avoid errors with TypeScript
    const values: unknown[] = [sent_to, sent_by, is_group_chat, message_text];
    const query = `INSERT INTO Messages (${sent_to_field}, Sent_By, Group_Chat, Date_Created, Message) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4) RETURNING *`;

    const { rows } = await db.query(query, values);
    const message = rows[0];

    return message;
  }

  static async get(user_id: string, other_id: string, limit: number, cursor?: string) {
    // values is cast as type unknown[] to avoid errors with TypeScript
    const values: unknown[] = [user_id, other_id, cursor || "NOW()", limit]; // other_id can be a user ID or a group ID
    const query = `SELECT * FROM Messages 
      WHERE $1 IN (Sent_To_User, Sent_To_Group, Sent_By)
        AND $2 IN (Sent_To_User, Sent_To_Group, Sent_By)
        AND date_trunc('milliseconds', Date_Created) <= $3
      ORDER BY Date_Created DESC
      LIMIT $4 + 1`;

    const { rows } = await db.query(query, values);
    let next_cursor = null;

    // Cursors
    if (rows.length - 1 == limit) {
      next_cursor = rows[limit].date_created;
      rows.pop();
    }

    return {
      messages: rows,
      next_cursor: next_cursor,
    };
  }
}
