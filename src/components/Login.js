import { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

function Login() {
  const { setUser, setIsAuthenticated } = useContext(AuthContext);
  const navigation = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });
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
        console.log("Access Token", res.data.accessToken);
        localStorage.setItem("token", res.data.accessToken);
        const decoded = jwtDecode(res.data.accessToken);
        setUser(decoded);
        setIsAuthenticated(true);
        alert("Login Successful.");
        navigation("/");
      }
    } catch (error) {
      console.log("Errors", error.message);
    }
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Enter username"
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin} type="submit">
        Log in
      </button>
    </div>
  );
}

export default Login;
