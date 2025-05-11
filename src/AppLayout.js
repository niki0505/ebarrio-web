import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`page-grid ${isCollapsed ? "collapsed" : ""}`}>
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
