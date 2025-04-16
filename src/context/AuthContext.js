import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigation = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const checkTokenValidity = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        alert("Token expired. Logging out.");
        logout();
      } else {
        setUser(decodedToken);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      logout();
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/checkrefreshtoken", {
        withCredentials: true,
      })
      .then((response) => {
        console.log("You have a token");
        setUser(response.data.decoded);
        setIsAuthenticated(true);
      })
      .catch(() => {
        console.log("You don't have a token");
        setIsAuthenticated(false);
      });
  }, [navigation]);

  const logout = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/logout",
        {
          userID: user.userID,
        },
        { withCredentials: true }
      );
      setIsAuthenticated(false);
      navigation("/login");
    } catch (error) {
      console.log("Error", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        checkTokenValidity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
