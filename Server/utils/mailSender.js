const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    const cleanPass = process.env.MAIL_PASS ? process.env.MAIL_PASS.replace(/\s+/g, '') : '';
    const host = process.env.MAIL_HOST || "smtp.gmail.com";

    const transporter = nodemailer.createTransport({
      host: host,
      port: 465,              // ✅ Port 465 (SSL) MUST be explicit because Render blocks Port 587
      secure: true,           // ✅ Must be true for port 465
      auth: {
        user: process.env.MAIL_USER,
        pass: cleanPass,
      },
      connectionTimeout: 10000, // 10s timeout to prevent infinite pending
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from: `StudyAdda <${process.env.MAIL_USER}>`,
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
