// instance of razorpay  -> create configurtion in config folder
const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");


                //  Without using webhook and for multiple items dono ka process same h
                
//initiate the razorpay order
exports.capturePayment = async(req, res) => {

    const {courses} = req.body;
    const userId = req.user.id;

    if(courses.length === 0) {
        return res.json({success:false, message:"Please provide Course Id"});
    }

    let totalAmount = 0;

    for(const course_id of courses) {
        let course;
        try{
           
            course = await Course.findById(course_id);
            if(!course) {
                return res.status(200).json({success:false, message:"Could not find the course"});
            }

            const uid  = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)) {
                return res.status(200).json({success:false, message:"Student is already Enrolled"});
            }

            totalAmount += course.price;
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }
    const currency = "INR";
    const options = {
        amount: totalAmount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
    }

    try{
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success:true,
            message:paymentResponse,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({success:false, mesage:"Could not Initiate Order"});
    }

}


//verify the payment
exports.verifyPayment = async(req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    if(!razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature || !courses || !userId) {
            return res.status(200).json({success:false, message:"Payment Failed"});
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

        if(expectedSignature === razorpay_signature) {
            //enroll karwao student ko
            await enrollStudents(courses, userId, res);
            //return res
            return res.status(200).json({success:true, message:"Payment Verified"});
        }
        return res.status(200).json({success:"false", message:"Payment Failed"});

}


const enrollStudents = async(courses, userId, res) => {

    if(!courses || !userId) {
        return res.status(400).json({success:false,message:"Please Provide data for Courses or UserId"});
    }

    for(const courseId of courses) {
        try{
            //find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
            {_id:courseId},
            {$push:{studentsEnrolled:userId}},
            {new:true},
        )

        if(!enrolledCourse) {
            return res.status(500).json({success:false,message:"Course not Found"});
        }

        //find the student and add the course to their list of enrolledCOurses
        const enrolledStudent = await User.findByIdAndUpdate(userId,
            {$push:{
                courses: courseId,
            }},{new:true})
            
        ///bachhe ko mail send kardo
        const emailResponse = await mailSender(
            enrollStudents.email,
            `Successfully Enrolled into ${enrolledCourse.courseName}`,
            courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
        )    
        //console.log("Email Sent Successfully", emailResponse.response);
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }

}

exports.sendPaymentSuccessEmail = async(req, res) => {
    const {orderId, paymentId, amount} = req.body;

    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({success:false, message:"Please provide all the fields"});
    }

    try{
        //student ko dhundo
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Recieved`,
             paymentSuccessEmail(`${enrolledStudent.firstName}`,
             amount/100,orderId, paymentId)
        )
    }
    catch(error) {
        console.log("error in sending mail", error)
        return res.status(500).json({success:false, message:"Could not send email"})
    }
}





                // using webhook and for single item 

// // capture the payment and intiate the Razorpay order
// exports.capturePayment = async(req,res) => {
//     // get coureseID and UserID
//     const {course_id} = req.body;
//     const userId = req.user.id;

//     // validation
//     // valid CourseID
//     if(!course_id) {
//         return res.json({
//             success:false,
//             message:'Please provide valid course ID',
//         })
//     };

//     // valid courseDetails
//     let course;
    
//     try{
//         course = await Course.findById(course_id);

//         if(!course){
//             return res.json({
//                 success:false,
//                 message:'Could not find the course',
//             });
//         }

//         // user already pay for the same course
//         const uid = new mongoose.Types.ObjectId(userId);
//         if(course.studentsEnrolled.includes(uid)){
//             return res.status(200).json({
//                 success:false,
//                 message:'Student is already enrolled',
//             });
//         }
        
//     }
//     catch(error){
//         console.log(error);
//         return res.status(500).json({
//             success:false,
//             message: error.message,
//         });
//     }

//     // order create
//     const amount = course.price;
//     const currency = "INR";

//     const options = {
//         amount : amount*100,
//         currency,
//         recepit:Math.random(Date.now()).toString(),
//         notes:{
//             courseId : course_id,
//             userId,
//         }
//     };

//     try {
//         // intiate the payment using razorpay
//         const paymentResponse = await instance.orders.create(options);
//         console.log(paymentResponse); 

//         // return response
//         return res.status(200).json({
//             success:true,
//             courseName : course.courseName,
//             courseDescription: course.courseDescription,
//             thumbnail : course.thumbnail,
//             orderId : paymentResponse.id,
//             currency:paymentResponse.currency,
//             amount: paymentResponse.amount,
//         })
//     } 
//     catch (error) {
//             console.log(error);
//             return res.json({
//                 success:false,
//                 message:"Could not initiate order",
//             });
//     }


// }

// //  verify Signature of Razorpay and server
// exports.verifySignature = async(req,res) => {
//     const webhookSecrect = "12345678"    //server se milli secrect key

//     const signature = req.headers["x-razorpay-signature"];   // razorpay ne jo seceret key bheji h wo

//     // convert server secret key into crypted form using algo "sha256"

//     const shasum = crypto.createHmac("sha256", webhookSecrect);    //step 1
//     shasum.update(JSON.stringify(req.body));   //step 2
//     const digest = shasum.digest("hex")   // step 3 -> jab secret key code me convert ho jaati h uss output ko digest bolte h

//     if(signature === digest) {
//         console.log("Payment is Authorised");

//         const {courseId, userId} = req.body.payload.payment.entity.notes;

//         try{
//             // fulfill the action -> bachhe ko course me enroll karo or course me bachhe ki id ko

//             // find the course and enroll the student in it
//             const enrolledCourse = await Course.findByIdAndUpdate(
//                                                 {_id: courseId },
//                                                 {$push:{studentsEnrolled:userId}},
//                                                 {new:true},
//             );

//             if(!enrolledCourse) {
//                 return res.status(500).json({
//                     success:false,
//                     message:'Course not found',
//                 });
//             }

//             console.log(enrolledCourse);


//             // find the student and add the course to their list enrolled courses me
//             const enrolledStudent = await User.findByIdAndUpdate(
//                                                 {_id: userId},
//                                                 {$push:{courses: courseId}},
//                                                 {new:true},
//             );
//             console.log(enrolledStudent);

//             // mail send krdo confirmation wala
//             const emailResponse = await mailSender(
//                                     enrolledStudent.email,
//                                     "Congratulation from StudyAdda",
//                                     "Congratulation, you are onboarded into new codehelp course",
//             );

//             console.log(emailResponse);

//             return res.status(200).json({
//                 success:true,
//                 message:'Signature verified and Courses Added',
//             });

//         }
//         catch(error){
//                 console.log(error);
//                 return res.status(500).json({
//                     success:false,
//                     message:error.message,
//                 })
//         }
//     }

//     else{
//         return res.status(400).json({
//             success:false,
//             message:'Invalid request',
//         })
//     }

//  };