import logo from "./logo.svg";
import React, { useState } from "react";
import CreateResident from "./components/CreateResident";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
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
import EmergencyHotlines from "./components/EmergencyHotlines";
import CertificateRequests from "./components/CertificateRequests";
import Announcements from "./components/Announcements";
import Dashboard from "./components/Dashboard";
import CourtReservations from "./components/CourtReservations";
import BlotterReports from "./components/BlotterReports";
import CreateBlotter from "./components/CreateBlotter";
import SetPassword from "./components/SetPassword";
import SettleBlotter from "./components/SettleBlotter";
import AccountSettings from "./components/AccountSettings";
import ForgotPassword from "./components/ForgotPassword";
import { OtpProvider } from "./context/OtpContext";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import { ConfirmProvider } from "./context/ConfirmContext";
import PublicRoute from "./components/PublicRoute";

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
          <ConfirmProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route
                path="/login"
                element={<PublicRoute element={<Login />} />}
              />
              <Route
                path="/signup"
                element={<PublicRoute element={<Signup />} />}
              />
              <Route path="/otp" element={<PublicRoute element={<OTP />} />} />
              <Route
                path="/set-password"
                element={<PublicRoute element={<SetPassword />} />}
              />
              <Route
                path="/forgot-password"
                element={<PublicRoute element={<ForgotPassword />} />}
              />
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
                <Route
                  path="certificate-requests"
                  element={<PrivateRoute element={<CertificateRequests />} />}
                />
                <Route
                  path="emergency-hotlines"
                  element={<PrivateRoute element={<EmergencyHotlines />} />}
                />
                <Route
                  path="announcements"
                  element={<PrivateRoute element={<Announcements />} />}
                />
                <Route
                  path="dashboard"
                  element={<PrivateRoute element={<Dashboard />} />}
                />
                <Route
                  path="court-reservations"
                  element={<PrivateRoute element={<CourtReservations />} />}
                />
                <Route
                  path="blotter-reports"
                  element={<PrivateRoute element={<BlotterReports />} />}
                />
                <Route
                  path="create-blotter"
                  element={<PrivateRoute element={<CreateBlotter />} />}
                />
                <Route
                  path="settle-blotter"
                  element={<PrivateRoute element={<SettleBlotter />} />}
                />
                <Route
                  path="account"
                  element={<PrivateRoute element={<AccountSettings />} />}
                />
              </Route>
            </Routes>
          </ConfirmProvider>
        </OtpProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
