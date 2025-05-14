import { useRef, useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppLogo from "../assets/applogo-darkbg.png";
import api from "../api";
import OtpInput from "react-otp-input";
import { OtpContext } from "../context/OtpContext";
import { IoArrowBack } from "react-icons/io5";
import { RiQuestionnaireFill, RiLockPasswordFill } from "react-icons/ri";

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
    try {
      const response = await api.get(`/checkuser/${username}`);
      setIsExisting(true);
      setUser(response.data);
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

  const handleQuestionVerify = async () => {
    try {
      await api.post(`/verifyquestion/${username}`, { securityquestion });
      setIsVerified(true);
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

  const handleOTP = async () => {
    try {
      await api.get(`/checkotp/${username}`);
      if (resendCount === 3) {
        setIsResendDisabled(true);
        alert("You can only resend OTP 3 times.");
        setOTPClicked(false);
        await api.get(`/limitotp/${username}`);
        return;
      }
      setOTPClicked(true);
      setResendCount((prevCount) => prevCount + 1);
      setResendTimer(30);
      sendOTP(username, user.empID.resID.mobilenumber);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        alert("OTP use is currently disabled. Try again later.");
      } else {
        console.error("Error checking OTP:", error);
      }
    }
  };

  const handleSuccessful = async () => {
    try {
      await api.post(`/newpassword/${username}`, { newPassword });
      alert("You have successfully reset your password!");
      navigation("/login");
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
    try {
      const result = await verifyOTP(username, OTP);
      alert(result.message);
      setIsVerified(true);
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
          <div
            className="w-screen h-screen flex items-center justify-center overflow-hidden relative"
            style={{
              backgroundImage: `radial-gradient(circle, #0981B4 0%, #075D81 50%, #04384E 100%)`,
            }}
          >
            <img
              src={AppLogo}
              alt="App Logo"
              className="w-[312px] h-[312px] translate-x-[-20vw]"
            />
            <div className="absolute right-0 h-full bg-[#FFFBFC] shadow-lg p-12 w-full sm:w-[320px] md:w-[500px] flex flex-col justify-center gap-4">
              <div className="mb-4">
                <h1 className="header-text">Forgot Password</h1>
                <label className="text-[#ACACAC] font-subTitle font-semibold">
                  Please enter your username to begin the password <br /> reset
                  process.
                </label>
              </div>

              <input
                type="text"
                placeholder="Enter your username"
                onChange={(e) => setUsername(e.target.value)}
                className="form-input h-[35px]"
              />
              <button
                type="submit"
                onClick={handleSubmit}
                className="actions-btn bg-btn-color-blue font-title font-bold text-[20px]"
              >
                Submit
              </button>
              <a
                href="/login"
                className="text-[#0E94D3] ml-auto font-subTitle font-semibold text-[16px]"
              >
                Remember your password?
              </a>
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
                    <div className="flex flex-col bg-white rounded-xl shadow-lg p-5 w-[25rem] h-[25rem] justify-center items-center">
                      <div className="p-4">
                        <div>
                          <h1 className="header-text text-start">
                            Reset Password
                          </h1>
                          <span className="text-[#ACACAC] font-subTitle font-semibold text-[14px]">
                            Enter your new password and confirm it to complete
                            the reset process.
                          </span>
                        </div>

                        <div className="flex flex-col gap-4 mt-5 w-full">
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
                        </div>

                        <button
                          type="button"
                          onClick={handleSuccessful}
                          className="actions-btn bg-btn-color-blue w-full mt-5 font-title font-bold text-[20px]"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : /* One-Time Password */ isOTPClicked ? (
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
                        onClick={() => setOTPClicked(false)}
                      />
                      <div className="p-4">
                        <div>
                          <h1 className="header-text text-start">
                            One-Time Password
                          </h1>
                          <span className="text-[#ACACAC] font-subTitle font-semibold text-[14px]">
                            Enter the 6 digit code sent to{" "}
                            {user.empID.resID.mobilenumber}
                          </span>
                        </div>

                        <div className="w-full mt-10">
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
                                className="w-full h-[60px] mx-2 text-lg text-center border border-gray-300 rounded-[10px] focus:outline-none bg-[#EBEBEB] font-medium"
                                style={{ maxWidth: "100%" }}
                              />
                            )}
                          />
                        </div>
                        {isResendDisabled ? (
                          <p className="text-[#ACACAC] font-subTitle font-bold text-[14px] mt-5 text-end text-[14px]">
                            Resend OTP in {resendTimer} second
                            {resendTimer !== 1 ? "s" : ""}
                          </p>
                        ) : (
                          <p
                            onClick={handleResend}
                            className="cursor-pointer mt-5 text-end text-[#ACACAC] font-subTitle font-bold text-[14px]"
                          >
                            Resend OTP
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : /* Security Questions */ isQuestionsClicked ? (
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
                        onClick={() => setQuestionsClicked(false)}
                      />
                      <div className="p-4">
                        <div>
                          <h1 className="header-text text-start">
                            Security Questions
                          </h1>
                          <span className="text-[#ACACAC] font-subTitle font-semibold text-[14px]">
                            To verify your identity, please answer the security
                            question below.
                          </span>
                        </div>
                        <div className="mt-5 flex flex-col gap-y-4">
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
                        </div>

                        <button
                          type="button"
                          onClick={handleQuestionVerify}
                          className="actions-btn bg-btn-color-blue w-full mt-5 font-title font-bold text-[20px]"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Verification Method */
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
                        onClick={() => setIsExisting(false)}
                      />
                      <div className="p-4">
                        <div>
                          <h1 className="header-text text-start">
                            Verification Method
                          </h1>
                          <label className="text-[#ACACAC] font-subTitle font-semibold text-[14px]">
                            Please choose a method to verify your identity and
                            continue resetting your password
                          </label>
                        </div>

                        <div className="flex flex-col mt-10 gap-y-4">
                          <button
                            type="button"
                            onClick={handleOTP}
                            className="bg-[rgba(172,172,172,0.17)] p-4 rounded-md text-start flex flex-row items-center gap-x-4 border border-[#C1C0C0]"
                          >
                            <RiLockPasswordFill className="text-3xl text-navy-blue" />
                            <label className="text-navy-blue font-subTitle font-semibold">
                              One-Time Password (OTP)
                            </label>
                          </button>

                          <button
                            type="button"
                            onClick={() => setQuestionsClicked(true)}
                            className="bg-[rgba(172,172,172,0.17)] p-4 rounded-md text-start flex flex-row items-center gap-x-4 border border-[#C1C0C0]"
                          >
                            <RiQuestionnaireFill className="text-3xl text-navy-blue" />
                            <label className="text-navy-blue font-subTitle font-semibold">
                              Security Questions
                            </label>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default ForgotPassword;
