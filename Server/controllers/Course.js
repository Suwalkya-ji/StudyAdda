const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader"); 


//  create course handler function
exports.createCourse = async(req,res) => {
    try{
        // Get user ID from request object
		const userId = req.user.id;

        // fetch data
        let {courseName,
              courseDescription,
              whatYouWillLearn,
              price,
            //   tag,
              category,
              status,
              instructions,
            } = req.body;

        // get thumbnail
        // const thumbnail = req.files.thumbnailImage;

        // validation
        if(!courseName ||
           !courseDescription ||
           !whatYouWillLearn ||
           !price ||
        //    !tag ||
        //    !thumbnail || 
           !category
        ){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        if (!status || status === undefined) {
			status = "Draft";
		}

		// Check if the user is an instructor
        const instructorDetails = await User.findById(userId, {
            accountType: "Instructor",
        });

        console.log("Instructor Details ", instructorDetails );

        //TODO: verify that userID and instructorDetails._id are same or different


        if(!instructorDetails) {
            return res.status(400).json({
                success:false,
                message:'Instructor Details not found',
            });
        }

        // check given category is valid or not
        const categoryDetails = await Category.findById(category);
        
        if(!categoryDetails) {
            return res.status(400).json({
                success:false,
                message:'category Details not found',
            });
        }

        // upload Image to Cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // create a entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            // tag: tag,
            category: categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            // status: status,
            instruction : instructions,
        })

        // add the new course to the user schema of Instructor
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id
                }
            },
            {new:true},
        )

        //Todo:  update the Tag ka schema (HW milla h )
        // update the Tag 


        return res.status(200).json({
            success:true,
            message:"Course Created Successfully ",
            data :newCourse
        });

    }

    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create Course',
            error:error.message,
        })
    }
}


// get All Course handler function

exports.getAllCourses = async(req,res) => {
    try{
            const allCourses = await Course.find({})
            // TODO: change the below statement incremently and add on this code later
            // , {courseName:true,
            //                                             price:true,
            //                                             thumbnail:true,
            //                                             instructor:true,
            //                                             ratingAndReviews:true,
            //                                             studentsEnrolled:true,})
            //                                             .populate("instructor")
            //                                             .exec();
            
            return res.status(200).json({
                success:true,
                message:'Data for all courses fetched successfully ',
                data:allCourses, 
            })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Cannot Fetch course data',
            error:error.message,
        })
    }
}


// get Course Details 

exports.getCourseDetails = async (req,res) => {
    try{
            // get ID 
            const {courseId} = req.body;

            // find course Details
            const courseDetails = await Course.find(
                                    {_id:courseId})
                                    .populate({
                                        path:"instructor",
                                        populate:{
                                            path:"additionalDetails",
                                        },

                                    })
                                    .populate("category")
                                    // .populate("ratingAndreviews")
                                    .populate({
                                        path:"courseContent",
                                        populate:{
                                            path:"subSection",
                                        },
                                    })
                                    .exec();
            
            // validation
            if(!courseDetails) {
                return res.status(400).json({
                    success:false,
                    message:`Could not find the course with ${courseId}`,
                })
            }

            // return response 
            return res.status(200).json({
                success:true,
                message:"Course Details fatched successfully",
                data:courseDetails,
            })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });

    }
}