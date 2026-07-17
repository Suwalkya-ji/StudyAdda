const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    const cleanPass = process.env.MAIL_PASS ? process.env.MAIL_PASS.replace(/\s+/g, '') : '';
    const host = process.env.MAIL_HOST || "smtp-relay.brevo.com";
    const port = parseInt(process.env.MAIL_PORT) || 2525; // 2525 bypasses Render SMTP blocks

    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: false, // Upgrade via STARTTLS on 2525
      auth: {
        user: process.env.MAIL_USER,
        pass: cleanPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const fromEmail = process.env.MAIL_FROM || "dineshsuwalkya31@gmail.com";

    const info = await transporter.sendMail({
      from: `StudyAdda <${fromEmail}>`,
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
