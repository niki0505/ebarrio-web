import logo from "./logo.svg";
import React, { useState } from "react";
import CreateResident from "./components/CreateResident";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OpenCamera from "./components/OpenCamera";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Residents from "./components/Residents";
import Employees from "./components/Employees";
import Accounts from "./components/Accounts";
import EditResident from "./components/EditResident";
import { InfoProvider } from "./context/InfoContext";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <Router>
      <InfoProvider>
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
            <Route
              path="/edit-resident"
              element={<EditResident isCollapsed={isCollapsed} />}
            ></Route>
            <Route
              path="/employees"
              element={<Employees />}
              isCollapsed={isCollapsed}
            />
            <Route
              path="/accounts"
              element={<Accounts />}
              isCollapsed={isCollapsed}
            />
          </Routes>
        </div>
      </InfoProvider>
    </Router>
  );
}

export default App;
