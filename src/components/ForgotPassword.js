import { useRef, useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import blueBg from "../assets/blue-bg.png";
import applogo from "../assets/applogo.png";
import api from "../api";
import OtpInput from "react-otp-input";
import { OtpContext } from "../context/OtpContext";

function ForgotPassword() {
  const navigation = useNavigate();
  const [username, setUsername] = useState("");
  const [user, setUser] = useState([]);
  const { sendOTP, verifyOTP } = useContext(OtpContext);
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendCount, setResendCount] = useState(0);
  const [isExisting, setIsExisting] = useState(false);
  const [isOTPClicked, setOTPClicked] = useState(false);
  const [isQuestionsClicked, setQuestionsClicked] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [renewPassword, setReNewPassword] = useState("");
  const [OTP, setOTP] = useState("");
  const [securityquestion, setSecurityQuestion] = useState({
    question: "",
    answer: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = name === "answer" ? value.toLowerCase() : value;
    setSecurityQuestion((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleSubmit = async () => {
    setIsExisting(true);
    // try {
    //   const response = await api.get(`/checkuser/${username}`);
    //   setIsExisting(true);
    //   setUser(response.data);
    // } catch (error) {
    //   const response = error.response;
    //   if (response && response.data) {
    //     console.log("❌ Error status:", response.status);
    //     alert(response.data.message || "Something went wrong.");
    //   } else {
    //     console.log("❌ Network or unknown error:", error.message);
    //     alert("An unexpected error occurred.");
    //   }
    // }
  };

  const handleQuestionVerify = async () => {
    setIsVerified(true);
    // try {
    //   await api.post(`/verifyquestion/${username}`, { securityquestion });
    //   setIsVerified(true);
    // } catch (error) {
    //   const response = error.response;
    //   if (response && response.data) {
    //     console.log("❌ Error status:", response.status);
    //     alert(response.data.message || "Something went wrong.");
    //   } else {
    //     console.log("❌ Network or unknown error:", error.message);
    //     alert("An unexpected error occurred.");
    //   }
    // }
  };

  const handleOTP = async () => {
    setOTPClicked(true);
    // try {
    //   await api.get(`/checkotp/${username}`);
    //   if (resendCount === 3) {
    //     setIsResendDisabled(true);
    //     alert("You can only resend OTP 3 times.");
    //     setOTPClicked(false);
    //     await api.get(`/limitotp/${username}`);
    //     return;
    //   }
    //   setOTPClicked(true);
    //   setResendCount((prevCount) => prevCount + 1);
    //   setResendTimer(30);
    //   sendOTP(username, user.empID.resID.mobilenumber);
    // } catch (error) {
    //   if (error.response && error.response.status === 429) {
    //     alert("OTP use is currently disabled. Try again later.");
    //   } else {
    //     console.error("Error checking OTP:", error);
    //   }
    // }
  };

  const handleSuccessful = async () => {
    navigation("/login");
    // try {
    //   await api.post(`/newpassword/${username}`, { newPassword });
    //   alert("You have successfully reset your password!");
    //   navigation("/login");
    // } catch (error) {
    //   const response = error.response;
    //   if (response && response.data) {
    //     console.log("❌ Error status:", response.status);
    //     alert(response.data.message || "Something went wrong.");
    //   } else {
    //     console.log("❌ Network or unknown error:", error.message);
    //     alert("An unexpected error occurred.");
    //   }
    // }
  };

  useEffect(() => {
    if (!isOTPClicked || !isResendDisabled) return;
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
  }, [isResendDisabled, isOTPClicked]);

  const handleResend = async () => {
    if (resendCount < 3) {
      try {
        sendOTP(username, user.empID.resID.mobilenumber);
        setResendTimer(30);
        setIsResendDisabled(true);
        setResendCount((prevCount) => prevCount + 1);
        console.log("New OTP is generated");
      } catch (error) {
        console.error("Error sending OTP:", error);
        alert("Something went wrong while sending OTP");
      }
    } else {
      await api.get(`/limitotp/${username}`);
      alert("You can only resend OTP 3 times.");
    }
  };

  const handleVerify = async () => {
    setIsVerified(true);
    // try {
    //   const result = await verifyOTP(username, OTP);
    //   alert(result.message);
    //   setIsVerified(true);
    // } catch (error) {
    //   const response = error.response;
    //   if (response && response.data) {
    //     console.log("❌ Error status:", response.status);
    //     alert(response.data.message || "Something went wrong.");
    //   } else {
    //     console.log("❌ Network or unknown error:", error.message);
    //     alert("An unexpected error occurred.");
    //   }
    // }
  };

  useEffect(() => {
    if (isOTPClicked && OTP.length === 6) {
      const timeout = setTimeout(() => {
        handleVerify();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [OTP, isOTPClicked]);

  return (
    <>
      {/* First Design */}
      {/* Forgot Password */}
      {!isExisting && (
        <>
          <div className="login-container">
            <div
              className="left-login-container"
              style={{ backgroundImage: `url(${blueBg})` }}
            >
              <img
                src={applogo}
                alt="App Logo"
                className="w-[256px] h-[256px]"
              />
            </div>

            <div className="right-login-container">
              <div className="login-form-container">
                <span className="login-title">Forgot Password</span>

                <>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input h-[35px]"
                  />
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="actions-btn bg-btn-color-blue"
                  >
                    Submit
                  </button>
                  <a href="/login">Remember your password?</a>
                </>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Second Design */}
      {isExisting && (
        <>
          <div className="bg-blue-200">
            {/* Content */}
            {/* Reset Password */}
            {isVerified ? (
              <>
                <label>Reset Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input h-[35px]"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  onChange={(e) => setReNewPassword(e.target.value)}
                  className="form-input h-[35px]"
                />
                <button type="button" onClick={handleSuccessful}>
                  Submit
                </button>
              </>
            ) : /* One-Time Password */ isOTPClicked ? (
              <>
                <label onClick={() => setOTPClicked(false)}>Back</label>
                <label>OTP</label>
                <span className="text-base font-bold text-gray-400">
                  Enter the 6 digit code sent to
                  {/* Enter the 6 digit code sent to {user.empID.resID.mobilenumber} */}
                </span>
                <div style={{ width: "100%" }}>
                  <OtpInput
                    value={OTP}
                    onChange={setOTP}
                    numInputs={6}
                    inputType="tel"
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
                    Resend OTP in {resendTimer} second
                    {resendTimer !== 1 ? "s" : ""}
                  </p>
                ) : (
                  <p
                    onClick={handleResend}
                    className="text-gray-400 font-bold text-base cursor-pointer mt-10"
                  >
                    Resend OTP
                  </p>
                )}
              </>
            ) : /* Security Questions */ isQuestionsClicked ? (
              <>
                <label onClick={() => setQuestionsClicked(false)}>Back</label>
                <label>Security Questions</label>
                <select
                  onChange={handleInputChange}
                  className="form-input h-[30px]"
                  name="question"
                >
                  <option value="" disabled selected hidden>
                    Select
                  </option>
                  {user.securityquestions?.map((element, index) => (
                    <option key={index} value={element.question}>
                      {element.question}
                    </option>
                  ))}
                </select>
                <input
                  type="password"
                  placeholder="Enter answer"
                  name="answer"
                  onChange={handleInputChange}
                  className="form-input h-[35px]"
                />
                <button type="button" onClick={handleQuestionVerify}>
                  Submit
                </button>
              </>
            ) : (
              /* Verification Method */
              <>
                <label>
                  How would you like to recover your password? Please choose a
                  method:
                </label>
                <button type="button" onClick={handleOTP}>
                  OTP
                </button>
                <button type="button" onClick={() => setQuestionsClicked(true)}>
                  Security Questions
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default ForgotPassword;
