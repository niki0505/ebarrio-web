import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
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

  const socketRef = useRef(null);

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
    if (!isAuthenticated || !user?.userID || socketRef.current) return;

    const newSocket = io("https://api.ebarrio.online", {
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🔌 Connected:", newSocket.id);
      newSocket.emit("register", user.userID, user.role);

      if (user.role === "Secretary") {
        newSocket.emit("join_announcements");
        newSocket.emit("join_certificates");
        newSocket.emit("join_courtreservations");
        newSocket.emit("join_blotterreports");
      } else if (user.role === "Clerk") {
        newSocket.emit("join_announcements");
        newSocket.emit("join_certificates");
        newSocket.emit("join_courtreservations");
      } else if (user.role === "Justice") {
        newSocket.emit("join_blotterreports");
      }
    });

    newSocket.io.on("reconnect", (attempt) => {
      console.log("🔁 Reconnected on attempt", attempt);
      newSocket.emit("register", user.userID, user.role);
    });

    // NOTIFICATION EVENTS
    newSocket.on("announcement", (announcement) => {
      toast.info(
        <div
          onClick={() => navigation("/announcements")}
          style={{ cursor: "pointer" }}
        >
          <strong>{announcement.title}</strong>
          <div>{truncateNotifMessage(announcement.message)}</div>
        </div>
      );
    });

    newSocket.on("notificationUpdate", (updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    newSocket.on("certificates", (certificate) => {
      toast.info(
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
      );
    });

    newSocket.on("blotterreports", (blotter) => {
      toast.info(
        <div
          onClick={() => navigation("/blotter-reports")}
          style={{ cursor: "pointer" }}
        >
          <strong>📄 {blotter.title}</strong>
          <div>{blotter.message}</div>
        </div>
      );
    });

    newSocket.on("courtreservations", (court) => {
      toast.info(
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
      );
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [isAuthenticated, user?.userID, user?.role]);

  // Logout or auth expiration cleanup
  useEffect(() => {
    if (!isAuthenticated && socketRef.current && user?.userID) {
      socketRef.current.emit("unregister", user.userID);
      socketRef.current.disconnect();
      socketRef.current = null;
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
