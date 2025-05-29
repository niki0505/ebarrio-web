import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { OtpContext } from "../context/OtpContext";
import api from "../api";
import AppLogo from "../assets/applogo-darkbg.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const { setUser, setIsAuthenticated } = useContext(AuthContext);
  const { sendOTP } = useContext(OtpContext);
  const navigation = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const location = useLocation();

  //Animation
  const [animateScale, setAnimateScale] = useState(false);
  const [animateMove, setAnimateMove] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [animateLoginPanel, setAnimateLoginPanel] = useState(false);

  useEffect(() => {
    setAnimateScale(false);
    setAnimateMove(false);
    setShowLoginPanel(false);
    setAnimateLoginPanel(false);

    const startScale = setTimeout(() => setAnimateScale(true), 50);
    const startMove = setTimeout(() => setAnimateMove(true), 2200);
    const showPanel = setTimeout(() => setShowLoginPanel(true), 3000);
    const animatePanel = setTimeout(() => setAnimateLoginPanel(true), 3200);

    return () => {
      clearTimeout(startScale);
      clearTimeout(startMove);
      clearTimeout(showPanel);
      clearTimeout(animatePanel);
    };
  }, [location.pathname]);

  const handleLogin = async () => {
    try {
      const res = await api.post(
        "/checkcredentials",
        {
          username,
          password,
        },
        { withCredentials: true }
      );

      console.log(res.status);
      if (res.status === 200) {
        try {
          await api.put(`/login/${username}`);
          setIsAuthenticated(true);
        } catch (error) {
          console.log("Error logging in", error);
        }
        // if (res.data.message === "Credentials verified") {
        //   try {
        //     const response = await api.get(`/getmobilenumber/${username}`);
        //     sendOTP(username, response.data.empID?.resID.mobilenumber);
        //     navigation("/otp", {
        //       state: {
        //         username: username,
        //         mobilenumber: response.data.empID?.resID.mobilenumber,
        //       },
        //     });
        //   } catch (error) {
        //     console.log("Error getting mobile number", error);
        //   }
        // } else if (res.data.message === "Token verified successfully.") {
        //   navigation("/set-password", {
        //     state: {
        //       username: username,
        //     },
        //   });
        // }
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

  return (
    <div
      className="w-screen h-screen flex items-center justify-center overflow-hidden relative"
      style={{
        backgroundImage: `radial-gradient(circle, #0981B4 0%, #075D81 50%, #04384E 100%)`,
      }}
    >
      {/* Logo */}
      <img
        src={AppLogo}
        alt="App Logo"
        className={`w-[350px] h-[350px] absolute transition-all duration-[2000ms] ease-in-out
          ${animateScale ? "scale-100 opacity-100" : "scale-50 opacity-0"}
          ${animateMove ? "translate-x-[-20vw]" : "translate-x-0"}
        `}
      />

      {/* Login panel */}
      {showLoginPanel && (
        <div
          className={`absolute right-0 h-full bg-[#FFFBFC] shadow-lg p-12 w-full sm:w-[320px] md:w-[500px] flex flex-col justify-center gap-4 
            transition-all duration-1000 ease-in-out
            ${
              animateLoginPanel
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            }
          `}
        >
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="header-text">Welcome!</h1>
              <label className="text-[#808080] font-subTitle font-semibold">
                Please enter your credentials to log in.
              </label>
            </div>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter username"
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
              />
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleLogin}
                type="submit"
                className="px-8 py-3 rounded-[8px] items-center text-[#fff] font-bold shadow-box-shadow font-title w-full truncate overflow-hidden whitespace-nowrap bg-btn-color-blue text-[20px] hover:bg-[#0A7A9D]"
              >
                Login
              </button>
              <a
                href="/forgot-password"
                className="text-[#0E94D3] ml-auto font-subTitle font-semibold text-[16px]"
              >
                Forgot password?
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
