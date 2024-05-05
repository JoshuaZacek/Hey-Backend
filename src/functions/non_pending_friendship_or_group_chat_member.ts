import { Router } from "express";
import is_type_correct from "./is_type_correct.js";
import is_empty from "./is_empty.js";
import Friendships from "../database/friendships.js";

const router = Router();

router.use(async (req, res, next) => {
  const friend_id = req.body?.friend_id;
  const group_chat = req.body?.group_chat;
  const user_id = res.locals.session.user.user_id;

  // Friend ID validations
  if (!is_type_correct(friend_id, "uuid")) {
    return res.status(400).send("Friend ID Must Be A UUID.");
  } else if (is_empty(friend_id)) {
    return res.status(400).send("Friend ID Is Required.");
  } else if (friend_id == user_id) {
    return res.status(400).send("Friend ID Can't Be The Same As Your Own User ID.");
  }

  // Group Chat Validations
  if (!is_type_correct(group_chat, "boolean")) {
    return res.status(400).send("Group Chat Must Be A Boolean.");
  } else if (is_empty(group_chat)) {
    return res.status(400).send("Group Chat Is Required.");
  }

  if (group_chat) {
    return res.status(503).send("Group Chats Not Supported Yet.");
  }

  const friendship = await Friendships.find(user_id, friend_id);

  // Friendship doesn't exist
  if (!friendship) {
    return res.status(403).send(`You're Not Friends With '${friend_id}'.`);
  }

  // Friendship is pending
  if (friendship.pending) {
    return res.status(403).send(`Your Friendship With '${friend_id}' Is Pending.`);
  }

  // Friendship exists and isn't pending
  next();
});

export default router;
