const nodemailer = require("nodemailer");

require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Temporary fix
  },
  debug: true, // Enable debug output
});

const sendMail = async (to, orderId, subject, text, html) => {
  const acceptCallBack = `https://9e32-45-112-145-123.ngrok-free.app
/order/acceptOrder/${orderId}`;
  const rejectCallBack = `https://9e32-45-112-145-123.ngrok-free.app/order/rejectOrder/${orderId}`;
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email address
      to: to, // Recipient's email address
      subject: subject, // Email subject
      text: text, // Plain text body
      html: `<div><p>${text} </p>
      <p>Click <a href="${acceptCallBack}">here</a> to accept your order.</p>
      <p>Click <a href="${rejectCallBack}">here</a> to decline this order.</div>`, // HTML body (optional)
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
const sendProposalConfirmationMail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email address
      to: to, // Recipient's email address
      subject: subject, // Email subject
      text: text, // Plain text body
      html: `<div><p>${text} </p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
module.exports = { sendMail, sendProposalConfirmationMail };
