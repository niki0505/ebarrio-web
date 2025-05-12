import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { OtpContext } from "../context/OtpContext";
import api from "../api";
import AppLogo from "../assets/applogo-darkbg.png";

const Login = () => {
  const { setUser, setIsAuthenticated } = useContext(AuthContext);
  const { sendOTP } = useContext(OtpContext);
  const navigation = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
        //     console.log(response.data);
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
        // } else if (res.data.message === "Token verified successfully!") {
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
        className={`w-[312px] h-[312px] absolute transition-all duration-[2000ms] ease-in-out
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
          <div className="mb-4">
            <h1 className="login-title">Welcome</h1>
            <label className="text-gray-400">
              Please enter your credentials to log in.
            </label>
          </div>

          <input
            type="text"
            placeholder="Enter username"
            onChange={(e) => setUsername(e.target.value)}
            className="form-input h-[35px]"
          />
          <input
            type="password"
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
            className="form-input h-[35px]"
          />
          <button
            onClick={handleLogin}
            type="submit"
            className="actions-btn bg-btn-color-blue"
          >
            Login
          </button>
          <a href="/forgot-password" className="text-[#0E94D3] ml-auto">
            Forgot password?
          </a>
        </div>
      )}
    </div>
  );
};

export default Login;
