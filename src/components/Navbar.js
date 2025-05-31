import { useContext, useState, useEffect, useRef } from "react";
import { PiSignOutBold } from "react-icons/pi";
import { IoMdSettings } from "react-icons/io";
import "../Stylesheets/NavBar.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { InfoContext } from "../context/InfoContext";
import { IoNotifications } from "react-icons/io5";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { IoIosArrowDown } from "react-icons/io";
import api from "../api";
import { SocketContext } from "../context/SocketContext";
import { useConfirm } from "../context/ConfirmContext";
import { TbAdjustmentsHorizontal } from "react-icons/tb";
const Navbar = ({ isCollapsed }) => {
  const confirm = useConfirm();
  dayjs.extend(relativeTime);
  const navigation = useNavigate();
  const [profileDropdown, setprofileDropdown] = useState(false);
  const [notificationDropdown, setnotificationDropdown] = useState(false);
  const [filterDropdown, setfilterDropdown] = useState(false);
  const { logout, user } = useContext(AuthContext);
  const { residents, fetchResidents } = useContext(InfoContext);
  const { fetchNotifications, notifications } = useContext(SocketContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [profilePic, setProfilePic] = useState(null);
  const [sortOption, setSortOption] = useState("All");
  const [name, setName] = useState(null);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const filterRef = useRef(null);

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

      if (
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        filterDropdown
      ) {
        setfilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationDropdown, profileDropdown, filterDropdown]);

  useEffect(() => {
    fetchResidents();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isAuthenticated && Array.isArray(residents) && user) {
      const match = residents.find((res) => res?.empID?._id === user.empID);
      if (match) {
        setProfilePic(match.picture);
        setName(`${match.firstname} ${match.lastname}`);
      }
    }
  }, [isAuthenticated, residents, user]);

  const filteredNotifications = notifications.filter((notif) => {
    if (sortOption === "All") return true;
    if (sortOption === "Read") return notif.read === true;
    if (sortOption === "Unread") return notif.read === false;
    return true;
  });

  const toggleProfileDropdown = () => {
    setprofileDropdown(!profileDropdown);
  };

  const toggleNotificationDropdown = () => {
    setnotificationDropdown(!notificationDropdown);
  };

  const toggleFilterDropdown = () => {
    setfilterDropdown(!filterDropdown);
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

  const handleLogout = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to log out?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    logout();
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/readnotifications");
    } catch (error) {
      console.log("Error in marking all as read", error);
    }
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
              <div className="absolute right-0 mt-4 bg-[#FAFAFA] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] rounded-[10px] w-[24rem] h-[20rem] border border-[#C1C0C0] flex flex-col">
                {/* Header */}
                <div className="flex flex-row justify-between items-center px-3 py-2">
                  <div className="flex flex-row items-center">
                    <h1 className="text-navy-blue text-lg font-bold">
                      Notifications
                    </h1>
                    <h1 className="text-xs bg-[#BC0F0F] text-[#fff] px-1 rounded-full ml-2">
                      {notifications.reduce(
                        (count, notification) =>
                          notification.read ? count : count + 1,
                        0
                      )}
                    </h1>
                  </div>
                  <div className="relative" ref={filterRef}>
                    <TbAdjustmentsHorizontal
                      className="text-navy-blue text-lg font-medium"
                      onClick={toggleFilterDropdown}
                    />
                    {filterDropdown && (
                      <div className="absolute bg-white shadow-md rounded-md border;">
                        <ul className="w-full">
                          <div className="py-1 px-3 cursor-pointer hover:bg-gray-200 w-full rounded-md items-center">
                            <li
                              className="text-sm font-title text-[#0E94D3]"
                              onClick={() => {
                                setSortOption("All");
                                setfilterDropdown(false);
                              }}
                            >
                              All
                            </li>
                          </div>
                          <div className="py-1 px-3 cursor-pointer hover:bg-gray-200 w-full rounded-md items-center">
                            <li
                              className="text-sm font-title text-[#0E94D3]"
                              onClick={() => {
                                setSortOption("Read");
                                setfilterDropdown(false);
                              }}
                            >
                              Read
                            </li>
                          </div>
                          <div className="py-1 px-3 cursor-pointer hover:bg-gray-200 w-full rounded-md items-center">
                            <li
                              className="text-sm font-title text-[#0E94D3]"
                              onClick={() => {
                                setSortOption("Unread");
                                setfilterDropdown(false);
                              }}
                            >
                              Unread
                            </li>
                          </div>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scrollable Notification List */}
                <div className="overflow-y-auto hide-scrollbar flex-grow border-t border-b border-[#C1C0C0]">
                  {[...filteredNotifications]
                    .sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )
                    .map((notif, index) => (
                      <div
                        onClick={() => handleNotif(notif._id, notif.redirectTo)}
                        key={index}
                        className="flex flex-col hover:bg-gray-200 cursor-pointer"
                      >
                        <div className="flex justify-between my-2 px-3">
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

                          <div
                            className={`rounded-full w-2 h-2 mr-3 mt-1 flex-shrink-0 ${
                              notif.read ? "bg-transparent" : "bg-blue-500"
                            }`}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-3">
                  <h1
                    onClick={markAllAsRead}
                    className="text-navy-blue text-xs font-semibold cursor-pointer whitespace-nowrap"
                  >
                    Mark all as read
                  </h1>
                </div>
              </div>
            )}
          </div>

          <img src={profilePic} alt="Profile" className="navbar-profile-img" />

          {/* User Information */}
          <div className="navbar-user-info">
            <h2 className="text-navy-blue font-bold text-base">{name}</h2>
            {user?.role && (
              <h2 className="text-[#808080] text-sm font-semibold font-subTitle">
                {user.role}
              </h2>
            )}
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
                    <li className="signout-text" onClick={handleLogout}>
                      Log Out
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
