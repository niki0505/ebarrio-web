import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PublicRoute = ({ element }) => {
  const { isAuthenticated } = useContext(AuthContext);
  console.log("Is Authenticated (PublicRoute):", isAuthenticated);

  if (isAuthenticated === null) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/employees" replace />;
  }

  return element;
};

export default PublicRoute;
