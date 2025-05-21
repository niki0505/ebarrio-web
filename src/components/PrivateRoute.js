import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ element, allowedRoles }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  console.log(isAuthenticated);

  if (isAuthenticated === null) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
    // if (user?.role === "Justice") {
    //   return <Navigate to="/blotter-reports" replace />;
    // } else {
    //   return <Navigate to="/dashboard" replace />;
    // }
  }

  return element;
};

export default PrivateRoute;
