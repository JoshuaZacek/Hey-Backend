import { Router } from "express";
import Sessions from "../database/sessions.js";

const router = Router();

router.use(async (req, res, next) => {
  if (!req.cookies.session) return res.status(401).send("Missing Session Cookie.");

  // Find session using session ID in cookie
  const session = await Sessions.find_by_id(req.cookies.session);

  // Session doesn't exist
  if (!session) {
    return res.status(403).send("Invalid Session ID.");
  }

  // Session has expired
  if (new Date(session.expires) <= new Date()) {
    return res.status(403).send("Session Has Expired.");
  }

  // Session is unverified
  if (!session.verified) {
    return res.sendStatus(403).send("Session Is Unverified.");
  }

  // Session is valid
  res.locals.session = session;
  next();
});

export default router;
