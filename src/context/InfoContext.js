import { createContext, useState, useEffect } from "react";
import axios from "axios";
import api from "../api";
import { io } from "socket.io-client";

// Create a context for socket connection
export const SocketContext = createContext();

export const InfoContext = createContext(undefined);

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

export const InfoProvider = ({ children }) => {
  const [residents, setResidents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [emergencyhotlines, setEmergencyHotlines] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [courtreservations, setCourtReservations] = useState([]);
  const [blotterreports, setBlotterReports] = useState([]);

  const fetchResidents = async () => {
    try {
      const response = await api.get("/getresidents");
      setResidents(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch residents:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/getemployees");
      setEmployees(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch employees:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/getusers");
      setUsers(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await api.get("/getcertificates");
      console.log(response.data);
      setCertificates(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch certificates:", error);
    }
  };

  const fetchEmergencyHotlines = async () => {
    try {
      const response = await api.get("/getemergencyhotlines");
      setEmergencyHotlines(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch emergency hotlines:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get("/getannouncements");
      setAnnouncements(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch announcements:", error);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await api.get("/getreservations");
      setCourtReservations(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch reservations:", error);
    }
  };

  const fetchBlotterReports = async () => {
    try {
      const response = await api.get("/getblotters");
      setBlotterReports(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch blotter reports:", error);
    }
  };

  useEffect(() => {
    socket.on("dbChange", (updatedData) => {
      if (updatedData.type === "residents") {
        setResidents(updatedData.data);
      } else if (updatedData.type === "employees") {
        setEmployees(updatedData.data);
      } else if (updatedData.type === "users") {
        setUsers(updatedData.data);
      } else if (updatedData.type === "certificates") {
        console.log(updatedData.data);
        setCertificates(updatedData.data);
      } else if (updatedData.type === "emergencyhotlines") {
        setEmergencyHotlines(updatedData.data);
      } else if (updatedData.type === "announcements") {
        setAnnouncements(updatedData.data);
      } else if (updatedData.type === "courtreservations") {
        setCourtReservations(updatedData.data);
      } else if (updatedData.type === "blotterreports") {
        setBlotterReports(updatedData.data);
      }
    });

    return () => {
      socket.off("dbChange");
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      <InfoContext.Provider
        value={{
          residents,
          employees,
          users,
          certificates,
          emergencyhotlines,
          announcements,
          courtreservations,
          blotterreports,
          fetchResidents,
          fetchEmployees,
          fetchUsers,
          fetchCertificates,
          fetchEmergencyHotlines,
          fetchAnnouncements,
          fetchReservations,
          fetchBlotterReports,
        }}
      >
        {children}
      </InfoContext.Provider>
    </SocketContext.Provider>
  );
};
