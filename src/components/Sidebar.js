import { NavLink } from "react-router-dom";
import "../Stylesheets/SideBar.css";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

//ICONS
import { IoIosPeople } from "react-icons/io";
import { PiCourtBasketballFill } from "react-icons/pi";
import { RiContactsBook3Fill } from "react-icons/ri";
import { FaUsersCog } from "react-icons/fa";
import { MdDashboard, MdEditDocument } from "react-icons/md";
import { IoPeople, IoLocation, IoDocumentTextSharp } from "react-icons/io5";
import {
  BiMenuAltLeft,
  BiMenu,
  BiSolidMegaphone,
  BiSolidCctv,
} from "react-icons/bi";
import { useState } from "react";
import AppLogo from "../assets/applogo-darkbg.png";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  if (!user) return null;

  const Menus = [
    {
      title: "Dashboard",
      icon: <MdDashboard />,
      path: "/dashboard",
    },
    {
      title: "Employees",
      icon: <IoPeople />,
      path: "/employees",
    },
    {
      title: "Residents",
      icon: <IoIosPeople />,
      path: "/residents",
    },
    {
      title: "Blotter Reports",
      icon: <MdEditDocument />,
      path: "/blotter-reports",
    },
    {
      title: "Certificate Requests",
      icon: <IoDocumentTextSharp />,
      path: "/certificate-requests",
    },
    {
      title: "Court Reservations",
      icon: <PiCourtBasketballFill />,
      path: "/court-reservations",
    },
    {
      title: "Announcements",
      icon: <BiSolidMegaphone />,
      path: "/announcements",
    },
    {
      title: "SOS Reports",
      icon: <IoLocation />,
      path: "/sos-reports",
    },
    {
      title: "CCTV Footage",
      icon: <BiSolidCctv />,
      path: "/flood-footage",
    },
    {
      title: "Emergency Hotlines",
      icon: <RiContactsBook3Fill />,
      path: "/emergency-hotlines",
    },
    user.role === "Secretary" && {
      title: "Accounts Management",
      icon: <FaUsersCog />,
      path: "/accounts",
    },
  ].filter(Boolean);

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="flex flex-col">
        <div
          className={`sidebar-toggle-btn ${isCollapsed ? "m-3" : ""}`}
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <BiMenu className="text-xl" />
          ) : (
            <BiMenuAltLeft className="text-xl" />
          )}
        </div>

        <div
          className={`sidebar-logo-container ${
            isCollapsed ? "justify-start" : "justify-center"
          }`}
        >
          <img
            src={AppLogo}
            alt="App Logo"
            className={`sidebar-logo-img ${
              isCollapsed ? "rotate-[360deg]" : ""
            }`}
          />
          <span
            className={`flex flex-col text-center ${
              isCollapsed ? "hidden" : "block"
            }`}
          >
            <label className="sidebar-logo-text">eBarrio</label>
            <label className="text-[rgba(255,255,255,0.50)] text-xs">
              Barangay Management
            </label>
            <label className="text-[rgba(255,255,255,0.50)] text-xs">
              Disaster Response System
            </label>
          </span>
        </div>

        <ul className="sidebar-menu ">
          {Menus.map((menu, index) => (
            <li key={index} className="sidebar-menu-item group mb-[-5px]">
              <NavLink
                to={menu.path}
                className={({ isActive }) =>
                  `flex items-center sidebar-menu-item-link ${
                    isActive
                      ? "bg-gray-500 w-full h-full rounded-lg text-white font-bold"
                      : ""
                  }`
                }
                end
              >
                <span
                  className={`sidebar-menu-item-icon ${
                    isCollapsed ? "ml-3" : ""
                  }`}
                  aria-hidden="true"
                >
                  {menu.icon}
                </span>
                <span
                  className={`sidebar-menu-item-title ${
                    isCollapsed ? "hidden" : "block"
                  }`}
                >
                  {menu.title}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
