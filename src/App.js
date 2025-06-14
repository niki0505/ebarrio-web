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
import AppLayout from "./AppLayout";
import { SocketProvider } from "./context/SocketContext";
import { ToastContainer } from "react-toastify";
import SOSUpdateReports from "./components/SOSUpdateReports";
import RiverSnapshots from "./components/RiverSnapshots";
import ActivityLogs from "./components/ActivityLogs";
import Household from "./components/Household";
import ViewResident from "./components/ViewResident";

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <OtpProvider>
            <ConfirmProvider>
              <InfoProvider>
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
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
                  <Route
                    path="/otp"
                    element={<PublicRoute element={<OTP />} />}
                  />
                  <Route
                    path="/set-password"
                    element={<PublicRoute element={<SetPassword />} />}
                  />
                  <Route
                    path="/forgot-password"
                    element={<PublicRoute element={<ForgotPassword />} />}
                  />
                  <Route path="/" element={<AppLayout />}>
                    <Route
                      path="residents"
                      element={
                        <PrivateRoute
                          element={<Residents />}
                          allowedRoles={[
                            "Secretary",
                            "Clerk",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="households"
                      element={
                        <PrivateRoute
                          element={<Household />}
                          allowedRoles={[
                            "Secretary",
                            "Clerk",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="create-resident"
                      element={
                        <PrivateRoute
                          element={<CreateResident />}
                          allowedRoles={[
                            "Secretary",
                            "Clerk",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="edit-resident"
                      element={
                        <PrivateRoute
                          element={<EditResident />}
                          allowedRoles={[
                            "Secretary",
                            "Clerk",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="view-resident"
                      element={
                        <PrivateRoute
                          element={<ViewResident />}
                          allowedRoles={[
                            "Secretary",
                            "Clerk",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="employees"
                      element={
                        <PrivateRoute
                          element={<Employees />}
                          allowedRoles={["Secretary", "Technical Admin"]}
                        />
                      }
                    />
                    <Route
                      path="accounts"
                      element={
                        <PrivateRoute
                          element={<Accounts />}
                          allowedRoles={["Secretary", "Technical Admin"]}
                        />
                      }
                    />
                    <Route
                      path="activity-logs"
                      element={
                        <PrivateRoute
                          element={<ActivityLogs />}
                          allowedRoles={["Secretary", "Technical Admin"]}
                        />
                      }
                    />
                    <Route
                      path="document-requests"
                      element={
                        <PrivateRoute
                          element={<CertificateRequests />}
                          allowedRoles={[
                            "Secretary",
                            "Clerk",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="emergency-hotlines"
                      element={
                        <PrivateRoute
                          element={<EmergencyHotlines />}
                          allowedRoles={[
                            "Secretary",
                            "Clerk",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="announcements"
                      element={
                        <PrivateRoute
                          element={<Announcements />}
                          allowedRoles={[
                            "Secretary",
                            "Clerk",
                            "Justice",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="dashboard"
                      element={
                        <PrivateRoute
                          element={<Dashboard />}
                          allowedRoles={[
                            "Secretary",
                            "Clerk",
                            "Justice",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="court-reservations"
                      element={
                        <PrivateRoute
                          element={<CourtReservations />}
                          allowedRoles={[
                            "Secretary",
                            "Clerk",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="blotter-reports"
                      element={
                        <PrivateRoute
                          element={<BlotterReports />}
                          allowedRoles={[
                            "Justice",
                            "Secretary",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="create-blotter"
                      element={
                        <PrivateRoute
                          element={<CreateBlotter />}
                          allowedRoles={[
                            "Justice",
                            "Secretary",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="settle-blotter"
                      element={
                        <PrivateRoute
                          element={<SettleBlotter />}
                          allowedRoles={[
                            "Justice",
                            "Secretary",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="account"
                      element={
                        <PrivateRoute
                          element={<AccountSettings />}
                          allowedRoles={[
                            "Secretary",
                            "Clerk",
                            "Justice",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="sos-update-reports"
                      element={
                        <PrivateRoute
                          element={<SOSUpdateReports />}
                          allowedRoles={[
                            "Secretary",
                            "Clerk",
                            "Justice",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                    <Route
                      path="river-snapshots"
                      element={
                        <PrivateRoute
                          element={<RiverSnapshots />}
                          allowedRoles={[
                            "Secretary",
                            "Clerk",
                            "Justice",
                            "Technical Admin",
                          ]}
                        />
                      }
                    />
                  </Route>
                </Routes>
              </InfoProvider>
            </ConfirmProvider>
          </OtpProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
