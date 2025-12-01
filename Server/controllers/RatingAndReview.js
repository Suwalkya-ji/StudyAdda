const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// create Rating and review

exports.createRating = async(req,res) => {
    try{
            // get userID
            const userId = req.user.id;

            // fetch Data from req body
            const {rating, review, courseId} = req.body;

            // check if user is enrolled or not
            const courseDetails = await Course.findOne(
                {_id:courseId,
                    studentsEnrolled: {$elemMatch: {$eq: userId} },
                } );

            
                if(!courseDetails) {
                    return res.status(400).json({
                        success:false,
                        message:'Student is not enrolled in the Course',
                    });
                }


            // check if user already reviewed the course
                const alreadyReviewed = await RatingAndReview.findOne({
                    user:userId,
                    course:courseId,
                });

                if(alreadyReviewed) {
                    return res.status(4033).json({
                        success:false,
                        message:'Course is already reviewed by the user',
                    });
                }


            // create rating and review
            const ratingReview = await RatingAndReview.create({
                                            rating,
                                            review,
                                            user:userId,
                                            course:courseId,
            }) ;

            // update course with this rating/review
        const updatedCourseDetails =  await Course.findByIdAndUpdate({_id:courseId},
                {
                    $push:{
                        ratingAndReviews:ratingReview._id,
                    }
                },
                {new:true});

                console.log(updatedCourseDetails);

            // return response
            return res.status(200).json({
                success:true,
                message:"Rating and Review create Successfully",
                ratingReview,
            })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}

// getAverage rating
exports.getAverageRating = async (req, res) => {
    try{
        // get course id
        const courseId = req.body.courseId;

        // calculate avg rating

        const result = await RatingAndReview.aggregate([
            // step 1
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            // step 2
            {
                $group:{
                    _id:null, // saari rating ko ek single group me wrap kar diya
                    averageRating : {$avg: "$rating"}
                }
            }

        ])

        // return rating
        if(result.length > 0) {
            return res.status(200).json({
                success:true,
                averageRating: rating[0].averageRating,
            })
        }

        //  if no rating /review exist
        return res.status(200).json({
            success:true,
            message:'Average Rating is 0, no rating given till now ',
            averageRating:0,
        })

    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}


// get all rating and reviews

exports.getAllRating = async(req,res) => {
    try{
        const allReviews = await RatingAndReview.find({})
                                        .sort({rating:"desc"})
                                        .populate({
                                            path:"user",
                                            select:"firstName lastName email image",
                                        })
                                        .populate({
                                            path:"course",
                                            select:"courseName",
                                        })
                                        .exec();
            
        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            data:allReviews,
        });
        

    }
     catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}