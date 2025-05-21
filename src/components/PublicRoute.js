import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

const PublicRoute = ({ element }) => {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
    // if (user?.role === "Justice") {
    //   return <Navigate to="/blotter-reports" replace />;
    // } else {
    //   return <Navigate to="/dashboard" replace />;
    // }
  }

  return element;
};

export default PublicRoute;
