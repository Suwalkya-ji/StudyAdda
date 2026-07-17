# StudyAdda - Full-Stack EdTech Platform & AI Learning Hub

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)
[![React](https://img.shields.io/badge/Frontend-React%2019-61dafb.svg)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20v18%2B-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Server-Express%205-000000.svg)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20v4-38bdf8.svg)](https://tailwindcss.com)
[![AI Powered](https://img.shields.io/badge/AI%20Tutor-OpenRouter%20%2F%20Gemini-orange.svg)](https://openrouter.ai)

**StudyAdda** is a feature-rich, full-stack EdTech platform built on the MERN stack. It empowers instructors to create and monetize multi-media courses while providing students with a seamless learning experience complete with video streaming, progress tracking, secure payments, and an interactive **AI-powered Tutor**.

---

## ✨ Features

### 🎓 Student Experience
- **Interactive AI Tutor**: Ask instant doubts, generate topic explanations with real-world analogies, and take dynamic MCQ quizzes powered by LLMs (OpenRouter / Gemini AI).
- **Course Discovery**: Browse categorized course catalogs, view detailed syllabi, and read student ratings & reviews.
- **Seamless Checkout**: Secure multi-course purchasing via Razorpay integration.
- **HD Video Player**: Integrated HTML5 video player for lecture viewing with section navigation.
- **Progress Tracking**: Automatic progress updates per sub-section/lecture with overall completion metrics.
- **Ratings & Feedback**: Submit star ratings and written reviews upon completing course content.

### 👨‍🏫 Instructor Portal
- **Course Builder**: Multi-step workflow for creating courses, defining sections, and adding sub-sections with video lectures.
- **Media Management**: Direct cloud video & thumbnail uploads via Cloudinary.
- **Instructor Dashboard**: Data visualization powered by Chart.js showing total enrolled students, course sales, and revenue insights.
- **Course Management**: Edit published courses, add sections/sub-sections, or unpublish courses.

### 🔐 Platform Security & Core Architecture
- **Custom Authentication**: JWT-based auth with Role-Based Access Control (RBAC) for `Student`, `Instructor`, and `Admin`.
- **OTP Verification**: Email verification via Nodemailer with timed OTP validity for signup.
- **Password Recovery**: Secure password reset tokens delivered via email.
- **Global State Management**: Redux Toolkit slices handling authentication, cart, current course, active lecture, and user profile.
- **Modern UI/UX**: Premium dark mode theme, glassmorphism modals, and smooth micro-animations built with Tailwind CSS.

---

## 🛠️ Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Redux Toolkit, React Router v7, Tailwind CSS v4, React Hook Form, Chart.js, Swiper |
| **Backend** | Node.js, Express 5, Mongoose / MongoDB |
| **Authentication** | JSON Web Tokens (JWT), bcrypt.js, Cookie-Parser |
| **Payments** | Razorpay Payment Gateway (Order API + HMAC Signature Verification) |
| **Cloud Storage** | Cloudinary (Image & Video Uploads) |
| **Email Services** | Nodemailer (HTML Email Templates for OTP, Enrollment, Payment, Password Reset) |
| **AI Integration** | OpenRouter API / Google Gemini API with fallback models |

---

## 📂 Project Structure

```
studyAdda/
├── src/                          # React Frontend
│   ├── assets/                   # Images, logos, icons, fonts
│   ├── component/                # React Components
│   │   ├── common/               # Shared components (Navbar, Footer, Modals, RatingStars, etc.)
│   │   ├── ContactPage/          # Contact form & details
│   │   └── core/                 # Feature-specific components
│   │       ├── Auth/             # Login, Signup, OTP Verification, Password Reset
│   │       ├── Dashboard/        # Instructor stats, Cart, My Courses, Add Course, Settings
│   │       ├── HomePage/         # Hero banner, Code Blocks, Explore Courses, CTA sections
│   │       └── ViewCourse/       # Video Player, Sidebar, AI Tutor (AiTutor.jsx)
│   ├── data/                     # Static navigation, footer links, country codes
│   ├── hooks/                    # Custom React hooks
│   ├── pages/                    # Main route views (Home, CourseDetails, Catalog, Dashboard, etc.)
│   ├── reducer/                  # Combined Redux reducers
│   ├── services/                 # Axios HTTP client & API operations (aiAPI, authAPI, courseAPI, etc.)
│   └── slices/                   # Redux slices (authSlice, cartSlice, courseSlice, profileSlice, viewCourseSlice)
│
└── Server/                       # Node.js & Express Backend
    ├── config/                   # Database, Cloudinary, Razorpay initialization
    ├── controllers/              # Business logic (AI, Auth, Course, Section, SubSection, Payments, Profile, etc.)
    ├── mail/templates/           # HTML email templates
    ├── middlewares/              # JWT auth verification & role authorization (isStudent, isInstructor, isAdmin)
    ├── models/                   # Mongoose schemas (User, Course, Section, SubSection, RatingAndReview, etc.)
    ├── routes/                   # API route definitions (User, Course, Payments, Profile, AI)
    └── utils/                    # Image/video uploader, mail sender, duration calculator
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas connection URI
- **API Keys**: OpenRouter API key, Cloudinary account, Razorpay account, and SMTP credentials for email sending.

### 1. Clone the Repository
```bash
git clone https://github.com/Suwalkya-ji/StudyAdda.git
cd studyAdda
```

### 2. Install Dependencies

Install frontend dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd Server
npm install
cd ..
```

### 3. Environment Variables Configuration

Create a `.env` file in the **`Server/`** directory:
```env
PORT=4000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/studyadda
JWT_SECRET=your_jwt_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FOLDER_NAME=StudyAdda

MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_email_app_password

RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_key_secret
```

Create a `.env` file in the **root** directory (for Vite frontend):
```env
VITE_BASE_URL=http://localhost:4000/api/v1
VITE_RAZORPAY_KEY=your_razorpay_key_id
```

### 4. Start the Application

To run both frontend and backend concurrently from the root directory:
```bash
npm run dev
```

Alternatively, you can run them separately in two terminal windows:
```bash
# Terminal 1 - Frontend (Vite on http://localhost:5173)
npm run client

# Terminal 2 - Backend (Express on http://localhost:4000)
npm run server
```

---

## 🔗 Key API Routes

### 🔑 Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/sendotp` | Public | Send verification OTP to user's email |
| POST | `/signup` | Public | Register new account (Student / Instructor) |
| POST | `/login` | Public | Authenticate user & return JWT token |
| POST | `/changepassword` | Authenticated | Change account password |
| POST | `/reset-password-token` | Public | Generate & email password reset token |
| POST | `/reset-password` | Public | Set new password using token |

### 📚 Course Operations (`/api/v1/course`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/getAllCourses` | Public | Fetch all published courses |
| POST | `/getCourseDetails` | Public | Fetch complete details for a specific course |
| POST | `/createCourse` | Instructor | Create a new course with details & thumbnail |
| POST | `/addSection` | Instructor | Add a new section to a course |
| POST | `/addSubSection` | Instructor | Upload video lecture and attach to section |
| POST | `/createRating` | Student | Submit rating & review for an enrolled course |

### 💳 Payments (`/api/v1/payment`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/capturePayment` | Student | Create Razorpay order for cart items |
| POST | `/verifyPayment` | Student | Verify HMAC signature and enroll student |
| POST | `/sendPaymentSuccessEmail` | Student | Send email confirmation upon payment success |

### 🤖 AI Tutor (`/api/v1/ai`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/ask-doubt` | Student | Ask AI Tutor doubts about current lecture/topic |
| POST | `/explain-topic` | Student | Request in-depth topic breakdown with analogies |
| POST | `/generate-quiz` | Student | Generate dynamic multiple-choice quiz questions |

---

## 💳 Security & Payment Verification Flow

1. **Order Creation**: The client requests `/capturePayment`. The server creates an order with Razorpay and returns the `orderId`.
2. **Payment Execution**: The client triggers the Razorpay modal for payment processing.
3. **Signature Verification**: Upon payment completion, the client posts `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` to `/verifyPayment`.
4. **Server Authentication**: The server computes an HMAC-SHA256 signature using `RAZORPAY_SECRET` and compares it against `razorpay_signature`.
5. **Enrollment**: Only after signature validation matches is the student enrolled in the course database models and sent a confirmation email.

---

