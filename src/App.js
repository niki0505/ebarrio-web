import logo from "./logo.svg";
import React, { useState } from "react";
import CreateResident from "./components/CreateResident";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OpenCamera from "./components/OpenCamera";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Residents from "./components/Residents";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <Router>
      <div className={`page-grid ${isCollapsed ? "collapsed" : ""}`}>
        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />
        <Navbar isCollapsed={isCollapsed} />
        <Routes>
          <Route
            path="/residents"
            element={<Residents isCollapsed={isCollapsed} />}
          ></Route>
          <Route
            path="/create-resident"
            element={<CreateResident isCollapsed={isCollapsed} />}
          ></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
