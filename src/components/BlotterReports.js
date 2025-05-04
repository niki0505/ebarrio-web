import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import { useConfirm } from "../context/ConfirmContext";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import ViewBlotter from "./ViewBlotter";

function BlotterReports({ isCollapsed }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { fetchBlotterReports, blotterreports } = useContext(InfoContext);
  const [filteredBlotterReports, setFilteredBlotterReports] = useState([]);
  const [isBlotterClicked, setBlotterClicked] = useState(false);
  const [selectedBlotter, setSelectedBlotter] = useState(null);

  const [isPendingClicked, setPendingClicked] = useState(true);
  const [isScheduledClicked, setScheduledClicked] = useState(false);
  const [isSettledClicked, setSettledClicked] = useState(false);
  const [isRejectedClicked, setRejectedClicked] = useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBlotterReports();
  }, []);

  const handleAdd = () => {
    navigation("/create-blotter");
  };

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z\s.]/g, "");
    const formattedText = sanitizedText
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    setSearch(formattedText);
  };

  const handleRowClick = (blotterID) => {
    setBlotterClicked(true);
    setSelectedBlotter(blotterID);
  };

  useEffect(() => {
    let filtered = blotterreports;

    if (isPendingClicked) {
      filtered = blotterreports.filter((blot) => blot.status === "Pending");
    } else if (isScheduledClicked) {
      filtered = blotterreports.filter((blot) => blot.status === "Scheduled");
    } else if (isSettledClicked) {
      filtered = blotterreports.filter((blot) => blot.status === "Settled");
    } else if (isRejectedClicked) {
      filtered = blotterreports.filter((blot) => blot.status === "Rejected");
    }

    if (search) {
      filtered = blotterreports.filter((blot) => {
        const first = blot.complainantID?.firstname || "";
        const middle = blot.complainantID?.middlename || "";
        const last = blot.complainantID?.lastname || "";
        const complainantname = blot.complainantname || "";

        const fullName =
          first || middle || last
            ? `${first} ${middle} ${last}`.trim()
            : complainantname;

        return fullName.includes(search);
      });
    }
    setFilteredBlotterReports(filtered);
  }, [
    search,
    blotterreports,
    isPendingClicked,
    isScheduledClicked,
    isSettledClicked,
    isRejectedClicked,
  ]);

  const handleMenu1 = () => {
    setPendingClicked(true);
    setScheduledClicked(false);
    setSettledClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu2 = () => {
    setScheduledClicked(true);
    setPendingClicked(false);
    setSettledClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu3 = () => {
    setSettledClicked(true);
    setScheduledClicked(false);
    setPendingClicked(false);
    setRejectedClicked(false);
  };

  const handleMenu4 = () => {
    setRejectedClicked(true);
    setSettledClicked(false);
    setScheduledClicked(false);
    setPendingClicked(false);
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Blotter Reports</div>

        <SearchBar searchValue={search} handleSearch={handleSearch} />

        <p onClick={handleMenu1} style={{ cursor: "pointer" }}>
          Pending
        </p>
        <p onClick={handleMenu2} style={{ cursor: "pointer" }}>
          Scheduled
        </p>
        <p onClick={handleMenu3} style={{ cursor: "pointer" }}>
          Settled
        </p>
        <p onClick={handleMenu4} style={{ cursor: "pointer" }}>
          Rejected
        </p>
        <button className="add-btn" onClick={handleAdd}>
          <MdPersonAddAlt1 className=" text-xl" />
          <span className="font-bold">Add new blotter</span>
        </button>
        <table>
          <thead>
            <tr>
              <th>Blotter No.</th>
              <th>Complainant</th>
              <th>Subject of the Complaint</th>
              <th>Incident Type</th>
              {isPendingClicked && <th>Date Submitted</th>}
              {isScheduledClicked && <th>Date Scheduled</th>}
              {isSettledClicked && <th>Date Settled</th>}
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredBlotterReports.length === 0 ? (
              <tr className="bg-white">
                <td colSpan={5} className="text-center p-2">
                  No results found
                </td>
              </tr>
            ) : (
              filteredBlotterReports.map((blot) => {
                return (
                  <tr
                    key={blot._id}
                    onClick={() => handleRowClick(blot._id)}
                    className="border-t"
                    style={{
                      cursor: "pointer",
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f0f0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                    }}
                  >
                    <td className="p-2">{blot.blotterno}</td>
                    <td className="p-2">
                      {blot.complainantID
                        ? `${blot.complainantID.lastname} ${
                            blot.complainantID.firstname
                          } ${blot.complainantID.middlename || ""}`.trim()
                        : blot.complainantname}
                    </td>
                    <td className="p-2">
                      {blot.subjectID
                        ? `${blot.subjectID.lastname} ${
                            blot.subjectID.firstname
                          } ${blot.subjectID.middlename || ""}`.trim()
                        : blot.subjectname}
                    </td>
                    <td className="p-2">{blot.type}</td>
                    {isPendingClicked && (
                      <td className="p-2">{blot.createdAt.split(" at ")[0]}</td>
                    )}
                    {isScheduledClicked && (
                      <td className="p-2">
                        {blot.starttime?.split(" at ")[0]},{" "}
                        {blot.starttime?.split(" at ")[1]} -{" "}
                        {blot.endtime?.split(" at ")[1]}
                      </td>
                    )}
                    {isSettledClicked && (
                      <td className="p-2">{blot.updatedAt.split(" at ")[0]}</td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {isBlotterClicked && (
          <ViewBlotter
            onClose={() => setBlotterClicked(false)}
            blotterID={selectedBlotter}
          />
        )}
      </main>
    </>
  );
}

export default BlotterReports;
