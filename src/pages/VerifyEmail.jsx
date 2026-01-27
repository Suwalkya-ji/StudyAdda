import { useEffect, useState } from "react";
import OtpInput from "react-otp-input";
import { Link } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { RxCountdownTimer } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, signUp } from "../services/operations/authAPI";
import { useNavigate } from "react-router-dom";

function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const { signupData, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Only allow access of this route when user has filled the signup form
    if (!signupData) {
      navigate("/signup");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerifyAndSignup = (e) => {
    e.preventDefault();
    const {
      accountType,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = signupData;

    dispatch(
      signUp(
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
        navigate
      )
    );
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center px-4">
      {loading ? (
        <div>
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="w-full max-w-[500px] p-4 sm:p-6 lg:p-8">
          <h1 className="my-3 text-sm sm:text-base lg:text-[1.125rem] leading-relaxed text-richblack-100">
            Verify Email
          </h1>
          <p className="text-richblack-5 font-semibold text-xl sm:text-2xl lg:text-[1.875rem] leading-tight lg:leading-[2.375rem]">
            A verification code has been sent to you. Enter the code below
          </p>
          <form onSubmit={handleVerifyAndSignup}>
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              renderInput={(props) => (
                <input
                  {...props}
                  placeholder="-"
                  style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                  }}
                  className="w-[42px] sm:w-[48px] lg:w-[60px] border-0 bg-richblack-800 rounded-[0.5rem] text-richblack-5 aspect-square text-center text-sm sm:text-base focus:border-0 focus:outline-2 focus:outline-yellow-300"
/>
              )}
              containerStyle={{
                justifyContent: "space-between",
                gap: "0 4px",
              }}
            />
            <button
              type="submit"
              className="w-full bg-yellow-300 py-3 sm:py-[12px] px-4 rounded-[8px] mt-6 font-medium text-richblack-900 transition-all duration-200 hover:scale-[0.99]"
>

              Verify Email
            </button>
          </form>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">

            <Link to="/signup">
              <p className="text-richblack-5 flex items-center gap-x-2 text-sm sm:text-base">
                <BiArrowBack /> Back To Signup
              </p>
            </Link>
            <button
              className="flex items-center text-blue-400 gap-x-2 text-sm sm:text-base hover:underline"
              onClick={() => dispatch(sendOtp(signupData.email))}
            >
              <RxCountdownTimer />
              Resend it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifyEmail;