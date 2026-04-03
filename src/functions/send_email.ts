// Imports/Libraries
import { createTransport } from "nodemailer";

// Configure Nodemailer
const transporter = createTransport({
  host: process.env.EMAILHOST,
  port: Number(process.env.EMAILPORT),
  secure: false,
  auth: {
    user: process.env.EMAILUSERNAME,
    pass: process.env.EMAILPASSWORD,
  },
});

export default async function send_email(
  email_address: string,
  subject: string,
  text: string,
) {
  await transporter.sendMail({
    from: process.env.EMAILUSERNAME,
    to: email_address,
    subject,
    text,
  });
}
