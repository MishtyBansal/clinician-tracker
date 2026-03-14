import sgMail from "@sendgrid/mail";

// sends an email to alert the user if a phlebotomist has left the range

export function send_Email(clinicianID) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: "mishtybansal3@gmail.com",
    from: "mishtyb@umich.edu",
    subject: "Clinician " + clinicianID + " is out of bounds!",
    text: "We've noticed that the following clinician(s) is out of bounds ",
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
