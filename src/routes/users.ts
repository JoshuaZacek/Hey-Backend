// Imports/Libraries
import { Request, Response, Router } from "express";
import is_valid_email from "../functions/is_valid_email.js";
import is_valid_url from "../functions/is_valid_url.js";
import Users from "../database/users.js";
import { DatabaseError } from "pg";
import is_empty from "../functions/is_empty.js";
import is_type_correct from "../functions/is_type_correct.js";

// Create Express.js router
const router = Router();

// Create User
router.post("/create", async (req: Request, res: Response) => {
  // Get request parameters
  const email = req.body?.email;
  const name = req.body?.name;
  const avatar = req.body?.avatar;

  // Validation
  const errors: { [key: string]: string } = {};

  // Email validations
  if (!is_type_correct(email, "string")) {
    errors.email = "Email Must Be A String.";
  } else if (is_empty(email)) {
    errors.email = "Email Is Required.";
  } else if (email.length > 255) {
    errors.email = "Email Is Too Long, Maximum Length Is 255 Characters.";
  } else if (!is_valid_email(email)) {
    errors.email = "Not In Valid Email Format.";
  }

  // Name validations
  if (!is_type_correct(name, "string")) {
    errors.name = "Name Must Be A String.";
  } else if (is_empty(name)) {
    errors.name = "Name Is Required.";
  } else if (name.length > 255) {
    errors.name = "Name Is Too Long, Maximum Length Is 255 Characters.";
  }

  // Avatar validations (only do validations if avatar is provided as it's not required)
  if (!is_empty(avatar)) {
    if (!is_type_correct(avatar, "string")) {
      errors.avatar = "Avatar Must Be A String.";
    } else if (!is_valid_url(avatar)) {
      errors.avatar = "Not In Valid URL Format.";
    }
  }

  // Send error messages for failed validations
  if (!is_empty(errors)) {
    return res.status(400).send(errors);
  }

  // Create User
  try {
    await Users.create(email, name, avatar);
  } catch (error) {
    const database_error = error as DatabaseError;

    if (database_error.code == 23505) {
      errors.email = "Email Is Already In Use. Please Use A Different Email.";
      return res.status(400).send(errors);
    } else {
      throw error;
    }
  }

  return res.send(`User '${name}' Created.`);
});

export default router;
