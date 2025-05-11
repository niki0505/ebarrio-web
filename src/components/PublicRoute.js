import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PublicRoute = ({ element }) => {
  const { isAuthenticated } = useContext(AuthContext);

  if (isAuthenticated === null) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

export default PublicRoute;
