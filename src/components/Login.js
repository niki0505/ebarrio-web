import { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import blueBg from "../assets/blue-bg.png";
import applogo from "../assets/applogo.png";
import api from "../api";
import { OtpContext } from "../context/OtpContext";

function Login() {
  const { setUser, setIsAuthenticated } = useContext(AuthContext);
  const { sendOTP } = useContext(OtpContext);
  const navigation = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
            <span className="login-title">Welcome</span>
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
            <a href="/forgot-password">Forgot password?</a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
