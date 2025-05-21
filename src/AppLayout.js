import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";
import SessionTimeout from "./components/SessionTimeout";

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`page-grid ${isCollapsed ? "collapsed" : ""}`}>
      <SessionTimeout />
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
      />
      <Navbar isCollapsed={isCollapsed} />
      <div className="page-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
