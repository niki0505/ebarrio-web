import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useContext(AuthContext);
  console.log("Is Authenticated", isAuthenticated);

  if (isAuthenticated === null) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default PrivateRoute;
