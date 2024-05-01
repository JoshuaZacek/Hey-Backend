// Imports/Libraries
import { Request, Response, Router } from "express";
import is_valid_email from "../functions/is_valid_email.js";
import Users from "../database/users.js";
import Transcation from "../database/transactions.js";
import Sessions from "../database/sessions.js";
import Verification_Codes from "../database/verification_codes.js";
import send_email from "../functions/send_email.js";
import is_type_correct from "../functions/is_type_correct.js";
import is_empty from "../functions/is_empty.js";

// Create Express.js router
const router = Router();

router.post("/create", async (req: Request, res: Response) => {
  // Get request parameters
  const email = req.body?.email;

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

  // Send error messages for failed validations
  if (!is_empty(errors)) {
    return res.status(400).send(errors);
  }

  // Get user's account using their email
  const user = await Users.find_by_email(email);
  if (!user) {
    return res.status(404).send("Email Is Not Registered.");
  }

  // Start Transaction
  await Transcation.begin();

  // Create Session
  const session = await Sessions.create(user.user_id);

  // Create Verification Code
  const verification_code = await Verification_Codes.create(session.session_id);

  // Send Email Containing Verification Code
  const subject = "Your Hey Verification Code";
  const message = "Your 6-Digit Verification Code Is: " + verification_code;

  await send_email(email, subject, message);

  // Save Session And Verification Code Once Email Has Been Sent
  await Transcation.commit();

  // Create Cookie For Session
  res.cookie("session", session.session_id, {
    expires: session.expires,
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });

  return res.status(200).send("Session Created.");
});

router.post("/verify", async (req: Request, res: Response) => {
  // Get request parameters
  const code = req.body?.code;
  const session_id = req.cookies?.session;

  // Validation
  const errors: { [key: string]: string } = {};

  // Code Validation
  if (!is_type_correct(code, "integer")) {
    errors.code = "Code Must Be An Integer.";
  } else if (is_empty(code)) {
    errors.code = "Code Is Required.";
  } else if (code < 100000 || code > 999999) {
    errors.code = "Code Is Out Of Range.";
  }

  // Session ID Validation
  if (is_empty(session_id)) {
    errors.session_id = "Session ID Cookie Is Required.";
  }

  if (!is_empty(errors)) {
    // Send error messages for failed validations
    return res.status(400).send(errors);
  }

  const verification_code = await Verification_Codes.find_by_session_id(session_id);

  // Session Doesn't Exist/Session Doesn't Have Verification Code
  if (!verification_code) {
    return res
      .status(404)
      .send("No Verification Code Belonging To Your Session Was Found.");
  }

  // Verification Code Has Expired
  const current_time = new Date();
  const expiry = new Date(verification_code.expires);
  if (expiry <= current_time) {
    return res.status(403).send("Your Verification Code Has Expired.");
  }

  // Verification Code And Provided Code Don't Match
  if (code != verification_code.code) {
    return res
      .status(400)
      .send("Code You Provided Doesn't Match Code That Was Sent To Your Email.");
  }

  // Verify Session
  const user = await Sessions.verify(session_id);
  res.send({
    account_code: user.code,
  });
});

router.delete("/delete", async (req: Request, res: Response) => {
  const session_id = req.cookies.session;

  // Session ID Validation
  if (is_empty(session_id)) {
    res.status(403).send("Session ID Cookie Is Required.");
  }

  // Delete Session In DB And Cookie
  await Sessions.delete(session_id);
  res.clearCookie("session");

  return res.sendStatus(204);
});

export default router;
