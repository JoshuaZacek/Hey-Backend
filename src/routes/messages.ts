// Imports/Libraries
import { Request, Response, Router } from "express";
import verified_session from "../functions/verified_session.js";
import non_pending_friendship_or_group_chat_member from "../functions/non_pending_friendship_or_group_chat_member.js";
import is_type_correct from "../functions/is_type_correct.js";
import is_empty from "../functions/is_empty.js";
import Messages from "../database/messages.js";
import { websockets } from "../index.js";

// Create Express.js router
const router = Router();

// Require a VERIFIED SESSION to use these routes
router.use(verified_session);

// Require user to be in a non-pending friendship with other person whose ID they provide
// Or require user to be a member of the group chat they provided the ID for
router.use(non_pending_friendship_or_group_chat_member);

router.post("/create", async (req: Request, res: Response) => {
  // Get request parameters
  const friend_id = req.body?.friend_id; // Validations on friend ID already done in non_pending_friendship_or_group_chat_member
  const message_text = req.body?.message_text;
  const group_chat = req.body?.group_chat; // Validations on group chat already done in non_pending_friendship_or_group_chat_member
  const user_id = res.locals.session.user_id; // Get User's ID From Their Session

  // Validation
  const errors: { [key: string]: string } = {};

  // Message Text Validations
  if (!is_type_correct(message_text, "string")) {
    errors.message_text = "Message Text Must Be A String.";
  } else if (is_empty(message_text)) {
    errors.message_text = "Message Text Is Required.";
  }

  // Send error messages for failed validations
  if (!is_empty(errors)) {
    return res.status(400).send(errors);
  }

  // Create message in database, and sent it back to user
  const message = await Messages.create(user_id, friend_id, message_text, group_chat);

  const receiver_websockets = websockets.get(friend_id);
  for (const i in receiver_websockets) {
    receiver_websockets[i].send(JSON.stringify(message));
  }

  return res.send(message);
});

router.post("/get", async (req: Request, res: Response) => {
  const user_id = res.locals.session.user_id; // Get User's ID From Their Session
  const friend_id = req.body?.friend_id; // Validations on friend ID already done in non_pending_friendship_or_group_chat_member
  const cursor = req.body?.cursor; // Cursor for pagination

  req.params;

  // Validation
  const errors: { [key: string]: string } = {};

  // Cursor validations
  if (!is_type_correct(cursor, "string")) {
    errors.cursor = "Cursor Must Be A String.";
  }

  // Send error messages for failed validations
  if (!is_empty(errors)) {
    return res.status(400).send(errors);
  }

  // Get Messages And Next Cursor
  const messages_and_next_cursor = await Messages.get(user_id, friend_id, 25, cursor);

  res.send(messages_and_next_cursor);
});

export default router;
