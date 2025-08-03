import { createContext, useState, useEffect, useContext } from "react";
import api from "../api";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
// Create a context for socket connection
export const SocketContext = createContext();

export const InfoContext = createContext(undefined);

const socket = io("http://localhost:5000/website", {
  withCredentials: true,
});

export const InfoProvider = ({ children }) => {
  const { isAuthenticated, setUserStatus, user } = useContext(AuthContext);
  const [residents, setResidents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [emergencyhotlines, setEmergencyHotlines] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [courtreservations, setCourtReservations] = useState([]);
  const [blotterreports, setBlotterReports] = useState([]);
  const [activitylogs, setActivityLogs] = useState([]);
  const [household, setHousehold] = useState([]);
  const [FAQslist, setFAQslist] = useState([]);
  const [chats, setChats] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [assignedAdmin, setAssignedAdmin] = useState(null);
  const [pendingReservationCount, setPendingReservationCount] = useState(null);

  const announcementInitialForm = {
    category: "",
    title: "",
    content: "",
    picture: "",
    date: [],
    times: {},
    eventdetails: "",
  };

  const residentInitialForm = {
    id: "",
    signature: "",
    firstname: "",
    middlename: "",
    lastname: "",
    suffix: "",
    alias: "",
    salutation: "",
    sex: "",
    gender: "",
    birthdate: "",
    birthplace: "",
    civilstatus: "",
    bloodtype: "",
    religion: "",
    nationality: "",
    voter: "",
    precinct: "",
    deceased: "",
    email: "",
    mobilenumber: "+63",
    telephone: "+63",
    facebook: "",
    emergencyname: "",
    emergencymobilenumber: "+63",
    emergencyaddress: "",
    housenumber: "",
    street: "",
    HOAname: "",
    address: "",
    mother: "",
    father: "",
    spouse: "",
    siblings: [],
    children: [],
    numberofsiblings: "",
    numberofchildren: "",
    employmentstatus: "",
    employmentfield: "",
    occupation: "",
    monthlyincome: "",
    educationalattainment: "",
    typeofschool: "",
    course: "",
  };
  const blotterInitialForm = {
    complainantID: "",
    complainantname: "",
    complainantaddress: "",
    complainantcontactno: "+63",
    complainantsignature: "",
    subjectID: "",
    subjectname: "",
    subjectaddress: "",
    typeofthecomplaint: "",
    details: "",
    date: "",
    starttime: "",
    endtime: "",
  };

  const [residentForm, setResidentForm] = useState(() => {
    const savedForm = localStorage.getItem("residentForm");
    return savedForm ? JSON.parse(savedForm) : residentInitialForm;
  });

  const [blotterForm, setBlotterForm] = useState(() => {
    const savedForm = localStorage.getItem("blotterForm");
    return savedForm ? JSON.parse(savedForm) : blotterInitialForm;
  });

  const [announcementForm, setAnnouncementForm] = useState(() => {
    const savedForm = localStorage.getItem("announcementForm");
    return savedForm ? JSON.parse(savedForm) : announcementInitialForm;
  });

  useEffect(() => {
    localStorage.setItem("residentForm", JSON.stringify(residentForm));
  }, [residentForm]);

  useEffect(() => {
    localStorage.setItem("blotterForm", JSON.stringify(blotterForm));
  }, [blotterForm]);

  useEffect(() => {
    localStorage.setItem("announcementForm", JSON.stringify(announcementForm));
  }, [announcementForm]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (users && user) {
      users.map((usr) => {
        if (usr._id === user.userID) {
          setUserStatus(usr.status);
        }
      });
    }
  }, [users, user]);

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

  const fetchActivityLogs = async () => {
    try {
      const response = await api.get("/getactivitylogs");
      setActivityLogs(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch activity logs:", error);
    }
  };

  const fetchHouseholds = async () => {
    try {
      const response = await api.get("/gethouseholds");
      setHousehold(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
    }
  };

  const fetchFAQslist = async () => {
    try {
      const response = await api.get("/getfaqs");
      setFAQslist(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch FAQs:", error);
    }
  };
  const fetchChats = async () => {
    try {
      const response = await api.get("/getchats");
      setChats(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch FAQs:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const fetchPendingReservations = async () => {
        try {
          const response = await api.get("/getpendingreservations");
          setPendingReservationCount(response.data);
        } catch (error) {
          console.error("❌ Failed to fetch users:", error);
        }
      };
      fetchPendingReservations();
    }
  }, [isAuthenticated]);

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
      } else if (updatedData.type === "activitylogs") {
        setActivityLogs(updatedData.data);
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
          residentForm,
          blotterForm,
          announcementForm,
          household,
          FAQslist,
          pendingReservationCount,
          chats,
          roomId,
          setRoomId,
          assignedAdmin,
          setAssignedAdmin,
          setChats,
          setAnnouncementForm,
          fetchActivityLogs,
          activitylogs,
          setBlotterForm,
          setResidentForm,
          fetchHouseholds,
          fetchResidents,
          fetchEmployees,
          fetchUsers,
          fetchCertificates,
          fetchEmergencyHotlines,
          fetchAnnouncements,
          fetchReservations,
          fetchBlotterReports,
          fetchFAQslist,
          fetchChats,
        }}
      >
        {children}
      </InfoContext.Provider>
    </SocketContext.Provider>
  );
};
