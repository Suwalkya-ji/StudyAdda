# StudyAdda

An EdTech platform where instructors create and sell courses, and students browse, buy, and track progress through them. Built on the MERN stack with Razorpay payments and Cloudinary for media storage.

## Straight talk before you use this

This codebase's structure, controller names, and flow (Auth → OTP → Section/SubSection course builder → Razorpay capture/verify → course progress tracking) match the well-known "StudyNotion" tutorial project almost file-for-file. That's fine to use as a learning project or resume piece, but:

- If you put this on your resume, expect to be asked to explain the OTP verification flow, the JWT auth middleware, and the Razorpay payment verification signature logic live. Know them cold before you claim them.
- Don't claim you "designed the architecture" if you followed a tutorial's structure. Say you built it following a structured MERN course and highlight what you changed, debugged, or extended yourself — that's a defensible, honest claim.

## Features

**For students**
- Sign up with email OTP verification
- Browse courses by category
- Buy courses via Razorpay (order creation + signature verification)
- Track progress within a purchased course (section/sub-section completion)
- Rate and review completed courses
- View enrolled courses and update profile

**For instructors**
- Create courses with sections and sub-sections (video lectures)
- Upload course thumbnails and lecture videos (Cloudinary)
- Edit or delete their own courses
- Dashboard with enrolled-student stats and course-wise data (Chart.js)

**Platform-wide**
- JWT-based authentication with role checks (Student / Instructor / Admin)
- Password reset via emailed token
- Contact form with auto-response email
- Redux Toolkit for client-side state (auth, cart, course, profile)

## Tech Stack

**Frontend:** React 19, Vite, Redux Toolkit, React Router v7, Tailwind CSS v4, React Hook Form, Chart.js, Swiper, React Player

**Backend:** Node.js, Express 5, MongoDB with Mongoose

**Third-party services:**
- Razorpay — payment processing
- Cloudinary — image and video storage
- Nodemailer — OTP, password reset, and payment confirmation emails
- JWT + bcrypt — auth and password hashing

## Project Structure

```
StudyAdda-main/
├── src/                        # React frontend
│   ├── component/
│   │   ├── core/                # Feature components: Auth, Dashboard, Course, HomePage, ViewCourse...
│   │   └── common/               # Shared UI (Navbar, Footer, Tab, RatingStars...)
│   ├── pages/                   # Route-level pages
│   ├── services/                # Axios instance + API operation functions
│   ├── slices/                  # Redux slices (auth, cart, course, profile, viewCourse)
│   ├── reducer/                  # Combined Redux store
│   ├── hooks/                    # Custom hooks
│   └── data/                     # Static config (nav links, footer links, country codes)
└── Server/
    ├── config/                   # DB, Cloudinary, Razorpay setup
    ├── controllers/               # Route logic (Auth, Course, Section, Payments, Profile, etc.)
    ├── middlewares/               # auth.js — JWT verification + role checks
    ├── models/                    # Mongoose schemas
    ├── mail/templates/            # HTML email templates
    ├── utils/                     # Image uploader, mail sender, duration formatter
    └── routes/                    # API route definitions
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB instance (local or Atlas)
- Cloudinary account, Razorpay account, and an SMTP-capable email account

### 1. Clone and install
```bash
git clone https://github.com/Suwalkya-ji/StudyAdda.git
cd StudyAdda
npm install
cd Server && npm install && cd ..
```

### 2. Configure environment variables

Create a `.env` file inside `Server/`:
```env
PORT=4000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FOLDER_NAME=your_cloudinary_folder_name
MAIL_HOST=your_smtp_host
MAIL_USER=your_smtp_username
MAIL_PASS=your_smtp_password
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_key_secret
```

Create a `.env` file in the project root (for the frontend):
```env
VITE_BASE_URL=http://localhost:4000/api/v1
VITE_RAZORPAY_KEY=your_razorpay_key_id
```

### 3. Run it
From the project root, this starts both frontend and backend together:
```bash
npm run dev
```
Or run them separately:
```bash
npm run client   # frontend only, Vite dev server
npm run server   # backend only, via nodemon
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:4000` by default.

## Key API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/v1/auth/sendotp` | Send OTP to email for signup verification |
| POST | `/api/v1/auth/signup` | Register a new user (student/instructor) |
| POST | `/api/v1/auth/login` | Log in, returns JWT |
| POST | `/api/v1/auth/changepassword` | Change password (authenticated) |
| POST | `/api/v1/auth/reset-password-token` | Request password reset link |
| POST | `/api/v1/auth/reset-password` | Reset password using token |
| GET | `/api/v1/course/getAllCourses` | List all published courses |
| POST | `/api/v1/course/createCourse` | Create a course (instructor only) |
| POST | `/api/v1/course/addSection` / `addSubSection` | Add course content (instructor only) |
| POST | `/api/v1/course/createRating` | Submit a course rating (student only) |
| POST | `/api/v1/payment/capturePayment` | Create a Razorpay order for selected courses |
| POST | `/api/v1/payment/verifyPayment` | Verify Razorpay signature and enroll student |
| GET | `/api/v1/profile/getEnrolledCourses` | Get a student's enrolled courses |
| GET | `/api/v1/profile/instructorDashboard` | Instructor's course/revenue stats |
| POST | `/api/v1/reach/contact` | Submit contact form |

## Notes

- Auth is custom (not a third-party provider): JWT is issued on login and role (`Student`/`Instructor`/`Admin`) is checked via middleware on protected routes.
- Payment flow is two-step: `capturePayment` creates the Razorpay order, `verifyPayment` checks the signature server-side and only then marks the student enrolled — know this distinction if asked in an interview, since skipping the verification step is the difference between "we check payment" and "we don't."
- No `.env.example` exists in the repo. Add one before pushing publicly, listing variable names only — never real keys.
