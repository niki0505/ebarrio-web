import React, { useContext, useState, useEffect, useRef } from "react";
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
  const navigation = useNavigate();
  const [profileDropdown, setprofileDropdown] = useState(false);
  const [notificationDropdown, setnotificationDropdown] = useState(false);
  const { logout, user } = useContext(AuthContext);
  const { residents, fetchResidents } = useContext(InfoContext);
  const { fetchNotifications, notifications } = useContext(SocketContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState(null);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  //To handle close when click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target) &&
        notificationDropdown
      ) {
        setnotificationDropdown(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        profileDropdown
      ) {
        setprofileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationDropdown, profileDropdown]);

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
    setnotificationDropdown(!notificationDropdown);
  };

  const handleNotif = async (notifID, redirectTo) => {
    try {
      await api.put(`/readnotification/${notifID}`);
      setnotificationDropdown(false);
      navigation(redirectTo);
    } catch (error) {
      console.log("Error in reading notification", error);
    }
  };

  const truncateNotifMessage = (message, wordLimit = 25) => {
    const words = message.split(" ");
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + " ..."
      : message;
  };

  return (
    <>
      <header
        className={`navbar ${isCollapsed ? "left-[5rem]" : "left-[18rem]"}`}
      >
        <div className="navbar-right">
          <div className="relative" ref={notifRef}>
            {notifications.some((n) => n.read === false) && (
              <div className="absolute left-1 rounded-full w-2 h-2 ml-2 mt-1 mr-3 flex-shrink-0 bg-blue-500"></div>
            )}

            <IoNotifications
              className="navbar-icon"
              onClick={toggleNotificationDropdown}
            />
            {notificationDropdown && (
              <div className="absolute right-0 mt-4 bg-[#FAFAFA] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] rounded-[10px] w-[22rem] h-[20rem] overflow-y-auto hide-scrollbar border border-[#C1C0C0]">
                <div className="flex flex-row justify-between items-center">
                  <h1 className="text-navy-blue text-lg font-bold p-3">
                    Notifications
                  </h1>

                  <h1 className="text-navy-blue text-xs font-semibold p-3">
                    Mark all as read
                  </h1>
                </div>

                {[...notifications]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((notif, index) => {
                    return (
                      <div
                        onClick={() => handleNotif(notif._id, notif.redirectTo)}
                        key={index}
                        className="flex flex-col border-t border-[#C1C0C0] hover:bg-gray-200"
                      >
                        <div className="flex items-center my-2">
                          <div
                            className={`rounded-full w-2 h-2 ml-2 mt-1 mr-3 flex-shrink-0 ${
                              notif.read ? "bg-transparent" : "bg-blue-500"
                            } `}
                          ></div>

                          <div className="flex flex-col">
                            <label className="text-navy-blue font-subTitle text-[12px] font-bold">
                              {notif.title}
                            </label>
                            <label className="text-navy-blue font-subTitle text-[12px] font-semibold">
                              {truncateNotifMessage(notif.message)}
                            </label>

                            <label className="text-[#808080] text-[12px] font-subTitle font-semibold">
                              {dayjs(notif.createdAt).fromNow()}
                            </label>
                          </div>
                        </div>
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
          <div className="relative" ref={profileRef}>
            <IoIosArrowDown onClick={toggleProfileDropdown} />
            {profileDropdown && (
              <div className="navbar-dropdown">
                <ul className="w-full">
                  <div className="navbar-dropdown-item">
                    <IoMdSettings className="account-icon" />
                    <li
                      className="account-text"
                      onClick={() => {
                        setprofileDropdown(false);
                        navigation("/account");
                      }}
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
