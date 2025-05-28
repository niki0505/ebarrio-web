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
import { MdArrowDropDown } from "react-icons/md";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

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

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
      filtered = filtered.filter((blot) => {
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

  //For Pagination
  const parseDate = (dateStr) => new Date(dateStr.replace(" at ", " "));

  const sortedFilteredReports = [...filteredBlotterReports].sort(
    (a, b) => parseDate(b.updatedAt) - parseDate(a.updatedAt)
  );

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedFilteredReports.slice(
    indexOfFirstRow,
    indexOfLastRow
  );
  const totalRows = filteredBlotterReports.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Blotter Reports</div>

        <SearchBar searchValue={search} handleSearch={handleSearch} />

        <div className="status-add-container">
          <div className="status-container">
            <p
              onClick={handleMenu1}
              className={`status-text ${
                isPendingClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Pending
            </p>
            <p
              onClick={handleMenu2}
              className={`status-text ${
                isScheduledClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Scheduled
            </p>
            <p
              onClick={handleMenu3}
              className={`status-text ${
                isSettledClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Settled
            </p>
            <p
              onClick={handleMenu4}
              className={`status-text ${
                isRejectedClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Rejected
            </p>
          </div>

          <button className="add-container" onClick={handleAdd}>
            <MdPersonAddAlt1 className=" text-xl" />
            <span className="font-bold">Add new blotter</span>
          </button>
        </div>

        <hr className="mt-4 border border-gray-300" />

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
              currentRows.map((blot) => {
                return (
                  <tr
                    key={blot._id}
                    onClick={() => handleRowClick(blot._id)}
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
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-gray-600 pr-1 text-[#0E94D3]">
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
