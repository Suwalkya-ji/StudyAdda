const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    const cleanPass = process.env.MAIL_PASS ? process.env.MAIL_PASS.replace(/\s+/g, '') : '';
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: 465,              // ✅ Port 465 (SSL) works reliably on cloud hosts (Render, Vercel, etc.)
      secure: true,           // ✅ Required for port 465
      auth: {
        user: process.env.MAIL_USER,
        pass: cleanPass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
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
    throw error;
  }
};

module.exports = mailSender;
