import { useRef, useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import blueBg from "../assets/blue-bg.png";
import applogo from "../assets/applogo.png";
import api from "../api";
import AppLogo from "../assets/applogo-darkbg.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SetPassword() {
  const location = useLocation();
  const { username } = location.state;
  const navigation = useNavigate();
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");

  const [passwordErrors, setPasswordErrors] = useState([]);
  const [repasswordErrors, setRePasswordErrors] = useState([]);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    let hasErrors = false;
    let perrors = [];
    let rerrors = [];
    if (!password) {
      perrors.push("Password must not be empty.");
      setPasswordErrors(perrors);
      hasErrors = true;
    }

    if (!repassword) {
      rerrors.push("Password must not be empty.");
      setRePasswordErrors(rerrors);
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }
    try {
      await api.put(`/resetpassword/${username}`, {
        password,
      });
      alert("Your password has been successfully set.");
      navigation("/login");
    } catch (error) {
      console.log("Failed to reset password", error);
    }
  };

  const passwordValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setPassword(formattedVal);

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
    setRePassword(formattedVal);

    if (!formattedVal) {
      errors.push("Password must not be empty.");
    }
    if (formattedVal !== password && formattedVal.length > 0) {
      errors.push("Passwords do not match.");
    }
    setRePasswordErrors(errors);
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
          <div className="flex flex-col bg-white rounded-xl shadow-lg p-8 w-[25rem] h-[25rem] justify-center items-center gap-8 overflow-y-auto hide-scrollbar">
            <div>
              <h1 className="header-text text-start">Set Password</h1>
              <span className="text-[#808080] font-subTitle font-semibold text-[14px]">
                Enter password and confirm it to complete the reset process.
              </span>
            </div>
            <div className="flex flex-col gap-4 w-full">
              <input
                type="password"
                placeholder="Enter password"
                onChange={(e) => passwordValidation(e)}
                className="form-input"
              />
              {passwordErrors.length > 0 && (
                <div style={{ marginTop: 5, width: 300 }}>
                  {passwordErrors.map((error, index) => (
                    <p
                      key={index}
                      style={{
                        color: "red",
                        fontFamily: "QuicksandMedium",
                        fontSize: 16,
                      }}
                    >
                      {error}
                    </p>
                  ))}
                </div>
              )}
              <input
                type="password"
                placeholder="Enter confirm password"
                onChange={(e) => repasswordValidation(e)}
                className="form-input"
              />
              {repasswordErrors.length > 0 && (
                <div style={{ marginTop: 5, width: 300 }}>
                  {repasswordErrors.map((error, index) => (
                    <p
                      key={index}
                      style={{
                        color: "red",
                        fontFamily: "QuicksandMedium",
                        fontSize: 16,
                      }}
                    >
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="px-8 py-3 rounded-[8px] items-center text-[#fff] font-bold shadow-box-shadow font-title w-full truncate overflow-hidden whitespace-nowrap bg-btn-color-blue w-full text-[20px] hover:bg-[#0A7A9D]"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SetPassword;
