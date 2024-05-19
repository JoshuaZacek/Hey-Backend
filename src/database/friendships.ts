// Imports/Libraries
import db from "./index.js";
import Users from "./users.js";

export default class Friendships {
  static async create(requester_user_id: string, addressee_account_code: string) {
    const addressee = await Users.find_by_code(addressee_account_code);

    // If no user with matching account code is found/User gave their own account code
    if (!addressee || addressee.user_id == requester_user_id) {
      throw Error("INVALID_ACC_CODE");
    }

    const values = [requester_user_id, addressee.user_id];
    const query =
      "INSERT INTO Friendships (Requester, Addressee) VALUES ($1, $2) RETURNING *";

    const { rows } = await db.query(query, values);
    const friendship = rows[0]; // Only 1 or no results are returned, so rows[0] either gives addressee or 'undefined'

    return {
      friendship_id: friendship.friendship_id,
      addressee: {
        user_id: addressee.user_id,
        name: addressee.name,
        avatar: addressee.avatar,
      },
    };
  }

  // Finds A Friendship Between Two Users
  static async find(user_id_1: string, user_id_2: string) {
    const values = [user_id_1, user_id_2];
    const query =
      "SELECT * FROM Friendships WHERE $1 IN (Requester, Addressee) AND $2 IN (Requester, Addressee) AND NOT $1 = $2";

    const { rows } = await db.query(query, values);
    const friendship = rows[0]; // Only 1 or 0 rows are returned

    if (rows.length == 0) {
      return null;
    } else {
      return friendship;
    }
  }

  static async delete(friendship_id: string, user_id: string) {
    const query =
      "DELETE FROM Friendships WHERE Friendship_ID = $1 AND $2 IN (Requester, Addressee) RETURNING *";
    const values = [friendship_id, user_id];

    const { rows } = await db.query(query, values);

    if (rows.length == 0) {
      // If No Records Were Deleted, That Means Friendship Couldn't Be Found, Or User Isn't A Part Of Friendship
      return null;
    } else {
      return rows[0];
    }
  }

  static async get_all(user_id: string) {
    const friends: Record<string, object[]> = {
      current: [],
      outgoing: [],
      incoming: [],
    };

    // Get All Friendships In Which User Is Involved
    const query = `
      SELECT
        f.Friendship_ID,
        json_build_object('user_id', r.user_id, 'name', r.name, 'avatar', r.avatar) AS Requester,
        json_build_object('user_id', a.user_id, 'name', a.name, 'avatar', a.avatar) AS Addressee,
        f.Pending
      FROM Friendships f
      JOIN users r ON f.requester = r.user_id
      JOIN users a ON f.addressee = a.user_id
      WHERE $1 IN (f.Requester, f.Addressee)`;

    const { rows } = await db.query(query, [user_id]);

    // Go Over Each Friendship And Sort Them Into Current, Outgoing Or Incoming Categories
    for (const i in rows) {
      const friendship = rows[i];

      const pending = friendship.pending;
      const addressee = friendship.addressee;
      const requester = friendship.requester;
      const friendship_id = friendship.friendship_id;

      const friend = {
        friendship_id,
        user: null,
      };

      if (!pending) {
        if (addressee.user_id == user_id) {
          friend.user = requester;
        } else if (requester.user_id == user_id) {
          friend.user = addressee;
        }
        friends.current.push(friend);
      } else if (pending && addressee.user_id == user_id) {
        friend.user = requester;
        friends.incoming.push(friend);
      } else if (pending && requester.user_id == user_id) {
        friend.user = addressee;
        friends.outgoing.push(friend);
      }
    }

    return friends;
  }

  static async update_pending(friendship_id: string, addressee_user_id: string) {
    const values = [friendship_id, addressee_user_id];
    const query =
      "UPDATE Friendships SET Pending = false WHERE Friendship_ID = $1 AND Addressee = $2 RETURNING *";

    const { rows } = await db.query(query, values);
    const friendship = rows[0]; // Only 1 or no results are returned, so rows[0] either gives addressee or 'undefined'

    if (!friendship) {
      return null;
    } else {
      return friendship;
    }
  }
}
