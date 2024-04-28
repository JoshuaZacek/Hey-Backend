import db from "./index.js";

export default class Messages {
  static async create(
    sent_by: string,
    sent_to: string,
    message_text: string,
    is_group_chat: boolean
  ) {
    // values is cast as type unknown[] to avoid errors with TypeScript
    const values: unknown[] = [sent_by, sent_to, is_group_chat, message_text];
    const query =
      "INSERT INTO Messages (Sent_To, Sent_By, Group_Chat, Date_Created, Message) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)";

    const { rows } = await db.query(query, values);
    const message = rows[0];

    return message;
  }

  static async get(user_id: string, friend_id: string, limit: number, cursor?: string) {
    // values is cast as type unknown[] to avoid errors with TypeScript
    const values: unknown[] = [user_id, friend_id, cursor || "CURRENT_TIMESTAMP", limit];
    const query = `SELECT * FROM Messages 
      WHERE $1 IN (Sent_To_User, Sent_To_Group, Sent_By)
        AND $2 IN (Sent_To_User, Sent_To_Group, Sent_By)
        AND Date_Created < $3
      ORDER BY Date_Created DESC
      LIMIT $4`;

    const { rows } = await db.query(query, values);
    let next_cursor = null;

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
