import sgMail from "@sendgrid/mail";


export function sendEmail(subjectIn, textIn) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: "mishtybansal3@gmail.com",
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
      console.error(error);
    });
}
