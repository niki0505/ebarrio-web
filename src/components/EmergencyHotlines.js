import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/CommonStyle.css";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import CreateContact from "./CreateContact";
import EditContact from "./EditContact";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import { useConfirm } from "../context/ConfirmContext";
import api from "../api";

//ICONS
import { FaArchive, FaEdit } from "react-icons/fa";
import { IoArchiveSharp } from "react-icons/io5";
import { MdArrowDropDown } from "react-icons/md";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

function EmergencyHotlines({ isCollapsed }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { fetchEmergencyHotlines, emergencyhotlines } = useContext(InfoContext);
  const [filteredEmergencyHotlines, setFilteredEmergencyHotlines] = useState(
    []
  );
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [isEditClicked, setEditClicked] = useState(false);
  const [selectedEmergencyID, setSelectedEmergencyID] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState({});
  const [search, setSearch] = useState("");

  const [isActiveClicked, setActiveClicked] = useState(true);
  const [isArchivedClicked, setArchivedClicked] = useState(false);

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchEmergencyHotlines();
  }, []);

  const handleAdd = () => {
    setCreateClicked(true);
  };

  const handleArchive = async (emergencyID) => {
    const isConfirmed = await confirm(
      "Are you sure you want to archive this emergency contact?",
      "confirmred"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.put(`/archiveemergencyhotlines/${emergencyID}`);
      alert("Emergency hotline has been successfully archived.");
    } catch (error) {
      console.log("Error archiving emergency contact", error);
    }
  };

  const handleRecover = async (emergencyID) => {
    const isConfirmed = await confirm(
      "Are you sure you want to recover this emergency contact?",
      "confirmred"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.put(`/recoveremergencyhotlines/${emergencyID}`);
      alert("Emergency hotline has been successfully recovered.");
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        console.log("❌ Error status:", response.status);
        alert(response.data.message || "Something went wrong.");
      } else {
        console.log("❌ Network or unknown error:", error.message);
        alert("An unexpected error occurred.");
      }
    }
  };

  const handleEdit = (emergencyID, name, contactnumber) => {
    setEditClicked(true);
    setSelectedEmergencyID(emergencyID);
    setSelectedEmergency({ name: name, contactnumber: contactnumber });
  };

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z\s.]/g, "");
    const formattedText = sanitizedText
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    setSearch(formattedText);
  };

  useEffect(() => {
    let filtered = emergencyhotlines;
    if (isActiveClicked) {
      filtered = emergencyhotlines.filter(
        (emergency) => emergency.status === "Active"
      );
    } else if (isArchivedClicked) {
      filtered = emergencyhotlines.filter(
        (emergency) => emergency.status === "Archived"
      );
    }
    if (search) {
      filtered = filtered.filter((emergency) => {
        return emergency.name.includes(search);
      });
    }
    setFilteredEmergencyHotlines(filtered);
  }, [search, emergencyhotlines, isActiveClicked, isArchivedClicked]);

  const handleMenu1 = () => {
    setActiveClicked(true);
    setArchivedClicked(false);
  };
  const handleMenu2 = () => {
    setArchivedClicked(true);
    setActiveClicked(false);
  };

  //For Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredEmergencyHotlines.slice(
    indexOfFirstRow,
    indexOfLastRow
  );
  const totalRows = filteredEmergencyHotlines.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="text-[30px] font-extrabold font-title text-[#BC0F0F]">
          Emergency Hotlines
        </div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />
        <div className="status-add-container">
          <div className="status-container">
            <p
              onClick={handleMenu1}
              className={`status-text ${
                isActiveClicked
                  ? "border-b-4 border-[#BC0F0F]"
                  : "text-[#808080]"
              }`}
            >
              Active
            </p>
            <p
              onClick={handleMenu2}
              className={`status-text ${
                isArchivedClicked
                  ? "border-b-4 border-[#BC0F0F]"
                  : "text-[#808080]"
              }`}
            >
              Archived
            </p>
          </div>
          {isActiveClicked && (
            <button className="add-container" onClick={handleAdd}>
              <MdPersonAddAlt1 className="text-xl" />
              <span className="font-bold">Add new contact</span>
            </button>
          )}
        </div>
        <hr className="mt-4 border border-gray-300" />

        <table>
          <thead className="bg-[#BC0F0F]">
            <tr>
              <th>Public Service Facilities</th>
              <th>Contact Number</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredEmergencyHotlines.length === 0 ? (
              <tr>
                <td colSpan={3}>No results found</td>
              </tr>
            ) : (
              currentRows.map((emergency) => (
                <tr
                  key={emergency._id}
                  className="border-t transition-colors duration-300 ease-in-out"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                  }}
                >
                  <td>{emergency.name}</td>
                  <td>{emergency.contactnumber}</td>
                  <td className="flex justify-center gap-x-8">
                    {emergency.status === "Active" ? (
                      <>
                        <div className="table-actions-container">
                          <button
                            type="button"
                            className="table-actions-btn"
                            onClick={() =>
                              handleEdit(
                                emergency._id,
                                emergency.name,
                                emergency.contactnumber
                              )
                            }
                          >
                            <FaEdit className="text-lg text-[#06D001]" />
                            <label className="text-xs font-semibold text-[#06D001]">
                              Edit
                            </label>
                          </button>
                        </div>

                        <div className="table-actions-container">
                          <button
                            type="button"
                            className="table-actions-btn"
                            onClick={() => handleArchive(emergency._id)}
                          >
                            <FaArchive className="text-lg text-btn-color-red" />
                            <label className="text-xs font-semibold text-btn-color-red">
                              Archive
                            </label>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="table-actions-container">
                        <button
                          type="button"
                          className="table-actions-btn"
                          onClick={() => handleRecover(emergency._id)}
                        >
                          <FaArchive className="text-lg text-btn-color-red" />
                          <label className="text-xs font-semibold text-btn-color-red">
                            Recover
                          </label>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-end items-center mt-4 text-sm text-gray-700 gap-x-4">
          <div className="flex items-center space-x-1">
            <span>Rows per page:</span>
            <div className="relative w-12">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none w-full border px-1 py-1 pr-5 rounded bg-white text-center text-[#0E94D3]"
              >
                {[5, 10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-gray-600 pr-1">
                <MdArrowDropDown size={18} color={"#0E94D3"} />
              </div>
            </div>
          </div>

          <div>
            {startRow}-{endRow} of {totalRows}
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded"
            >
              <MdKeyboardArrowLeft color={"#0E94D3"} className="text-xl" />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded"
            >
              <MdKeyboardArrowRight color={"#0E94D3"} className="text-xl" />
            </button>
          </div>
        </div>
        {isCreateClicked && (
          <CreateContact onClose={() => setCreateClicked(false)} />
        )}
        {isEditClicked && (
          <EditContact
            onClose={() => setEditClicked(false)}
            emergencyID={selectedEmergencyID}
            emergencyDetails={selectedEmergency}
          />
        )}
      </main>
    </>
  );
}

export default EmergencyHotlines;
