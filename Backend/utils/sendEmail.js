const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.ZEPTO_SMTP_HOST,
  port: process.env.ZEPTO_SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.ZEPTO_SMTP_USER,
    pass: process.env.ZEPTO_SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: `"Campus Event Hub" <${process.env.ZEPTO_FROM_EMAIL}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;
