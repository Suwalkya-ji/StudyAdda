// const mongoose = require("mongoose");
// const mailSender = require("../utils/mailSender");
// const emailTemplate = require("../mail/templates/emailVerificationTemplate");

// // OTP Schema
// const OTPSchema = new mongoose.Schema(
//   {
//     email: {
//       type: String,
//       required: true,
//     },
//     otp: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true } // createdAt & updatedAt auto add honge
// );

// // TTL Index → Delete OTP automatically after 5 minutes
// OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

// // Email sender function
// async function sendVerificationEmail(email, otp) {
//   try {
//     const mailResponse = await mailSender(
//       email,
//       "Verification Email from StudyAdda",
//       emailTemplate(otp)
//     );
//     console.log("Email sent successfully:", mailResponse);
//   } catch (error) {
//     console.log("Error occurred while sending email:", error);
//     throw error;
//   }
// }

// // Send email automatically when new OTP is created
// OTPSchema.pre("save", async function (next) {
//   console.log("New OTP document saved to DB");

//   if (this.isNew) {
//     await sendVerificationEmail(this.email, this.otp);
//   }

//  //next(); // important
// });


// const OTP = mongoose.model("OTP", OTPSchema);

// module.exports = OTP;

// // module.exports = mongoose.model("OTP", OTPSchema);



const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");
const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
	},
});

// Define a function to send emails
async function sendVerificationEmail(email, otp) {
	try {
		await mailSender(
			email,
			"Verification Email",
			emailTemplate(otp)
		);

		console.log("Verification email attempted");
	} catch (error) {
		console.error("Email send failed (non-blocking):", error.message);
	}
}


// Define a post-save hook to send email after the document has been saved
OTPSchema.pre("save", async function (next) {
	console.log("New document saved to database");

	// Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;