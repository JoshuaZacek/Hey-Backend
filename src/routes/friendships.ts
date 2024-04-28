// Imports/Libraries
import { Request, Response, Router } from "express";
import { DatabaseError } from "pg";
import verified_session from "../functions/verified_session.js";
import Friendships from "../database/friendships.js";
import is_type_correct from "../functions/is_type_correct.js";
import is_empty from "../functions/is_empty.js";

// Create Express.js router
const router = Router();

// Require a VERIFIED SESSION to use these routes
router.use(verified_session);

router.post("/create", async (req: Request, res: Response) => {
  // Get request parameters
  const account_code = req.body?.account_code;

  // Validation
  const errors: { [key: string]: string } = {};

  if (!is_type_correct(account_code, "integer")) {
    errors.account_code = "Account Code Must Be An Integer.";
  } else if (is_empty(account_code)) {
    errors.account_code = "Account Code Is Required.";
  } else if (account_code < 100000000000 || account_code > 999999999999) {
    errors.account_code = "Account Code Is Out Of Range.";
  }

  if (!is_empty(errors)) {
    // Send error messages for failed validations
    return res.status(400).send(errors);
  }

  const user_id = res.locals.session.user_id; // Get User's ID From Their Session

  // Create Friendship In Database, Or Send Errors Instead
  try {
    const friendship = await Friendships.create(user_id, account_code);
    res.send(friendship);
  } catch (error) {
    // If error's message if "INVALID_ACC_CODE"
    if (error instanceof Error && error.message == "INVALID_ACC_CODE") {
      return res.status(400).send("Invalid Account Code.");
    }

    // Set database_error if error handled is specifically a Database Error
    const database_error = error as DatabaseError;

    // If error relates to DB and relates to unique contraints (Error code 23505 in postgres)
    if (database_error && database_error.code == 23505) {
      return res.status(400).send("You're Already Friends With This Person.");
    }

    // If error are not related to any of the above, let the main error handler catch it
    throw error;
  }
});

router.patch("/pending", async (req: Request, res: Response) => {
  // Get request parameters
  const friendship_id = req.body?.friendship_id;

  // Validation
  const errors: { [key: string]: string } = {};

  if (!is_type_correct(friendship_id, "uuid")) {
    errors.friendship_id = "Friendship ID Must Be A UUID.";
  } else if (is_empty(friendship_id)) {
    errors.friendship_id = "Friendship ID Is Required.";
  }

  // Send error messages for failed validations
  if (!is_empty(errors)) {
    return res.status(400).send(errors);
  }

  // Update Friendship To Set Pending To False
  const user_id = res.locals.session.user_id; // Get User's ID From Their Session

  const friendship = await Friendships.update_pending(friendship_id, user_id);

  if (!friendship) {
    return res.status(400).send("Friendship Couldn't Be Found, Or Not The Addressee.");
  }

  return res.send(`Friendship '${friendship_id}' Is No Longer Pending.`);
});

router.delete("/delete", async (req: Request, res: Response) => {
  // Get request parameters
  const friendship_id = req.body?.friendship_id;

  // Validation
  const errors: { [key: string]: string } = {};

  if (!is_type_correct(friendship_id, "uuid")) {
    errors.friendship_id = "Friendship ID Must Be A UUID.";
  } else if (is_empty(friendship_id)) {
    errors.friendship_id = "Friendship ID Is Required.";
  }

  // Send error messages for failed validations
  if (!is_empty(errors)) {
    return res.status(400).send(errors);
  }

  // Update Friendship To Set Pending To False
  const user_id = res.locals.session.user_id; // Get User's ID From Their Session

  const friendship_deleted = await Friendships.delete(friendship_id, user_id);

  if (!friendship_deleted) {
    return res.status(400).send("Friendship Couldn't Be Found, Or Not In Friendship.");
  }

  return res.sendStatus(204);
});

router.get("/all", async (req: Request, res: Response) => {
  const user_id = res.locals.session.user_id; // Get User's ID From Their Session

  // Get All Of User's Friendships
  const friends = await Friendships.get_all(user_id);

  res.send(friends);
});

export default router;
