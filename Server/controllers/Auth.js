const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

// Signup Controller for Registering USers
exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType = "Student",
      contactNumber,
      otp,
    } = req.body;

    // 1. Required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // 2. Password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password do not match",
      });
    }

    const normalizedEmail = email.toLowerCase();

    // 3. Existing user check
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // 4. OTP validation (latest only)
    const otpRecord = await OTP.findOne({ email: normalizedEmail })
      .sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // 5. OTP expiry (5 minutes)
    const OTP_EXPIRY = 5 * 60 * 1000;
    if (Date.now() - otpRecord.createdAt.getTime() > OTP_EXPIRY) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Create profile
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber,
    });

    // 8. Create user
    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      contactNumber,
      password: hashedPassword,
      accountType: ["Student", "Instructor"].includes(accountType)
        ? accountType
        : "Student",
      approved: accountType !== "Instructor",
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // 9. Consume OTP (IMPORTANT)
    await OTP.deleteMany({ email: normalizedEmail });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again later.",
    });
  }
};

// Login controller for authenticating users
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase();

    // 2. Find user
    const user = await User.findOne({ email: normalizedEmail })
      .populate("additionalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not registered",
      });
    }

    // 4. Password check
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // 5. Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 6. Remove sensitive fields
    user.password = undefined;

    // 7. Cookie (production-safe)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user,
      message: "Login successful",
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
    });
  }
};


// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 1. Normalize email
    email = email.toLowerCase();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User is already registered",
      });
    }

    // 3. OTP rate limit (basic)
    const recentOtp = await OTP.findOne({ email })
      .sort({ createdAt: -1 });

    if (
      recentOtp &&
      Date.now() - recentOtp.createdAt.getTime() < 60 * 1000
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another OTP",
      });
    }

    // 4. Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // 5. Remove old OTPs
    await OTP.deleteMany({ email });

    // 6. Save new OTP
    await OTP.create({ email, otp });

    // 7. Respond immediately
    res.status(200).json({
      success: true,
      message: "OTP generated successfully",
    });

    // 8. Send email async
    mailSender(
      email,
      "Your OTP for StudyAdda",
      `Your OTP is ${otp}`
    )
      .then(() => {
        console.log("OTP mail sent");
      })
      .catch((err) => {
        console.error("OTP mail error:", err.message);
      });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate OTP",
    });
  }
};


// Controller for Changing Password
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};