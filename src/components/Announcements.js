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

function Announcements({ isCollapsed }) {
  const navigation = useNavigate();
  const { fetchEmergencyHotlines, emergencyhotlines } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [isCreateClicked, setCreateClicked] = useState(false);

  useEffect(() => {
    fetchEmergencyHotlines();
  }, [fetchEmergencyHotlines]);

  const handleAdd = () => {
    setCreateClicked(true);
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Announcements</div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <img
            src={user.picture}
            alt="Profile"
            className="navbar-profile-img"
          />
          <button onClick={handleAdd} style={{ border: "1px solid gray" }}>
            Create Announcement
          </button>
        </div>
      </main>
      {isCreateClicked && (
        <CreateAnnouncement onClose={() => setCreateClicked(false)} />
      )}
    </>
  );
}

export default Announcements;
