import { useRef, useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";
import { OtpContext } from "../context/OtpContext";
import blueBg from "../assets/blue-bg.png";
import applogo from "../assets/applogo.png";
import api from "../api";

function OTP() {
  const location = useLocation();
  const navigation = useNavigate();
  const { empID, mobilenumber, username, password, role } = location.state;
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendCount, setResendCount] = useState(0);
  const [OTP, setOTP] = useState("");
  const { otp, timer, startOtp, clearOtp } = useContext(OtpContext);
  const otpRef = useRef(null);

  useEffect(() => {
    console.log(role);
    let interval = null;
    if (isResendDisabled) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isResendDisabled]);

  const handleResend = async () => {
    if (resendCount < 3) {
      clearOtp();
      console.log("OTP from context is removed");
      console.log("Resending OTP...");
      try {
        const res = await api.post("/otp", {
          mobilenumber,
        });
        startOtp(res.data.otp, 300);
        setResendTimer(30);
        setIsResendDisabled(true);
        setResendCount((prevCount) => prevCount + 1);
        console.log("New OTP is generated");
      } catch (error) {
        console.error("Error sending OTP:", error);
        alert("Something went wrong while sending OTP");
      }
    } else {
      alert("You can only resend OTP 3 times.");
    }
  };

  useEffect(() => {
    if (otp) {
      console.log("OTP from context is active");
    } else {
      console.log("OTP from context is not active");
    }
  }, [otp]);

  const handleOTP = async (enteredOTP) => {
    if (!otp) {
      alert("OTP has expired.");
      setOTP("");
      return;
    }
    const cleanOtp = otp.toString().trim();
    const cleanEnteredOtp = enteredOTP.toString().trim();
    if (cleanOtp === cleanEnteredOtp) {
      const res = await api.post("/register", {
        username: username,
        password: password,
        empID: empID,
        role,
      });
      alert("User registered successfully. Please log in.");
      navigation("/login");
    } else {
      alert("The OTP you entered is incorrect.");
      setOTP("");
    }
  };

  const handleOTPChange = (text) => {
    setOTP(text);
    if (text.length === 6) {
      setTimeout(() => {
        handleOTP(text);
      }, 200);
    }
  };

  return (
    <>
      <div className="login-container">
        <div
          className="left-login-container"
          style={{ backgroundImage: `url(${blueBg})` }}
        >
          <img src={applogo} alt="App Logo" className="w-[256px] h-[256px]" />
        </div>

        <div className="right-login-container">
          <div className="login-form-container">
            <span className="login-title">Account Verification</span>
            <span className="text-base font-bold text-gray-400">
              Enter the 5 digit code sent to
            </span>
            <div style={{ width: "100%" }}>
              {" "}
              {/* This div now takes full available width */}
              <OtpInput
                value={OTP}
                onChange={handleOTPChange}
                numInputs={6}
                isInputNum
                shouldAutoFocus
                renderSeparator={<span>-</span>}
                renderInput={(props) => (
                  <input
                    {...props}
                    className="w-full h-[70px] mx-2 text-lg text-center border border-gray-300 rounded-[15px] focus:outline-none bg-[#EBEBEB] font-medium"
                    style={{ maxWidth: "100%" }}
                  />
                )}
              />
            </div>
            {isResendDisabled ? (
              <p className="text-gray-400 mt-10 font-bold text-base">
                Resend OTP in {resendTimer} second{resendTimer !== 1 ? "s" : ""}
              </p>
            ) : (
              <p
                onClick={handleResend}
                className="text-gray-400 font-bold text-base cursor-pointer mt-10"
              >
                Resend OTP
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default OTP;
