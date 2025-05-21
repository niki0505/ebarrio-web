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
    const checkRefreshToken = async () => {
      try {
        const response = await api.get("/checkrefreshtoken", {
          withCredentials: true,
        });
        console.log("You have a token");
        setUser(response.data.decoded);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Axios error:", error.message);
        setIsAuthenticated(false);
      }
    };
    checkRefreshToken();
  }, []);

  // useEffect(() => {
  //   api
  //     .get("/checkrefreshtoken")
  //     .then((res) => {
  //       setUser(res.data.decoded);
  //       setIsAuthenticated(true);
  //     })
  //     .catch(() => setIsAuthenticated(false));
  // }, []);

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
      const res = await api.post(
        "/logout",
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
