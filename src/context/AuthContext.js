import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigation = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userStatus, setUserStatus] = useState(null);

  useEffect(() => {
    if (userStatus && userStatus === "Deactivated") {
      autologout();
    } else if (userStatus && userStatus === "Archived") {
      autologout2();
    } else if (userStatus && userStatus === "Password Not Set") {
      autologout3();
    }
  }, [userStatus]);

  useEffect(() => {
    axios
      .get("https://api.ebarrio.online/api/checkrefreshtoken", {
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
      alert(
        "You've been logged out because your account has been deactivated. If this is unexpected, please contact the admin."
      );
      setIsAuthenticated(false);
      navigation("/login");
    } catch (error) {
      console.log("Error", error);
    }
  };

  const autologout2 = async () => {
    try {
      await api.post(`/archiveduser/${user.userID}`);
      alert(
        "You've been logged out because your account has been archived. If this is unexpected, please contact the admin."
      );
      setIsAuthenticated(false);
      navigation("/login");
    } catch (error) {
      console.log("Error", error);
    }
  };

  const autologout3 = async () => {
    try {
      await api.post(`/updateduser`);
      alert(
        "You've been logged out because your account credentials has been updated. If this is unexpected, please contact the admin."
      );
      setIsAuthenticated(false);
      navigation("/login");
    } catch (error) {
      console.log("Error", error);
    }
  };

  const logout = async () => {
    try {
      const res = await axios.post(
        "https://api.ebarrio.online/api/logout",
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
