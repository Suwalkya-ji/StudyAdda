const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    const cleanPass = process.env.MAIL_PASS ? process.env.MAIL_PASS.replace(/\s+/g, '') : '';
    const host = process.env.MAIL_HOST || "smtp.gmail.com";
    const isGmail = host.includes("gmail");

    const transporterConfig = isGmail
      ? {
          service: "gmail",
          auth: {
            user: process.env.MAIL_USER,
            pass: cleanPass,
          },
        }
      : {
          host: host,
          port: 465,
          secure: true,
          auth: {
            user: process.env.MAIL_USER,
            pass: cleanPass,
          },
          connectionTimeout: 15000,
          greetingTimeout: 15000,
          socketTimeout: 15000,
        };

    const transporter = nodemailer.createTransport(transporterConfig);

    const info = await transporter.sendMail({
      from: 'StudyAdda By Dinesh',
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    console.log("Mail sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Mail sender error:", error.message);
    throw error;
  }
};

module.exports = mailSender;
