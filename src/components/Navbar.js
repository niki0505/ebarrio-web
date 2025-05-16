import React, { useContext, useState, useEffect } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { PiSignOutBold } from "react-icons/pi";
import { IoMdSettings } from "react-icons/io";
import "../Stylesheets/NavBar.css";
import { AuthContext } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { InfoContext } from "../context/InfoContext";

const Navbar = ({ isCollapsed }) => {
  const location = useLocation();
  const navigation = useNavigate();
  const [profileDropdown, setprofileDropdown] = useState(false);
  const { logout, user } = useContext(AuthContext);
  const { residents, fetchResidents } = useContext(InfoContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState(null);

  useEffect(() => {
    setprofileDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
    residents.map((res) => {
      if (res.empID?._id === user.empID) {
        setProfilePic(res.picture);
        setName(`${res.firstname} ${res.lastname}`);
      }
    });
  }, [residents]);

  if (!user) return null;

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
            <h2 className="text-navy-blue font-bold text-base">{name}</h2>
            <h2 className="text-[#ACACAC] text-sm font-semibold font-subTitle">
              {user.role}
            </h2>
          </div>

          {/* Profile Image and Dropdown */}
          <div className="relative">
            <img
              src={profilePic}
              alt="Profile"
              onClick={toggleProfileDropdown}
              className="navbar-profile-img"
            />
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
