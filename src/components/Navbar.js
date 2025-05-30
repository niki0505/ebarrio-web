import React, { useContext, useState, useEffect } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { PiSignOutBold } from "react-icons/pi";
import { IoMdSettings } from "react-icons/io";
import "../Stylesheets/NavBar.css";
import { AuthContext } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { InfoContext } from "../context/InfoContext";
import { IoNotifications } from "react-icons/io5";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { IoIosArrowDown } from "react-icons/io";
import api from "../api";
import { SocketContext } from "../context/SocketContext";
const Navbar = ({ isCollapsed }) => {
  dayjs.extend(relativeTime);
  const location = useLocation();
  const navigation = useNavigate();
  const [profileDropdown, setprofileDropdown] = useState(false);
  const [notificationDropdown, setnotificatioDropdown] = useState(false);
  const { logout, user } = useContext(AuthContext);
  const { residents, fetchResidents } = useContext(InfoContext);
  const { fetchNotifications, notifications } = useContext(SocketContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState(null);

  useEffect(() => {
    fetchResidents();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isAuthenticated && residents) {
      residents.map((res) => {
        if (res.empID?._id === user.empID) {
          setProfilePic(res.picture);
          setName(`${res.firstname} ${res.lastname}`);
        }
      });
    }
  }, [isAuthenticated, residents]);

  if (!user) return null;

  const toggleProfileDropdown = () => {
    setprofileDropdown(!profileDropdown);
  };

  const toggleNotificationDropdown = () => {
    setnotificatioDropdown(!notificationDropdown);
  };

  const handleNotif = async (notifID, redirectTo) => {
    try {
      await api.put(`/readnotification/${notifID}`);
      navigation(redirectTo);
    } catch (error) {
      console.log("Error in reading notification", error);
    }
  };

  return (
    <>
      <header
        className={`navbar ${isCollapsed ? "left-[5rem]" : "left-[18rem]"}`}
      >
        <div className="navbar-right">
          <div className="relative">
            <IoNotifications
              className="navbar-icon"
              onClick={toggleNotificationDropdown}
            />
            {notificationDropdown && (
              <div className="absolute right-0 mt-4 bg-white shadow-md rounded-md w-[16rem] h-[20rem] overflow-y-auto hide-scrollbar">
                <ul className="w-full inline-flex py-2 cursor-pointer items-center"></ul>
                {[...notifications]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((notif, index) => {
                    return (
                      <div
                        onClick={() => handleNotif(notif._id, notif.redirectTo)}
                        style={{ cursor: "pointer" }}
                        key={index}
                      >
                        <label>
                          {!notif.read ? (
                            <label style={{ color: "blue" }}>Blue Circle</label>
                          ) : null}
                        </label>
                        <label>{notif.title}</label>
                        <label>{notif.message}</label>
                        <label>{dayjs(notif.createdAt).fromNow()}</label>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <img src={profilePic} alt="Profile" className="navbar-profile-img" />

          {/* User Information */}
          <div className="navbar-user-info">
            <h2 className="text-navy-blue font-bold text-base">{name}</h2>
            <h2 className="text-[#808080] text-sm font-semibold font-subTitle">
              {user.role}
            </h2>
          </div>
          {/* Profile Image and Dropdown */}
          <div className="relative">
            <IoIosArrowDown onClick={toggleProfileDropdown} />
            {profileDropdown && (
              <div className="navbar-dropdown">
                <ul className="w-full">
                  <div className="navbar-dropdown-item">
                    <IoMdSettings className="account-icon" />
                    <li
                      className="account-text"
                      onClick={() => navigation("/account")}
                    >
                      Account
                    </li>
                  </div>
                  <div className="navbar-dropdown-item ">
                    <PiSignOutBold className="signout-icon" />
                    <li className="signout-text" onClick={logout}>
                      Sign Out
                    </li>
                  </div>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
