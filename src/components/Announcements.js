import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/CommonStyle.css";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CreateAnnouncement from "./CreateAnnouncement";
import { MdPersonAddAlt1 } from "react-icons/md";
import { useConfirm } from "../context/ConfirmContext";
import api from "../api";
import "../Stylesheets/Announcements.css";

//ICONS
import { BsPinAngleFill, BsPinAngle } from "react-icons/bs";
import { BsThreeDots } from "react-icons/bs";
import { IoPencilSharp } from "react-icons/io5";
import { IoArchiveSharp } from "react-icons/io5";

function Announcements({ isCollapsed }) {
  const navigation = useNavigate();
  const { fetchAnnouncements, announcements } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [isCreateClicked, setCreateClicked] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("All Announcement");
  const [pinnedAnnouncements, setPinnedAnnouncements] = useState([]);
  const [menuVisible, setMenuVisible] = useState(null);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState([]);
  const [sortOption, setSortOption] = useState("Newest");

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleAdd = () => {
    setCreateClicked(true);
  };

  /* FILTER CATEGORY */
  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      selectedCategory === "All Announcement" ||
      announcement.category === selectedCategory
  );

  /* PIN ANNOUNCEMENT */
  const togglePin = (announcement) => {
    if (pinnedAnnouncements.some((a) => a._id === announcement._id)) {
      setPinnedAnnouncements((prev) =>
        prev.filter((a) => a._id !== announcement._id)
      );
    } else {
      setPinnedAnnouncements((prev) => [...prev, announcement]);
    }
  };

  /* ANNOUNCEMENT MENU */
  const toggleMenu = (id) => {
    setMenuVisible(menuVisible === id ? null : id);
  };

  /* EXPANDED ANNOUNCEMENTS */
  const toggleExpanded = (id) => {
    setExpandedAnnouncements((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderContent = (announcement) => {
    const words = announcement.content.split(" ");
    const isLong = words.length > 25;
    const isExpanded = expandedAnnouncements.includes(announcement._id);
    const displayText = isExpanded
      ? announcement.content
      : words.slice(0, 25).join(" ") + (isLong ? "..." : "");

    return (
      <div className="text-sm font-normal mt-4">
        {displayText}
        {isLong && (
          <span
            className="text-blue-500 cursor-pointer ml-1"
            onClick={() => toggleExpanded(announcement._id)}
          >
            {isExpanded ? "See less" : "See more"}
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Announcements</div>

        <div className="flex flex-col lg:flex-row mt-4 gap-4">
          {/* LEFT - CATEGORY */}
          <div className="announcement-category-panel ">
            <label className="announcement-subheader">Category</label>
            <div className="announcement-left-container">
              {[
                "All Announcement",
                "General",
                "Public Safety & Emergency",
                "Health & Sanitation",
                "Social Services",
                "Infrastructure",
                "Education & Youth",
              ].map((cat) => (
                <div
                  key={cat}
                  className={`cursor-pointer p-2 ${
                    selectedCategory === cat ? "font-bold" : ""
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          {/* CENTER - ANNOUNCEMENTS */}
          <div className="w-full lg:w-2/5 p-4">
            {/* CREATE ANNOUNCEMENT */}
            <div className="announcement-create">
              <img
                src={user.picture}
                alt="Profile"
                className="announcement-profile-img"
              />
              <button
                onClick={handleAdd}
                className="announcement-create-button"
              >
                <label className="ml-3">Create Announcement</label>
              </button>
            </div>

            {/* SORT OPTIONS - NEWEST, LATEST */}
            <div className="announcement-sort-options">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-sm font-semibold w-full h-full rounded-md"
              >
                <option value="Newest">Newest</option>
                <option value="Latest">Latest</option>
              </select>
            </div>

            {/* ALL ANNOUNCEMENTS */}
            {filteredAnnouncements
              .filter((a) => !pinnedAnnouncements.find((p) => p._id === a._id))
              .map((announcement) => (
                <div key={announcement._id} className="announcement-card ">
                  <div className="absolute top-2 right-2 flex flex-col sm:flex-row gap-2">
                    <label className="text-sm text-gray-500">2 mins ago</label>
                    <div>
                      <button
                        onClick={() => togglePin(announcement)}
                        className="mr-2"
                      >
                        <BsPinAngle />
                      </button>
                      <button onClick={() => toggleMenu(announcement._id)}>
                        <BsThreeDots />
                      </button>
                    </div>

                    {/* MENU */}
                    {menuVisible === announcement._id && (
                      <div className="announcement-menu">
                        <ul className="w-full">
                          <div className="navbar-dropdown-item justify-start">
                            <IoPencilSharp className="ml-2" />
                            <li className="text-sm font-semibold">Edit</li>
                          </div>
                          <div className="navbar-dropdown-item justify-start">
                            <IoArchiveSharp className="text-red-600 ml-2" />
                            <li className="text-sm font-semibold text-red-600">
                              Archive
                            </li>
                          </div>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* UPLOADED BY - DETAILS */}
                  <div className="flex items-center mb-4">
                    <img
                      src={
                        announcement.uploadedby?.resID?.profilePicture ||
                        user.picture
                      }
                      alt="Profile"
                      className="announcement-profile-img"
                    />
                    <div className="flex flex-col">
                      <label className="font-semibold text-base">
                        {announcement.uploadedby?.resID?.firstname}{" "}
                        {announcement.uploadedby?.resID?.lastname}
                      </label>
                      <label className="text-sm text-gray-500">
                        {announcement.uploadedby?.position}
                      </label>
                    </div>
                  </div>

                  {/* CATEGORY, TITLE */}
                  <div>
                    <label className="announcement-info-label">
                      Category:{" "}
                    </label>
                    <label className="announcement-info-value ">
                      {announcement.category}
                    </label>
                  </div>
                  <div>
                    <label className="announcement-info-label">Title: </label>
                    <label className="announcement-info-value ">
                      {announcement.title}
                    </label>
                  </div>

                  {/* CONTENT */}
                  {renderContent(announcement)}

                  {/* ATTACHMENT */}
                  {announcement.picture &&
                    announcement.picture.trim() !== "" && (
                      <img
                        src={announcement.picture}
                        alt="Attachment"
                        className="w-full mt-4 rounded-md"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    )}
                </div>
              ))}
          </div>

          {/* RIGHT - PINNED ANNOUNCEMENTS */}
          <div className="announcement-pinned-panel ">
            <label className="announcement-subheader">
              Pinned Announcements
            </label>

            {/* ALL PINNED ANNOUNCEMENTS */}
            {pinnedAnnouncements.map((announcement) => (
              <div key={announcement._id} className="announcement-card">
                <div className="absolute top-2 right-2 flex flex-col sm:flex-row gap-2">
                  <label className="text-sm text-gray-500">2 mins ago</label>
                  <div>
                    <button
                      onClick={() => togglePin(announcement)}
                      className="mr-2"
                    >
                      <BsPinAngle />
                    </button>
                    <button onClick={() => toggleMenu(announcement._id)}>
                      <BsThreeDots />
                    </button>
                  </div>

                  {/* MENU */}
                  {menuVisible === announcement._id && (
                    <div className="announcement-menu">
                      <ul className="w-full">
                        <div className="navbar-dropdown-item justify-start">
                          <IoPencilSharp className="ml-2" />
                          <li className="text-sm font-semibold">Edit</li>
                        </div>
                        <div className="navbar-dropdown-item justify-start">
                          <IoArchiveSharp className="text-red-600 ml-2" />
                          <li className="text-sm font-semibold text-red-600">
                            Archive
                          </li>
                        </div>
                      </ul>
                    </div>
                  )}
                </div>

                {/* UPLOADED BY - DETAILS */}
                <div className="flex items-center mb-4">
                  <img
                    src={
                      announcement.uploadedby?.resID?.profilePicture ||
                      user.picture
                    }
                    alt="Profile"
                    className="announcement-profile-img"
                  />
                  <div className="flex flex-col">
                    <label className="font-semibold text-base">
                      {announcement.uploadedby?.resID?.firstname}{" "}
                      {announcement.uploadedby?.resID?.lastname}
                    </label>
                    <label className="text-sm text-gray-500">
                      {announcement.uploadedby?.position}
                    </label>
                  </div>
                </div>

                {/* CATEGORY, TITLE */}

                <div>
                  <label className="announcement-info-label">Category: </label>
                  <label className="announcement-info-value ">
                    {announcement.category}
                  </label>
                </div>
                <div>
                  <label className="announcement-info-label">Title: </label>
                  <label className="announcement-info-value ">
                    {announcement.title}
                  </label>
                </div>

                {/* CONTENT */}
                {renderContent(announcement)}

                {/* ATTACHMENT */}
                {announcement.picture && announcement.picture.trim() !== "" && (
                  <img
                    src={announcement.picture}
                    alt="Attachment"
                    className="w-full mt-4 rounded-md"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {isCreateClicked && (
        <CreateAnnouncement onClose={() => setCreateClicked(false)} />
      )}
    </>
  );
}

export default Announcements;
