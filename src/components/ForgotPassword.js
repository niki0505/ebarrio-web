import { useRef, useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import OtpInput from "react-otp-input";
import { OtpContext } from "../context/OtpContext";

//ICONS
import { IoArrowBack } from "react-icons/io5";
import { RiQuestionnaireFill, RiLockPasswordFill } from "react-icons/ri";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import AppLogo from "../assets/applogo-darkbg.png";

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
  const [showSecurityPassword, setShowSecurityPassword] = useState(false);
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [repasswordErrors, setRePasswordErrors] = useState([]);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleUsernameChange = (e) => {
    const input = e.target.value;
    const filtered = input.replace(/[^a-z0-9_]/g, "");
    setUsername(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = name === "answer" ? value.toLowerCase() : value;
    setSecurityQuestion((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };

  const handleQuestionsClicked = () => {
    if (
      Array.isArray(user.securityquestions) &&
      user.securityquestions.length === 0
    ) {
      alert("It looks like you haven't set up your security questions yet.");
      return;
    }
    setQuestionsClicked(true);
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
        alert("OTP use is currently disabled. Try again in after 30 minutes.");
      } else {
        console.error("Error checking OTP:", error);
      }
    }
  };

  const handleSuccessful = async () => {
    let hasErrors = false;
    let nerrors = [];
    let rnerrors = [];
    if (!newPassword) {
      nerrors.push("Password must not be empty.");
      setPasswordErrors(nerrors);
      hasErrors = true;
    }

    if (!renewPassword) {
      rnerrors.push("Password must not be empty.");
      setRePasswordErrors(rnerrors);
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

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

  const passwordValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setNewPassword(formattedVal);

    if (!formattedVal) {
      errors.push("Password must not be empty.");
    }
    if (
      (formattedVal && formattedVal.length < 8) ||
      (formattedVal && formattedVal.length > 64)
    ) {
      errors.push("Password must be between 8 and 64 characters only.");
    }
    if (formattedVal && !/^[a-zA-Z0-9!@\$%\^&*\+#]+$/.test(formattedVal)) {
      errors.push(
        "Password can only contain letters, numbers, and !, @, $, %, ^, &, *, +, #"
      );
    }
    setPasswordErrors(errors);
  };

  const repasswordValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setReNewPassword(formattedVal);

    if (!formattedVal) {
      errors.push("Password must not be empty.");
    }
    if (formattedVal !== newPassword && formattedVal.length > 0) {
      errors.push("Passwords do not match.");
    }
    setRePasswordErrors(errors);
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
            className="login-container"
            style={{
              backgroundImage: `radial-gradient(circle, #0981B4 0%, #075D81 50%, #04384E 100%)`,
            }}
          >
            <img
              src={AppLogo}
              alt="App Logo"
              className="login-logo translate-x-[-25vw]"
            />
            <div className="right-login-container">
              <div>
                <h1 className="header-text">Forgot Password</h1>
                <label className="text-[#808080] font-subTitle font-semibold">
                  Please enter your username to begin the password <br /> reset
                  process.
                </label>
              </div>

              <form
                className="flex flex-col gap-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => handleUsernameChange(e)}
                    className="form-input"
                    minLength={3}
                    maxLength={16}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <button type="submit" className="login-btn">
                    Submit
                  </button>
                  <a href="/login" className="login-forgot-btn">
                    Remember your password?
                  </a>
                </div>
              </form>
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
                    <div className="flex flex-col bg-white rounded-xl shadow-lg p-3 w-[25rem] h-[25rem] justify-center items-center">
                      <div className="p-4 flex flex-col gap-8 overflow-y-auto hide-scrollbar">
                        <div>
                          <h1 className="header-text text-start">
                            Reset Password
                          </h1>
                          <span className="text-[#808080] font-subTitle font-semibold text-[14px]">
                            Enter your new password and confirm it to complete
                            the reset process.
                          </span>
                        </div>

                        <div className="flex flex-col gap-4 w-full">
                          <div>
                            <div className="relative w-full">
                              <input
                                type={
                                  showResetNewPassword ? "text" : "password"
                                }
                                placeholder="New Password"
                                onChange={(e) => passwordValidation(e)}
                                className="form-input w-full"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowResetNewPassword((prev) => !prev)
                                }
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                tabIndex={-1}
                              >
                                {showResetNewPassword ? (
                                  <FaEye />
                                ) : (
                                  <FaEyeSlash />
                                )}
                              </button>
                            </div>
                            {passwordErrors.length > 0 && (
                              <div style={{ width: 300 }}>
                                {passwordErrors.map((error, index) => (
                                  <p
                                    key={index}
                                    className="text-red-500 font-semibold font-subTitle text-[14px]"
                                  >
                                    {error}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="relative w-full">
                              <input
                                type={
                                  showConfirmNewPassword ? "text" : "password"
                                }
                                placeholder="Confirm new password"
                                onChange={(e) => repasswordValidation(e)}
                                className="form-input w-full"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmNewPassword((prev) => !prev)
                                }
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                                tabIndex={-1}
                              >
                                {showConfirmNewPassword ? (
                                  <FaEye />
                                ) : (
                                  <FaEyeSlash />
                                )}
                              </button>
                            </div>
                            {repasswordErrors.length > 0 && (
                              <div style={{ marginTop: 5, width: 300 }}>
                                {repasswordErrors.map((error, index) => (
                                  <p
                                    key={index}
                                    className="text-red-500 font-semibold font-subTitle text-[14px]"
                                  >
                                    {error}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleSuccessful}
                          className="px-8 py-3 rounded-[8px] items-center text-[#fff] font-bold shadow-box-shadow font-title w-full truncate overflow-hidden whitespace-nowrap bg-btn-color-blue w-full text-[20px] hover:bg-[#0A7A9D]"
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
                    <div className="flex flex-col bg-white rounded-xl shadow-lg p-3 w-[25rem] h-[25rem] ">
                      <IoArrowBack
                        className="text-2xl"
                        onClick={() => setOTPClicked(false)}
                      />
                      <div className="p-4">
                        <div>
                          <h1 className="header-text text-start">
                            One-Time Password
                          </h1>
                          <div className="flex flex-col mt-4">
                            <span className="text-[#808080] font-subTitle font-semibold text-[14px]">
                              Enter the 6 digit code sent to:
                            </span>
                            <span className="text-navy-blue font-semibold">
                              {user.empID.resID.mobilenumber}
                            </span>
                          </div>
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
                          <p className="text-[#808080] font-subTitle font-bold text-[14px] mt-5 text-end text-[14px]">
                            Resend OTP in {resendTimer} second
                            {resendTimer !== 1 ? "s" : ""}
                          </p>
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
                    <div className="flex flex-col bg-white rounded-xl shadow-lg p-3 w-[25rem] h-[25rem] ">
                      <IoArrowBack
                        className="text-2xl"
                        onClick={() => setQuestionsClicked(false)}
                      />
                      <div className="p-4 flex flex-col gap-8 overflow-y-auto hide-scrollbar">
                        <div>
                          <h1 className="header-text text-start">
                            Security Questions
                          </h1>
                          <span className="text-[#808080] font-subTitle font-semibold text-[14px]">
                            To verify your identity, please answer the security
                            question below.
                          </span>
                        </div>
                        <div className="flex flex-col gap-4">
                          <select
                            onChange={handleInputChange}
                            className="form-input"
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

                          <div className="relative w-full">
                            <input
                              type={showSecurityPassword ? "text" : "password"}
                              placeholder="Answer"
                              name="answer"
                              onChange={handleInputChange}
                              className="form-input w-full"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowSecurityPassword((prev) => !prev)
                              }
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                              tabIndex={-1}
                            >
                              {showSecurityPassword ? (
                                <FaEye />
                              ) : (
                                <FaEyeSlash />
                              )}
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleQuestionVerify}
                          className="px-8 py-3 rounded-[8px] items-center text-[#fff] font-bold shadow-box-shadow font-title w-full truncate overflow-hidden whitespace-nowrap bg-btn-color-blue w-full text-[20px] hover:bg-[#0A7A9D]"
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
                    <div className="flex flex-col bg-white rounded-xl shadow-lg p-3 w-[25rem] h-[25rem]">
                      <IoArrowBack
                        className="text-2xl"
                        onClick={() => setIsExisting(false)}
                      />
                      <div className="p-4 flex flex-col gap-8 overflow-y-auto hide-scrollbar">
                        <div>
                          <h1 className="header-text text-start">
                            Verification Method
                          </h1>
                          <label className="text-[#808080] font-subTitle font-semibold text-[14px]">
                            Please choose a method to verify your identity and
                            continue resetting your password
                          </label>
                        </div>

                        <div className="flex flex-col gap-4">
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
                            onClick={handleQuestionsClicked}
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
