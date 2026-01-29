// const nodemailer = require("nodemailer");

// const mailSender = async(email, title, body) => {
//     try{
        
//         let transporter = nodemailer.createTransport({
//             host:process.env.MAIL_HOST,
//             auth:{
//                 user:process.env.MAIL_USER,
//                 pass:process.env.MAIL_PASS,
//             }
//         })

//         let info = await transporter.sendMail({
//             from: 'StudyAdda By Dinesh',
//             to: `${email}`,
//             subject: `${title}`,
//             html: `${body}`,
//         })

//         console.log(info);
//         return info;

//     }
//     catch(error) {
//         console.log(error.message);
//     }
// }


// module.exports = mailSender;

const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,      // ✅ REQUIRED
      secure: false,                    // ✅ true only for port 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },

      // 🔥 PREVENT INFINITE LOADING
      connectionTimeout: 10000, // 10s
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from: `"StudyAdda" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log("MAIL SENT:", info.messageId);
    return info;

  } catch (error) {
    console.error("MAIL SENDER ERROR:", error);
    throw error; // 🔥 VERY IMPORTANT
  }
};

module.exports = mailSender;
