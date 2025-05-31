import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/CommonStyle.css";
import { InfoContext } from "../context/InfoContext";
import { AuthContext } from "../context/AuthContext";
import CreateAnnouncement from "./CreateAnnouncement";
import { useConfirm } from "../context/ConfirmContext";
import api from "../api";
import "../Stylesheets/Announcements.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import EditAnnouncement from "./EditAnnouncement";

//ICONS
import { BsPinAngleFill, BsPinAngle, BsThreeDots } from "react-icons/bs";
import { IoArchiveSharp } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";

function Announcements({ isCollapsed }) {
  dayjs.extend(relativeTime);
  const confirm = useConfirm();
  const { fetchAnnouncements, announcements } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [isEditClicked, setEditClicked] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All Announcement");
  const [pinnedAnnouncements, setPinnedAnnouncements] = useState([]);
  const [menuVisible, setMenuVisible] = useState(null);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState([]);
  const [sortOption, setSortOption] = useState("Newest");
  const menuRef = useRef(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    setPinnedAnnouncements(
      announcements.filter((announcement) => announcement.status === "Pinned")
    );
  }, [announcements]);

  const handleAdd = () => {
    setCreateClicked(true);
  };

  const handleEdit = (announcementID) => {
    setEditClicked(true);
    setSelectedAnnouncement(announcementID);
  };

  /* FILTER CATEGORY */
  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      selectedCategory === "All Announcement" ||
      announcement.category === selectedCategory
  );

  /* SORTED ANNOUNCEMENTS */
  let sortedAnnouncements;
  if (sortOption === "Newest") {
    sortedAnnouncements = [...filteredAnnouncements].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } else if (sortOption === "Oldest") {
    sortedAnnouncements = [...filteredAnnouncements].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  } else if (sortOption === "Archived") {
    sortedAnnouncements = filteredAnnouncements.filter(
      (item) => item.status === "Archived"
    );
  }

  /* PIN ANNOUNCEMENT */
  const togglePin = async (announcementID) => {
    try {
      await api.put(`/pinannouncement/${announcementID}`);
    } catch (error) {
      console.log("Error pinning announcement", error);
    }
  };

  /* UNPIN ANNOUNCEMENT */
  const toggleUnpin = async (announcementID) => {
    try {
      await api.put(`/unpinannouncement/${announcementID}`);
    } catch (error) {
      console.log("Error pinning announcement", error);
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
      <div className="text-sm font-medium mt-4 font-subTitle whitespace-pre-wrap">
        {announcement.eventdetails && (
          <>
            {announcement.eventdetails}
            <br />
          </>
        )}

        {displayText}
        {isLong && (
          <span
            className="text-blue-500 cursor-pointer ml-1 font-bold"
            onClick={() => toggleExpanded(announcement._id)}
          >
            {isExpanded ? "See less" : "See more"}
          </span>
        )}
      </div>
    );
  };

  const handleArchive = async (announcementID) => {
    const isConfirmed = await confirm(
      "Are you sure you want to archive this announcement?",
      "confirmred"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.put(`/archiveannouncement/${announcementID}`);
      alert("The announcement has been successfully archived.");
    } catch (error) {
      console.log("Error in archiving announcement", error);
    }
  };

  const handleRecover = async (announcementID) => {
    const isConfirmed = await confirm(
      "Are you sure you want to recover this announcement?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.put(`/recoverannouncement/${announcementID}`);
      alert("The announcement has been successfully recovered.");
    } catch (error) {
      console.log("Error in recovering announcement", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuVisible
      ) {
        setMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuVisible]);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Announcements</div>

        <div className="announcement-container">
          {/* LEFT - CATEGORY */}
          <div className="announcement-category-panel ">
            <label className="announcement-subheader">Category</label>
            <div className="announcement-left-container font-subTitle font-medium text-[#5A5A5A]">
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
                  className={`cursor-pointer px-3 py-2 ${
                    selectedCategory === cat ? "text-navy-blue font-bold" : ""
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-2/5 p-4">
            {(user.role === "Secretary" || user.role === "Clerk") && (
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
                  <label className="ml-3 font-subTitle text-[#808080] font-semibold text-[16px]">
                    Create Announcement
                  </label>
                </button>
              </div>
            )}

            {/* SORT OPTIONS - NEWEST, LATEST */}

            <div className="announcement-sort-container">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="announcement-sort-dropdown"
              >
                <option value="Newest">Newest</option>
                <option value="Oldest">Oldest</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* ALL ANNOUNCEMENTS */}
            {sortedAnnouncements
              .filter((announcement) =>
                sortOption === "Archived"
                  ? announcement.status === "Archived"
                  : announcement.status === "Not Pinned"
              )
              .map((announcement) => (
                <div key={announcement._id} className="announcement-card">
                  <div className="announcement-pin-date-menu">
                    <h1 className="text-[#808080] text-xs font-medium font-subTitle">
                      {dayjs(announcement.createdAt).fromNow()}
                    </h1>

                    <div>
                      {(user.role === "Secretary" || user.role === "Clerk") &&
                        sortOption !== "Archived" && (
                          <button
                            onClick={() => togglePin(announcement._id)}
                            className="mr-1"
                          >
                            <BsPinAngle />
                          </button>
                        )}

                      {(user.role === "Secretary" ||
                        announcement.uploadedby._id === user.empID) && (
                        <button
                          onClick={() => toggleMenu(announcement._id)}
                          className="mr-1"
                        >
                          <BsThreeDots />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* MENU */}
                  {menuVisible === announcement._id && (
                    <div className="announcement-menu" ref={menuRef}>
                      <ul className="w-full">
                        {sortOption === "Archived" ? (
                          <div
                            className="navbar-dropdown-item justify-start"
                            onClick={() => handleRecover(announcement._id)}
                          >
                            <FaEdit className="ml-2" />
                            <li className="text-sm font-semibold ml-2 font-subTitle">
                              Recover
                            </li>
                          </div>
                        ) : (
                          <>
                            <div
                              className="navbar-dropdown-item justify-start"
                              onClick={() => handleEdit(announcement._id)}
                            >
                              <FaEdit className="ml-2" />
                              <li className="text-sm font-semibold ml-2 font-subTitle">
                                Edit
                              </li>
                            </div>
                            <div
                              className="navbar-dropdown-item justify-start"
                              onClick={() => handleArchive(announcement._id)}
                            >
                              <IoArchiveSharp className="text-red-600 ml-2" />
                              <li className="text-sm font-semibold text-red-600 ml-2 font-subTitle">
                                Archive
                              </li>
                            </div>
                          </>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* UPLOADED BY - DETAILS */}
                  <div className="flex items-center mb-4">
                    <img
                      src={announcement.uploadedby?.resID?.picture}
                      alt="Profile"
                      className="announcement-profile-img"
                    />
                    <div className="flex flex-col">
                      <label className="font-semibold text-base">
                        {announcement.uploadedby?.resID?.firstname}{" "}
                        {announcement.uploadedby?.resID?.lastname}
                      </label>
                      <label className="text-sm text-[#808080] font-medium font-subTitle">
                        {announcement.uploadedby?.position}
                      </label>
                    </div>
                  </div>

                  {/* CATEGORY, TITLE */}
                  <div>
                    <label className="announcement-info-label">
                      Category:{" "}
                    </label>
                    <label className="announcement-info-value">
                      {announcement.category}
                    </label>
                  </div>
                  <div>
                    <label className="announcement-info-label">Title: </label>
                    <label className="announcement-info-value">
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

                  <div className="flex flex-row items-center gap-1 mt-2">
                    <FaHeart className="announcement-heart" />
                    <h3 className="announcement-info-value">
                      {announcement.hearts}
                    </h3>
                  </div>
                </div>
              ))}
          </div>

          {/* RIGHT - PINNED ANNOUNCEMENTS */}
          <div className="announcement-pinned-panel ">
            <h1 className="font-bold mb-2">Pinned Announcements</h1>

            {/* ALL PINNED ANNOUNCEMENTS */}
            {pinnedAnnouncements.map((announcement) => (
              <div key={announcement._id} className="announcement-card">
                <div className="announcement-pin-date-menu">
                  <h1 className="text-[#808080] text-xs font-medium font-subTitle">
                    {dayjs(announcement.createdAt).fromNow()}
                  </h1>
                  <div>
                    {(user.role === "Secretary" || user.role === "Clerk") && (
                      <button
                        onClick={() => toggleUnpin(announcement._id)}
                        className="mr-1"
                      >
                        <BsPinAngleFill />
                      </button>
                    )}
                    {(user.role === "Secretary" ||
                      announcement.uploadedby?._id === user.empID) && (
                      <button
                        onClick={() => toggleMenu(announcement._id)}
                        className="mr-1"
                      >
                        <BsThreeDots />
                      </button>
                    )}
                  </div>

                  {/* MENU */}
                  {menuVisible === announcement._id && (
                    <div className="announcement-menu" ref={menuRef}>
                      <ul className="w-full">
                        <div className="navbar-dropdown-item justify-start">
                          <FaEdit className="ml-2" />
                          <li className="text-sm font-semibold ml-2 font-subTitle">
                            Edit
                          </li>
                        </div>
                        <div
                          className="navbar-dropdown-item justify-start"
                          onClick={handleArchive}
                        >
                          <IoArchiveSharp className="text-red-600 ml-2" />
                          <li className="text-sm font-semibold text-red-600 ml-2 font-subTitle">
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
                    src={announcement.uploadedby?.resID?.picture}
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
                  <label className="announcement-info-value">
                    {announcement.category}
                  </label>
                </div>
                <div>
                  <label className="announcement-info-label">Title: </label>
                  <label className="announcement-info-value">
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

                <div className="flex flex-row items-center gap-1 mt-2">
                  <FaHeart className="announcement-heart" />
                  <h3 className="announcement-info-value">
                    {announcement.hearts}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {isCreateClicked && (
        <CreateAnnouncement onClose={() => setCreateClicked(false)} />
      )}

      {isEditClicked && (
        <EditAnnouncement
          onClose={() => setEditClicked(false)}
          announcementID={selectedAnnouncement}
        />
      )}
    </>
  );
}

export default Announcements;
