const Profile = require("../models/Profile");
const User = require("../models/User");
const {uploadImageToCloudinary}  = require ("../utils/imageUploader")

exports.updateProfile  = async(req,res) =>  {
    try{
            // get data
            const{dateOfBirth="", about="", contactNumber, gender} = req.body;

            // get UserId
            const id = req.user.id;

            // validation
            if(!contactNumber || !gender || !id){
                return res.status(400).json({
                    success:false,
                    message:'All fields are required',
                });
            }
            // find profile
            const userDetails = await User.findById(id);
            const profileId = userDetails.additionalDetails;
            const ProfileDetails = await Profile.findById(profileId);

            // update profile
            ProfileDetails.dateOfBirth = dateOfBirth;
            ProfileDetails.about = about;
            ProfileDetails.gender = gender;
            ProfileDetails.contactNumber = contactNumber;

            await ProfileDetails.save();

            // return response

            return res.status(200).json({
                success:true,
                message:'Profile Updated Successsfully',
                ProfileDetails
            });
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            error:error.message
        });
    }
}


// deleteAccount
//   Explore -. how can we schedule this deletion operation
exports.deleteAccount = async(req,res) => {
    try{
            // get id
            const id = req.user.id;

            // validation
            const userDetails = await User.findById(id);
            if(!userDetails) {
                return res.status(404).json({
                    success:false,
                    message:"User not found",
                });
            }

            // delete profile -> geneder,contact no. , etc
            await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

            // TODO: HW : unenrol user from all enrolled courses

            // delete user
            await User.findByIdAndDelete({_id:id});

            // return response
            return res.status(200).json({
                success:true,
                message:'User Deleted Successfully',
            })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"User cannot be deleted Successfully"
        })
    }
};


// get all details of user
exports.getAllUserDetails = async(req,res) => {
    try{
        // get id
        const id = req.user.id;

        // validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        // return response

        return res.status(200).json({
            success:true,
            message:'User Data Fetched Successfully',
            userData : userDetails,
        });

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message,
        });
    }
}

// update display picture
exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};