const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 587,              // ✅ REQUIRED
      secure: false,          // ✅ REQUIRED
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      connectionTimeout: 10000, // ✅ prevent hanging
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

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
  }
};

module.exports = mailSender;
