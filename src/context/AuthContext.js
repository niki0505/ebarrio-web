import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigation = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userStatus, setUserStatus] = useState(null);

  useEffect(() => {
    if (userStatus && userStatus === "Deactivated") {
      autologout();
    }
  }, [userStatus]);

  useEffect(() => {
    axios
      .get("https://ebarrio-web-backend.onrender.com/api/checkrefreshtoken", {
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

  const autologout = async () => {
    try {
      await api.post(`/deactivateduser/${user.userID}`);
      alert("You have been deactivated");
      setIsAuthenticated(false);
      navigation("/login");
    } catch (error) {
      console.log("Error", error);
    }
  };

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
        setUserStatus,
        isAuthenticated,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
