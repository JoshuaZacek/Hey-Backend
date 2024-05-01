import { Router } from "express";
import Sessions from "../database/sessions.js";

const router = Router();

router.use(async (req, res, next) => {
  if (!req.cookies.session) return res.status(401).send("Missing Session Cookie.");

  // Check session ID
  const [status, data] = await check_session_id(req.cookies.session);

  if (status == "error") {
    return res.status(403).send(data);
  }

  // Session is valid
  res.locals.session = data;
  next();
});

export async function check_session_id(session_id: string) {
  // Find session using session ID in cookie
  const session = await Sessions.find_by_id(session_id);

  // Session doesn't exist
  if (!session) {
    return ["error", "Invalid Session ID."];
  }

  // Session has expired
  if (new Date(session.expires) <= new Date()) {
    return ["error", "Session Has Expired."];
  }

  // Session is unverified
  if (!session.verified) {
    return ["error", "Session Is Unverified."];
  }

  return ["session", session];
}

export default router;
