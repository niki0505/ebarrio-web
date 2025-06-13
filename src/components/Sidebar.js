import { NavLink } from "react-router-dom";
import "../Stylesheets/SideBar.css";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import AppLogo from "../assets/applogo-darkbg.png";

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
import { MdOutlineUpdate } from "react-icons/md";
import { useState } from "react";
import { AiFillAlert } from "react-icons/ai";
import { PiUserSwitchFill } from "react-icons/pi";
import { InfoContext } from "../context/InfoContext";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const { pendingReservationCount } = useContext(InfoContext);
  const location = useLocation();
  if (!user) return null;

  const Menus = [
    (user.role === "Secretary" ||
      user.role === "Clerk" ||
      user.role === "Justice" ||
      user.role === "Technical Admin") && {
      title: "Dashboard",
      icon: <MdDashboard />,
      path: "/dashboard",
    },
    (user.role === "Secretary" || user.role === "Technical Admin") && {
      title: "Employees",
      icon: <IoPeople />,
      path: "/employees",
    },
    (user.role === "Secretary" ||
      user.role === "Clerk" ||
      user.role === "Technical Admin") && {
      title: "Residents",
      icon: <IoIosPeople />,
      path: "/residents",
    },
    (user.role === "Secretary" ||
      user.role === "Clerk" ||
      user.role === "Technical Admin") && {
      title: "Households",
      icon: <IoIosPeople />,
      path: "/households",
    },
    (user.role === "Justice" ||
      user.role === "Secretary" ||
      user.role === "Technical Admin") && {
      title: "Blotter Reports",
      icon: <MdEditDocument />,
      path: "/blotter-reports",
    },
    (user.role === "Secretary" ||
      user.role === "Clerk" ||
      user.role === "Technical Admin") && {
      title: "Document Requests",
      icon: <IoDocumentTextSharp />,
      path: "/document-requests",
    },
    (user.role === "Secretary" ||
      user.role === "Clerk" ||
      user.role === "Technical Admin") && {
      title: "Court Reservations",
      icon: <PiCourtBasketballFill />,
      path: "/court-reservations",
    },
    (user.role === "Secretary" ||
      user.role === "Clerk" ||
      user.role === "Justice" ||
      user.role === "Technical Admin") && {
      title: "Announcements",
      icon: <BiSolidMegaphone />,
      path: "/announcements",
    },
    (user.role === "Secretary" ||
      user.role === "Clerk" ||
      user.role === "Justice" ||
      user.role === "Technical Admin") && {
      title: "SOS Update Reports",
      icon: <AiFillAlert />,
      path: "/sos-update-reports",
    },
    (user.role === "Secretary" ||
      user.role === "Clerk" ||
      user.role === "Justice" ||
      user.role === "Technical Admin") && {
      title: "River Snapshots",
      icon: <BiSolidCctv />,
      path: "/river-snapshots",
    },
    (user.role === "Secretary" ||
      user.role === "Clerk" ||
      user.role === "Technical Admin") && {
      title: "Emergency Hotlines",
      icon: <RiContactsBook3Fill />,
      path: "/emergency-hotlines",
    },
    (user.role === "Secretary" || user.role === "Technical Admin") && {
      title: "Accounts Management",
      icon: <FaUsersCog />,
      path: "/accounts",
    },
    (user.role === "Secretary" || user.role === "Technical Admin") && {
      title: "Activity Logs",
      icon: <PiUserSwitchFill />,
      path: "/activity-logs",
    },
  ].filter(Boolean);

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="flex flex-col overflow-y-auto h-full hide-scrollbar">
        <div
          className={`sidebar-toggle-btn ${isCollapsed ? "m-3" : ""}`}
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <div className="block">
              <BiMenu className="text-xl" />
            </div>
          ) : (
            <>
              {/* For smaller screens*/}
              <div className="block sm:block md:hidden lg:hidden ml-3 mb-2">
                <BiMenu className="text-xl" />
              </div>

              {/* For medium and large screens*/}
              <div className="hidden sm:hidden md:block lg:block">
                <BiMenuAltLeft className="text-xl" />
              </div>
            </>
          )}
        </div>

        <div
          className={`sidebar-logo-container ${
            isCollapsed ? "justify-start mt-4" : "justify-center"
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
            <h1 className="sidebar-app-name">eBarrio</h1>
            <label className="text-[rgba(255,255,255,0.50)] text-[12px] text-[#808080] font-subTitle font-semibold hidden md:block lg:block">
              Barangay Management <br /> Disaster Response System
            </label>
          </span>
        </div>

        <ul className="sidebar-menu">
          {Menus.map((menu, index) => {
            //Custom active highlight for residents subpage
            const isResidentsActive =
              menu.path === "/residents" &&
              ["/residents", "/create-resident"].includes(location.pathname);

            //Custom active highlight for blotter subpage
            const isBlotterActive =
              menu.path === "/blotter-reports" &&
              location.pathname.startsWith("/create-blotter");

            const isDefaultActive = location.pathname === menu.path;

            const isActive =
              isResidentsActive || isBlotterActive || isDefaultActive;

            return (
              <li key={index} className="sidebar-menu-item group mb-[-5px]">
                <NavLink
                  to={menu.path}
                  className={`flex items-center sidebar-menu-item-link ${
                    isActive
                      ? "bg-gray-500 w-full h-full rounded-lg text-white font-bold"
                      : ""
                  }`}
                >
                  <span
                    className={`sidebar-menu-item-icon ml-2 ${
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
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
