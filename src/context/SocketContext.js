import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { InfoContext } from "./InfoContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const navigation = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/getnotifications");
      setNotifications(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch notifications:", error);
    }
  };

  const truncateNotifMessage = (message, wordLimit = 25) => {
    const words = message.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : message;
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.userID) return;

    const newSocket = io("https://api.ebarrio.online", {
      transports: ["websocket"],
      upgrade: false,
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      newSocket.emit("register", user.userID, user.role);
      if (user?.role === "Secretary") {
        newSocket.emit("join_announcements");
        newSocket.emit("join_certificates");
        newSocket.emit("join_courtreservations");
        newSocket.emit("join_blotterreports");
      } else if (user?.role === "Clerk") {
        newSocket.emit("join_announcements");
        newSocket.emit("join_certificates");
        newSocket.emit("join_courtreservations");
      } else if (user?.role === "Justice") {
        newSocket.emit("join_blotterreports");
      }
    });

    newSocket.on("announcement", (announcement) => {
      toast.info(
        <>
          <div
            onClick={() => navigation("/announcements")}
            style={{ cursor: "pointer" }}
          >
            <strong>{announcement.title}</strong>
            <div>{truncateNotifMessage(announcement.message)}</div>
          </div>
        </>
      );
    });

    newSocket.on("notificationUpdate", (updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    newSocket.on("certificates", (certificate) => {
      toast.info(
        <>
          <div
            onClick={() =>
              navigation("/document-requests", {
                state:
                  certificate.cancelled !== undefined
                    ? { cancelled: certificate.cancelled }
                    : undefined,
              })
            }
            style={{ cursor: "pointer" }}
          >
            <strong>{certificate.title}</strong>
            <div>{certificate.message}</div>
          </div>
        </>
      );
    });

    newSocket.on("blotterreports", (blotter) => {
      toast.info(
        <>
          <div
            onClick={() => navigation("/blotter-reports")}
            style={{ cursor: "pointer" }}
          >
            <strong>📄 {blotter.title}</strong>
            <div>{blotter.message}</div>
          </div>
        </>
      );
    });

    newSocket.on("courtreservations", (court) => {
      toast.info(
        <>
          <div
            onClick={() =>
              navigation("/court-reservations", {
                state:
                  court.cancelled !== undefined
                    ? { cancelled: court.cancelled }
                    : undefined,
              })
            }
            style={{ cursor: "pointer" }}
          >
            <strong>{court.title}</strong>
            <div>{court.message}</div>
          </div>
        </>
      );
    });

    setSocket(newSocket);
  }, [user?.userID, user?.role]);

  useEffect(() => {
    if (!isAuthenticated && socket && user?.userID) {
      socket.emit("unregister", user.userID);
      socket.disconnect();
      setSocket(null);
    }
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider
      value={{ socket, fetchNotifications, notifications }}
    >
      {children}
    </SocketContext.Provider>
  );
};
