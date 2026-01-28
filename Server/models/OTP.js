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

 //next(); // important
});


const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;

// module.exports = mongoose.model("OTP", OTPSchema);
