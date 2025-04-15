import logo from "./logo.svg";
import React, { useState } from "react";
import CreateResident from "./components/CreateResident";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import OpenCamera from "./components/OpenCamera";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Residents from "./components/Residents";
import Employees from "./components/Employees";
import Accounts from "./components/Accounts";
import EditResident from "./components/EditResident";
import { InfoProvider } from "./context/InfoContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import OTP from "./components/OTP";
import { OtpProvider } from "./context/OtpContext";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const AppLayout = ({ isCollapsed, setIsCollapsed }) => (
    <InfoProvider>
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
    </InfoProvider>
  );
  return (
    <Router>
      <AuthProvider>
        <OtpProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/otp" element={<OTP />} />

            <Route
              path="/"
              element={
                <AppLayout
                  isCollapsed={isCollapsed}
                  setIsCollapsed={setIsCollapsed}
                />
              }
            >
              <Route
                path="residents"
                element={
                  <PrivateRoute
                    element={<Residents isCollapsed={isCollapsed} />}
                  />
                }
              />
              <Route
                path="create-resident"
                element={
                  <PrivateRoute
                    element={<CreateResident isCollapsed={isCollapsed} />}
                  />
                }
              />
              <Route
                path="edit-resident"
                element={
                  <PrivateRoute
                    element={<EditResident isCollapsed={isCollapsed} />}
                  />
                }
              />
              <Route
                path="employees"
                element={<PrivateRoute element={<Employees />} />}
              />
              <Route
                path="accounts"
                element={<PrivateRoute element={<Accounts />} />}
              />
            </Route>
          </Routes>
        </OtpProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
