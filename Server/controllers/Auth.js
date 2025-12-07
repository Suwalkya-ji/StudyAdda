const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();



//  send otp
exports.sendotp = async(req, res) => {
    try{
        // fetch email from req body
        const {email} = req.body;

        // check if user already exist
        const checkUserPresent = await User.findOne({email});

        // if user already exist, then return a response
        if(checkUserPresent) {
            return res.status(400).json({
                success: false,
                message: 'User already registered'
            })
        }

        // generate OTP if user not exist
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });

        console.log("Generated otp: ", otp);

        // check unique otp or not 
        const result  = await OTP.findOne({otp: otp});

        // if not then generate again
        while(result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets:false,
                // lowerCaseAlphabets:false,
                // specialChars:false,
            });

            // result = await OTP.findOne({otp: otp});
        }

        // create otp payload for otp entry in DB
        const otpPayload = {email, otp};

        // create an entry in DB for OTP
        const otpBody = await OTP.create(otpPayload);

        console.log("OTP Body: ", otpBody);

        // return response successfully
        res.status(200).json({
            success:true,
            message:"OTP Sent Successfully",
            otp,
        })

    }
    catch(error) {
        console.log("Error while OTP send: ", error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


// signup
exports.signup = async(req, res) => {
    try{
        // data fetch form request body
        const {
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                accountType,
                contactNumber,
                otp } = req.body;

        // validate data
        if(!firstName || !lastName || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            })
        }


        // check password and confirmPassword match
        if(password !== confirmPassword) {
            return res.status(400).json({
                success:false,
                message:'Password & confirmPassword value does not match, please try again',
            });
        }


        // check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:"User is already registered",
            });
        } 

        // find most recent otp stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt : -1}).limit(1);
        console.log(recentOtp);

		console.log("Recent otp is -> ", recentOtp);

        // validate OTP
        if(recentOtp.length === 0){
            // otp not found
            return res.status(400).json({
                success:false,
                message:"OTP not found",
            })
        } else if(otp !== recentOtp[0].otp) {
            // invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password,10);

        // entry created in DB
        const profilDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails:profilDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        // return response
        return res.status(200).json({
           success:true,
           message:'User is registered Successfully',
           user ,
        });

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'User Cannot be registered. Please try again'
        })
    }
}


// login
exports.login = async(req,res) => {
    try{
        // get data from req body
        const {email, password} = req.body;

        // validate data
        if(!email || !password) {
            return res.status(403).json({
                success:false,
                message:'All fields are required, please try again',
            });
        }

        // check user exist or not
        const user = await User.findOne({email}).populate("additionalDetails");

        // if user not exist
        if(!user) {
            return res.status(401).json({
                success:false,
                message:'User is not registered, Please signUp first',
            });
        }

        // password matching and then generate jwt token
        if(await bcrypt.compare(password, user.password)){

            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h"
            });

            user.token = token;
            user.password = undefined;

            // create cookie and send response
            const options = {
                expires : new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }

            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in Successfully',
            })

        }
        else{
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }


    }
    catch(error) {
            console.log("Error in Login", error);
            return res.status(500).json({
                success:false,
                message:'Login Failure, Please try again',
            });
    }
}


// change password
exports.changePassword = async(req, res) => {
    try{
        // get user data from req.user
        const userDetails = await User.findById(req.body.id);

        // get oldpassword, newpassword, confirmNewpassword from req.body
        const {oldPassword, newPassword, confirmNewPassword} = req.body;


        // validation old password
        const isPasswordMatch = bcrypt.compare(oldPassword, userDetails.password);

        // if old password not match
        if(!isPasswordMatch) {
            return res.status(401).json({
                success:false,
                message:"The Password is incorrect",
            })
        }

        // match the new password
        if(newPassword !== confirmNewPassword) {
            // if new password and confirm new password do not match
            return res.status(400).json({
                success:false,
                message:"The new password and confirm new password is not match"
            });
        }

        //  hash new password
        const encryptedPassword = await bcrypt.hash(newPassword, 10);


        // update password in DB  
        const updatedUserDetails = await User.findByIdAndUpdate(
                                        req.user.id,
                                        {password: encryptedPassword},
                                        {new:true},
        );

        // send Notification email

        try{
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("Email sent Successfully ", emailResponse.response);
        }
        catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

        
        // return response
            return res.status(200).json({
                success:true,
                message:"Password Updated Successfully"
            });
    }
    
    catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
}