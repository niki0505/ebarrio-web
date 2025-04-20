import { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import blueBg from "../assets/blue-bg.png";
import applogo from "../assets/applogo.png";

function Login() {
  const { setUser, setIsAuthenticated } = useContext(AuthContext);
  const navigation = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/login",
        {
          username,
          password,
        },
        { withCredentials: true }
      );
      if (!res.data.exists) {
        console.log(`❌ Account not found`);
        alert("Account not found. Please register.");
        setUsername("");
        setPassword("");
        return;
      }

      if (!res.data.correctPassword) {
        console.log(`❌ Incorrect Password`);
        alert("Incorrect Password. Please input the correct password.");
        setPassword("");
      } else {
        console.log(`✅ Correct Password`);
        // const decoded = jwtDecode(res.data.accessToken);
        // setUser(decoded);
        // setIsAuthenticated(true);
        alert("Login Successful.");
        navigation("/");
      }
    } catch (error) {
      console.log("Errors", error.message);
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
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
