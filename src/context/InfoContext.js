import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const InfoContext = createContext(undefined);

export const InfoProvider = ({ children }) => {
  const [residents, setResidents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/getresidents"
        );
        console.log(response.data);
        setResidents(response.data);
      } catch (error) {
        console.log("Error fetching residents", error);
      }
    };
    fetchResidents();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/getemployees"
        );
        console.log(response.data);
        setEmployees(response.data);
      } catch (error) {
        console.log("Error fetching employees", error);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/getusers");
        console.log(response.data);
        setUsers(response.data);
      } catch (error) {
        console.log("Error fetching users", error);
      }
    };
    fetchUsers();
  }, []);
  return (
    <InfoContext.Provider
      value={{
        residents,
        setResidents,
        employees,
        setEmployees,
        users,
        setUsers,
      }}
    >
      {children}
    </InfoContext.Provider>
  );
};
