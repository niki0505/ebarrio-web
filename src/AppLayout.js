import React, { useState, useContext } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";
import SessionTimeout from "./components/SessionTimeout";
import Chat from "./components/Chat";
import { AuthContext } from "./context/AuthContext";

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);

  return (
    <div className={`page-grid ${isCollapsed ? "collapsed" : ""}`}>
      {isAuthenticated && user && (
        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />
      )}

      <Navbar isCollapsed={isCollapsed} />
      <div className="page-content">
        <Outlet />
      </div>

      {isAuthenticated && user && <Chat />}
      <SessionTimeout timeout={15 * 60 * 1000} />
    </div>
  );
};

export default AppLayout;
