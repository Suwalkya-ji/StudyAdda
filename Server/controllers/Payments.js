// instance of razorpay  -> create configurtion in config folder
const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");


// capture the payment and intiate the Razorpay order
exports.capturePayment = async(req,res) => {
    // get coureseID and UserID
    const {course_id} = req.body;
    const userId = req.user.id;

    // validation
    // valid CourseID
    if(!course_id) {
        return res.json({
            success:false,
            message:'Please provide valid course ID',
        })
    };

    // valid courseDetails
    let course;
    
    try{
        course = await Course.findById(course_id);

        if(!course){
            return res.json({
                success:false,
                message:'Could not find the course',
            });
        }

        // user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:'Student is already enrolled',
            });
        }
        
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message: error.message,
        });
    }

    // order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount : amount*100,
        currency,
        recepit:Math.random(Date.now()).toString(),
        notes:{
            courseId : course_id,
            userId,
        }
    };

    try {
        // intiate the payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse); 

        // return response
        return res.status(200).json({
            success:true,
            courseName : course.courseName,
            courseDescription: course.courseDescription,
            thumbnail : course.thumbnail,
            orderId : paymentResponse.id,
            currency:paymentResponse.currency,
            amount: paymentResponse.amount,
        })
    } 
    catch (error) {
            console.log(error);
            return res.json({
                success:false,
                message:"Could not initiate order",
            });
    }


}




//  verify Signature of Razorpay and server

exports.verifySignature = async(req,res) => {
    const webhookSecrect = "12345678"    //server se milli secrect key

    const signature = req.headers["x-razorpay-signature"];   // razorpay ne jo seceret key bheji h wo

    // convert server secret key into crypted form using algo "sha256"

    const shasum = crypto.createHmac("sha256", webhookSecrect);    //step 1
    shasum.update(JSON.stringify(req.body));   //step 2
    const digest = shasum.digest("hex")   // step 3 -> jab secret key code me convert ho jaati h uss output ko digest bolte h

    if(signature === digest) {
        console.log("Payment is Authorised");

        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try{
            // fulfill the action -> bachhe ko course me enroll karo or course me bachhe ki id ko

            // find the course and enroll the student in it
            const enrolledCourse = await Course.findByIdAndUpdate(
                                                {_id: courseId },
                                                {$push:{studentsEnrolled:userId}},
                                                {new:true},
            );

            if(!enrolledCourse) {
                return res.status(500).json({
                    success:false,
                    message:'Course not found',
                });
            }

            console.log(enrolledCourse);


            // find the student and add the course to their list enrolled courses me
            const enrolledStudent = await User.findByIdAndUpdate(
                                                {_id: userId},
                                                {$push:{courses: courseId}},
                                                {new:true},
            );
            console.log(enrolledStudent);

            // mail send krdo confirmation wala
            const emailResponse = await mailSender(
                                    enrolledStudent.email,
                                    "Congratulation from StudyAdda",
                                    "Congratulation, you are onboarded into new codehelp course",
            );

            console.log(emailResponse);

            return res.status(200).json({
                success:true,
                message:'Signature verified and Courses Added',
            });

        }
        catch(error){
                console.log(error);
                return res.status(500).json({
                    success:false,
                    message:error.message,
                })
        }
    }

    else{
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        })
    }

 };