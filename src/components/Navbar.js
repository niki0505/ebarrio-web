import React, { useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { PiSignOutBold } from "react-icons/pi";
import { IoMdSettings } from "react-icons/io";
import "../Stylesheets/NavBar.css";


const Navbar = ({ isCollapsed }) => {
  const [profileDropdown, setprofileDropdown] = useState(false);

  const toggleProfileDropdown = () => {
    setprofileDropdown(!profileDropdown);
  };

  return (
    <>
      <header
        className={`navbar ${isCollapsed ? "left-[5rem]" : "left-[18rem]"}`}
      >
        <div className="navbar-right">
          {/* Notification Icon */} 
          <IoNotificationsOutline className="navbar-icon" />

          {/* User Information */}
          <div className="navbar-user-info">
            <h2 className="text-blue font-bold text-base">Juan Dela Cruz</h2>
            <h2 className="text-gray-500 text-sm">Secretary</h2>
          </div>

          {/* Profile Image and Dropdown */}
          <div className="relative">
            <img
              src={require("../assets/profileimg.png")}
              alt="Profile"
              onClick={toggleProfileDropdown}
              className="navbar-profile-img"
            />
            {profileDropdown && (
              <div className="navbar-dropdown">
                <ul className="w-full">
                  <div className="navbar-dropdown-item">
                    <IoMdSettings className="account-icon" />
                    <li className="account-text">Account</li>
                  </div>
                  <div className="navbar-dropdown-item ">
                    <PiSignOutBold className="signout-icon" />
                    <li className="signout-text">Sign Out</li>
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
