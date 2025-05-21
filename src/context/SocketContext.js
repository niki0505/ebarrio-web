import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user?.userID) return;

    const newSocket = io("http://localhost:5000", {
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      newSocket.emit("register", user.userID);
      if (user?.role === "Secretary" || user?.role === "Clerk") {
        newSocket.emit("join_announcements");
      }
    });

    newSocket.on("announcement", (announcement) => {
      toast.info(announcement.message || "You have a new announcement!");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.userID, user?.role]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
