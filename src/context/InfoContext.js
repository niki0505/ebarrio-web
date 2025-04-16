import { createContext, useState, useEffect } from "react";
import axios from "axios";
import api from "../api";

export const InfoContext = createContext(undefined);

export const InfoProvider = ({ children }) => {
  const fetchResidents = async () => {
    const response = await api.get("/getresidents");
    return response.data;
  };

  const fetchEmployees = async () => {
    const response = await api.get("/getemployees");
    return response.data;
  };

  const fetchUsers = async () => {
    const response = await api.get("/getusers");
    return response.data;
  };

  return (
    <InfoContext.Provider
      value={{
        fetchResidents,
        fetchEmployees,
        fetchUsers,
      }}
    >
      {children}
    </InfoContext.Provider>
  );
};
