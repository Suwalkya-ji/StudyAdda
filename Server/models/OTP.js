// const mongoose = require("mongoose");
// const mailSender = require("../utils/mailSender");
// const emailTemplate = require("../mail/templates/emailVerificationTemplate")

// const OTPSchema = new mongoose.Schema({
//     email:{
//         type:String,
//         required:true,
//     },
//     otp:{
//         type:String,
//         required:true,
//     },
//     createdAt: {
//         type:Date,
//         default:Date.now(),
//         expires: 60*5,
//     },
// });


// //  a function to send email

// async function sendVerificationEmail(email, otp) {
//     try{
//         const mailResponse = await mailSender(email, "Verification Email from StudyAdda", emailTemplate(otp));
//         console.log("Email send Successfully: ", mailResponse);
//     }
//     catch(error) {
//         console.log("error occured while sending mails: ", error);
//         throw error;
//     }
// }

// OTPSchema.pre("save", async function (next) {
//     console.log("New document saved to database");

//     if(this.isNew) {

//         await sendVerificationEmail(this.email, this.otp);
//     }
//     // next();
// })


// module.exports = mongoose.model("OTP", OTPSchema);



const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

// OTP Schema
const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // createdAt & updatedAt auto add honge
);

// TTL Index → Delete OTP automatically after 5 minutes
OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

// Email sender function
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from StudyAdda",
      emailTemplate(otp)
    );
    console.log("Email sent successfully:", mailResponse);
  } catch (error) {
    console.log("Error occurred while sending email:", error);
    throw error;
  }
}

// Send email automatically when new OTP is created
OTPSchema.pre("save", async function (next) {
  console.log("New OTP document saved to DB");

  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }

 // next(); // important
});

module.exports = mongoose.model("OTP", OTPSchema);
