const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sendEmail = async ({ to, subject, text, html }) => {
  if (
    !process.env.AWS_REGION ||
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY
  ) {
    throw new Error("AWS SES credentials missing in .env");
  }

  if (!process.env.AWS_SES_FROM_EMAIL) {
    throw new Error("AWS_SES_FROM_EMAIL missing in .env");
  }

  const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: html || text,
        },
        Text: {
          Charset: "UTF-8",
          Data: text || "",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: `Campus Event Hub <${process.env.AWS_SES_FROM_EMAIL}>`,
  };

  try {
    const data = await sesClient.send(new SendEmailCommand(params));
    return true;
  } catch (error) {
    console.error("AWS SES Error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;
