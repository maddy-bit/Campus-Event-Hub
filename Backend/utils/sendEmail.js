const { SendMailClient } = require("zeptomail");

const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.ZEPTO_MAIL_TOKEN) {
    throw new Error("ZEPTO_MAIL_TOKEN missing");
  }

  if (!process.env.ZEPTO_MAIL_FROM) {
    throw new Error("ZEPTO_MAIL_FROM missing");
  }

  const client = new SendMailClient({
    url: "https://api.zeptomail.in/v1.1/email",
    token: process.env.ZEPTO_MAIL_TOKEN,
  });

  try {
    await client.sendMail({
      from: {
        address: process.env.ZEPTO_MAIL_FROM,
        name: "Campus Event Hub",
      },
      to: [
        {
          email_address: {
            address: to,
            name: to.split("@")[0],
          },
        },
      ],
      subject,
      htmlbody: html,
      textbody: text,
    });

    return true;
  } catch (error) {
    console.error("ZeptoMail SDK Error:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;
