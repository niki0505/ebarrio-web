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
import { BiCommentDetail, BiMenuAltLeft, BiCctv } from "react-icons/bi";
import "../Stylesheets/SideBar.css";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const Menus = [
    {
      title: "Dashboard",
      icon: <MdOutlineDashboard />,
      path: "/",
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
      title: "Complaint Reports",
      icon: <HiOutlineDocumentText />,
      path: "/complaint-reports",
    },
    {
      title: "Certificate Requests",
      icon: <IoDocumentsOutline />,
      path: "/certificate-requests",
    },
    {
      title: "Facility & Asset Reservation",
      icon: <AiOutlineSchedule />,
      path: "/reservation",
    },
    {
      title: "Feedback & Suggestions",
      icon: <BiCommentDetail />,
      path: "/feedback",
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
      title: "Emergency Contacts",
      icon: <RiContactsBook3Line />,
      path: "/contacts",
    },
    {
      title: "Account Management",
      icon: <IoSettingsOutline />,
      path: "/accounts",
    },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="flex flex-col">
        <BiMenuAltLeft
          className={`sidebar-toggle-btn ${isCollapsed && "rotate-180 m-3"}`}
          onClick={() => toggleSidebar(!isCollapsed)}
        />
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
                      : " "
                  }`
                }
                end
              >
                <span
                  className={`sidebar-menu-item-icon ${
                    isCollapsed ? "ml-2" : ""
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
