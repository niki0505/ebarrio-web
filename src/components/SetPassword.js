import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

//ICONS
import AppLogo from "../assets/applogo-darkbg.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SetPassword() {
  const confirm = useConfirm();
  const location = useLocation();
  const { username } = location.state;
  const navigation = useNavigate();
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");

  const [passwordErrors, setPasswordErrors] = useState([]);
  const [repasswordErrors, setRePasswordErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleSubmit = async () => {
    let hasErrors = false;
    if (passwordErrors.length !== 0) {
      hasErrors = true;
    }

    if (repasswordErrors.length !== 0) {
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    const isConfirmed = await confirm(
      "Are you sure you want to set your password?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/resetpassword/${username}`, {
        password,
      });
      confirm(
        "Your password has been successfully created. You may now sign in with your new password.",
        "success"
      );
      navigation("/login");
    } catch (error) {
      console.log("Failed to reset password", error);
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let errors2 = [];
    let formattedVal = val.replace(/\s+/g, "");
    setPassword(formattedVal);

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
    if (repassword && formattedVal !== repassword) {
      errors2.push("Passwords do not match!");
    }
    setPasswordErrors(errors);
    setRePasswordErrors(errors2);
  };

  const repasswordValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setRePassword(formattedVal);

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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="flex flex-col bg-white rounded-xl shadow-lg p-8 w-[25rem] h-[25rem] justify-center items-center gap-8 overflow-y-auto hide-scrollbar">
              <div>
                <h1 className="header-text text-start">Set Password</h1>
                <span className="text-[#808080] font-subTitle font-semibold text-[14px]">
                  Enter password and confirm it to complete the reset process.
                </span>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => passwordValidation(e)}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="eye-toggle"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
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
                <div className="relative w-full">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="Enter confirm password"
                    value={repassword}
                    onChange={(e) => repasswordValidation(e)}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass((prev) => !prev)}
                    className="eye-toggle"
                    tabIndex={-1}
                  >
                    {showConfirmPass ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>

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
                disabled={loading}
                className="px-8 py-3 rounded-[8px] items-center text-[#fff] font-bold shadow-box-shadow font-title bg-btn-color-blue w-full text-[20px] hover:bg-[#0A7A9D]"
              >
                {loading ? "Setting..." : "Set"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default SetPassword;
