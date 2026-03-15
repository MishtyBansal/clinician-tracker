import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config({ path: "./sendgrid.env" });
export function sendEmail(recipient, subjectIn, textIn) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: recipient,
    from: "mishtyb@umich.edu",
    subject: subjectIn,
    text: textIn,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error("error with sending an email: " + error);
    });
}
