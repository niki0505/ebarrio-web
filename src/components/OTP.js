import { useRef, useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";
import { OtpContext } from "../context/OtpContext";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

//ICONS
import AppLogo from "../assets/applogo-darkbg.png";
import { IoArrowBack } from "react-icons/io5";

function OTP() {
  const location = useLocation();
  const navigation = useNavigate();
  const { sendOTP, verifyOTP } = useContext(OtpContext);
  const { setIsAuthenticated } = useContext(AuthContext);
  const { username, mobilenumber } = location.state;
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendCount, setResendCount] = useState(0);
  const [OTP, setOTP] = useState("");

  useEffect(() => {
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
      try {
        sendOTP(username, mobilenumber);
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

  const handleVerify = async () => {
    try {
      const result = await verifyOTP(username, OTP);
      alert(result.message);
      try {
        await api.put(`/login/${username}`);
        setIsAuthenticated(true);
      } catch (error) {
        console.log("Error logging in", error);
      }
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        console.log("❌ Error status:", response.status);
        alert(response.data.message || "Something went wrong.");
      } else {
        console.log("❌ Network or unknown error:", error.message);
        alert("An unexpected error occurred.");
      }
    }
  };

  useEffect(() => {
    if (OTP.length === 6) {
      const timeout = setTimeout(() => {
        handleVerify();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [OTP]);

  const handleOTPChange = (text) => {
    setOTP(text);
  };

  const maskMobileNumber = (number) => {
    if (!number || number.length < 4) return number;
    const start = number.slice(0, 2);
    const end = number.slice(-2);
    const masked = "*".repeat(number.length - 4);
    return `${start}${masked}${end}`;
  };

  return (
    <>
      <div
        className="w-screen h-screen relative overflow-hidden"
        style={{
          backgroundImage: `radial-gradient(circle, #0981B4 0%, #075D81 50%, #04384E 100%)`,
        }}
      >
        <img
          src={AppLogo}
          alt="App Logo"
          className="w-[400px] h-[400px] absolute bottom-[-100px] left-[-90px]"
        />
        <div className="modal-container">
          <div className="flex flex-col bg-white rounded-xl shadow-lg p-5 w-[25rem] h-[25rem] ">
            <IoArrowBack
              className="text-2xl"
              onClick={() => navigation("/login")}
            />
            <div className="p-4">
              <div>
                <h1 className="header-text text-start">Account Verification</h1>
                <div className="flex flex-col mt-4">
                  <span className="text-[#808080] font-subTitle font-semibold text-[14px]">
                    Enter the 6 digit code sent to:
                  </span>
                  <span className="text-navy-blue font-semibold">
                    {maskMobileNumber(mobilenumber)}
                  </span>
                </div>
              </div>

              <div className="w-full mt-10">
                <OtpInput
                  value={OTP}
                  onChange={handleOTPChange}
                  numInputs={6}
                  inputType="tel"
                  isInputNum
                  shouldAutoFocus
                  renderSeparator={<span>-</span>}
                  renderInput={(props) => (
                    <input
                      {...props}
                      className="w-full h-[60px] mx-2 text-lg text-center border border-gray-300 rounded-[10px] focus:outline-none bg-[#EBEBEB] font-medium"
                      style={{ maxWidth: "100%" }}
                    />
                  )}
                />
              </div>
              {isResendDisabled ? (
                <div className="text-[#808080] font-subTitle font-bold text-[14px] mt-5 text-end">
                  Resend OTP in{" "}
                  <span className="text-red-600">{resendTimer}</span> second
                  {resendTimer !== 1 ? "s" : ""}
                </div>
              ) : (
                <p
                  onClick={handleResend}
                  className="cursor-pointer mt-5 text-end text-[#808080] font-subTitle font-bold text-[14px]"
                >
                  Resend OTP
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OTP;
