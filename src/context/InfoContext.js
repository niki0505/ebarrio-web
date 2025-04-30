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

  const fetchResidents = async () => {
    const response = await api.get("/getresidents");
    setResidents(response.data);
  };

  const fetchEmployees = async () => {
    const response = await api.get("/getemployees");
    setEmployees(response.data);
  };

  const fetchUsers = async () => {
    const response = await api.get("/getusers");
    setUsers(response.data);
  };

  const fetchCertificates = async () => {
    const response = await api.get("/getcertificates");
    setCertificates(response.data);
  };

  const fetchEmergencyHotlines = async () => {
    const response = await api.get("/getemergencyhotlines");
    setEmergencyHotlines(response.data);
  };

  const fetchAnnouncements = async () => {
    const response = await api.get("/getannouncements");
    setAnnouncements(response.data);
  };

  useEffect(() => {
    socket.on("dataUpdated", (updatedData) => {
      if (updatedData.type === "residents") {
        setResidents(updatedData.data);
      } else if (updatedData.type === "employees") {
        setEmployees(updatedData.data);
      } else if (updatedData.type === "users") {
        setUsers(updatedData.data);
      } else if (updatedData.type === "certificates") {
        setCertificates(updatedData.data);
      } else if (updatedData.type === "emergencyhotlines") {
        setEmergencyHotlines(updatedData.data);
      } else if (updatedData.type === "announcements") {
        setAnnouncements(updatedData.data);
      }
    });

    return () => {
      socket.disconnect();
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
          fetchResidents,
          fetchEmployees,
          fetchUsers,
          fetchCertificates,
          fetchEmergencyHotlines,
          fetchAnnouncements,
        }}
      >
        {children}
      </InfoContext.Provider>
    </SocketContext.Provider>
  );
};

// import { createContext, useState, useEffect } from "react";
// import axios from "axios";
// import api from "../api";

// export const InfoContext = createContext(undefined);

// export const InfoProvider = ({ children }) => {
//   const fetchResidents = async () => {
//     const response = await api.get("/getresidents");
//     return response.data;
//   };

//   const fetchEmployees = async () => {
//     const response = await api.get("/getemployees");
//     return response.data;
//   };

//   const fetchUsers = async () => {
//     const response = await api.get("/getusers");
//     return response.data;
//   };

//   const fetchCertificates = async () => {
//     const response = await api.get("/getcertificates");
//     return response.data;
//   };

//   return (
//     <InfoContext.Provider
//       value={{
//         fetchResidents,
//         fetchCertificates,
//         fetchEmployees,
//         fetchUsers,
//       }}
//     >
//       {children}
//     </InfoContext.Provider>
//   );
// };
