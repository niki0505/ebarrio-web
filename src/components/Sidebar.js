import { NavLink } from "react-router-dom";
import { BsPeople } from "react-icons/bs";
import { RiContactsBook3Line } from "react-icons/ri";
import { AiOutlineSchedule } from "react-icons/ai";
import { MdOutlineDashboard } from "react-icons/md";
import { TfiAnnouncement } from "react-icons/tfi";
import {
  IoPeopleOutline,
  IoDocumentsOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { HiOutlineDocumentSearch, HiOutlineDocumentText } from "react-icons/hi";
import { BiCommentDetail, BiMenuAltLeft, BiMenu, BiCctv } from "react-icons/bi";
import "../Stylesheets/SideBar.css";
import { AuthContext } from "../context/AuthContext";
import { useContext, useEffect } from "react";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  if (!user) return null;

  const Menus = [
    {
      title: "Dashboard",
      icon: <MdOutlineDashboard />,
      path: "/dashboard",
    },
    {
      title: "Employees",
      icon: <BsPeople />,
      path: "/employees",
    },
    {
      title: "Residents",
      icon: <IoPeopleOutline />,
      path: "/residents",
    },
    {
      title: "Blotter Reports",
      icon: <HiOutlineDocumentSearch />,
      path: "/blotter-reports",
    },
    {
      title: "Certificate Requests",
      icon: <IoDocumentsOutline />,
      path: "/certificate-requests",
    },
    {
      title: "Court Reservations",
      icon: <AiOutlineSchedule />,
      path: "/court-reservations",
    },
    {
      title: "Announcements",
      icon: <TfiAnnouncement />,
      path: "/announcements",
    },
    {
      title: "Flood Prone Footage",
      icon: <BiCctv />,
      path: "/flood-footage",
    },
    {
      title: "Emergency Hotlines",
      icon: <RiContactsBook3Line />,
      path: "/emergency-hotlines",
    },
    user.role === "Secretary" && {
      title: "Account Management",
      icon: <IoSettingsOutline />,
      path: "/accounts",
    },
  ].filter(Boolean);

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="flex flex-col">
        <div
          className={`sidebar-toggle-btn ${isCollapsed ? "m-3" : ""}`}
          onClick={() => toggleSidebar(!isCollapsed)}
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
            src={require("../assets/BarangayLogo.png")}
            alt="Barangay Logo"
            className={`sidebar-logo-img ${
              isCollapsed ? "rotate-[360deg]" : ""
            }`}
          />
          <span
            className={`sidebar-logo-text ${isCollapsed ? "hidden" : "block"}`}
          >
            eBarrio
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
