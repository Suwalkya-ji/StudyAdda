const express = require("express");
const app = express();
const dns = require("dns");
const dotenv = require("dotenv");

// Load environment variables immediately
dotenv.config();

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");

console.log("ENV CHECK:", {
  mongo: !!process.env.MONGODB_URL,
  jwt: !!process.env.JWT_SECRET,
  cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
  mail: !!process.env.MAIL_USER,
});

const PORT = process.env.PORT || 4000;

// database connect
database.connect();

/* =======================
   CORS CONFIG (NODE 22 SAFE)
======================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://study-adda-mu.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / server calls

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =======================
   MIDDLEWARES
======================= */
app.use(express.json());
app.use(cookieParser());

app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);


// cloudinary connect
cloudinaryConnect();

const aiRoutes = require("./routes/AI");

/* =======================
   ROUTES
======================= */
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);
app.use("/api/v1/ai", aiRoutes);

// default route
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your Server is up and running...",
  });
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
