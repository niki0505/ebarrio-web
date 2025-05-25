import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import ReactDOM from "react-dom/client";
import { useConfirm } from "../context/ConfirmContext";
import CreateReservation from "./CreateReservation";
import { AuthContext } from "../context/AuthContext";
import CourtReject from "./CourtReject";
import api from "../api";

//ICONS
import { FaCheckCircle } from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";
import { MdArrowDropDown } from "react-icons/md";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

function CourtReservations({ isCollapsed }) {
  const confirm = useConfirm();
  const location = useLocation();
  const { cancelled } = location.state || {};
  const navigation = useNavigate();
  const { fetchReservations, courtreservations } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [search, setSearch] = useState("");
  const [isRejectClicked, setRejectClicked] = useState(false);
  const [selectedReservationID, setSelectedReservationID] = useState(null);

  const [isPendingClicked, setPendingClicked] = useState(true);
  const [isApprovedClicked, setApprovedClicked] = useState(false);
  const [isRejectedClicked, setRejectedClicked] = useState(false);

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (cancelled) {
      setRejectedClicked(true);
      setPendingClicked(false);
      setApprovedClicked(false);
    }
    console.log(cancelled);
  }, [cancelled]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z\s.]/g, "");
    const formattedText = sanitizedText
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    setSearch(formattedText);
  };

  useEffect(() => {
    let filtered = courtreservations;

    if (isPendingClicked) {
      filtered = courtreservations.filter(
        (court) => court.status === "Pending"
      );
    } else if (isApprovedClicked) {
      filtered = courtreservations.filter(
        (court) => court.status === "Approved"
      );
    } else if (isRejectedClicked) {
      filtered = courtreservations.filter(
        (court) => court.status === "Rejected" || court.status === "Cancelled"
      );
    }
    if (search) {
      filtered = filtered.filter((court) => {
        const first = court.resID.firstname || "";
        const middle = court.resID.middlename || "";
        const last = court.resID.lastname || "";

        const fullName = `${first} ${middle} ${last}`.trim();

        return fullName.includes(search);
      });
    }
    setFilteredReservations(filtered);
  }, [
    search,
    courtreservations,
    isPendingClicked,
    isApprovedClicked,
    isRejectedClicked,
  ]);

  const formatDateRange = (startDate, endDate) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    const timeOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    const start = new Date(startDate);
    const end = new Date(endDate);

    const startFormatted = new Intl.DateTimeFormat("en-US", options).format(
      start
    );

    const endFormatted = new Intl.DateTimeFormat("en-US", timeOptions).format(
      end
    );

    return `${startFormatted} - ${endFormatted}`;
  };

  const rejectBtn = (e, reservationID) => {
    e.stopPropagation();
    setRejectClicked(true);
    setSelectedReservationID(reservationID);
  };

  const handleAdd = () => {
    setCreateClicked(true);
  };

  const approveBtn = async (e, reservationID) => {
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Are you sure you want to approve this reservation?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.put(`/approvereservation/${reservationID}`);
      alert("Court reservation successfully approved!");
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleMenu1 = () => {
    setPendingClicked(true);
    setApprovedClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu2 = () => {
    setApprovedClicked(true);
    setPendingClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu3 = () => {
    setRejectedClicked(true);
    setPendingClicked(false);
    setApprovedClicked(false);
  };

  //For Pagination
  const parseDate = (dateStr) => new Date(dateStr.replace(" at ", " "));

  const sortedFilteredCourt = [...filteredReservations].sort(
    (a, b) => parseDate(b.updatedAt) - parseDate(a.updatedAt)
  );
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedFilteredCourt.slice(
    indexOfFirstRow,
    indexOfLastRow
  );
  const totalRows = filteredReservations.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Court Reservations</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />

        <div className="status-add-container">
          <div className="status-container">
            <p
              onClick={handleMenu1}
              className={`status-text ${isPendingClicked ? "status-line" : ""}`}
            >
              Pending
            </p>
            <p
              onClick={handleMenu2}
              className={`status-text ${
                isApprovedClicked ? "status-line" : ""
              }`}
            >
              Approved
            </p>
            <p
              onClick={handleMenu3}
              className={`status-text ${
                isRejectedClicked ? "status-line" : ""
              }`}
            >
              Cancelled/Rejected
            </p>
          </div>
          <button className="add-container" onClick={handleAdd}>
            <MdPersonAddAlt1 className="text-xl" />
            <span className="font-bold">Add new reservation</span>
          </button>
        </div>

        <hr className="mt-4 border border-gray-300" />

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Purpose</th>
              <th>Date & Time</th>
              <th>Amount</th>
              {isRejectedClicked && <th>Remarks</th>}
              {isPendingClicked && <th>Action</th>}
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredReservations.length === 0 ? (
              <tr className="bg-white">
                <td
                  colSpan={isApprovedClicked ? 4 : 5}
                  className="text-center p-2"
                >
                  No results found
                </td>
              </tr>
            ) : (
              currentRows.map((court) => {
                const formattedDatetime = formatDateRange(
                  court.starttime,
                  court.endtime
                );

                return (
                  <tr key={court._id}>
                    <td className="p-2">
                      {court.resID.middlename
                        ? `${court.resID.lastname} ${court.resID.middlename} ${court.resID.firstname}`
                        : `${court.resID.lastname} ${court.resID.firstname}`}
                    </td>
                    <td className="p-2">{court.purpose}</td>
                    <td className="p-2">{formattedDatetime}</td>
                    <td className="p-2">{court.amount}</td>
                    {isPendingClicked && court.status == "Pending" && (
                      <td className="flex justify-center gap-x-8">
                        <>
                          <div className="table-actions-container">
                            <button
                              type="button"
                              onClick={(e) => approveBtn(e, court._id)}
                              className="table-actions-btn"
                            >
                              <FaCheckCircle className="text-lg text-[#06D001]" />
                              <label className="text-xs font-semibold text-[#06D001]">
                                Approve
                              </label>
                            </button>
                          </div>

                          <div className="table-actions-container">
                            <button
                              type="button"
                              onClick={(e) => rejectBtn(e, court._id)}
                              className="table-actions-btn"
                            >
                              <FaCircleXmark className="text-lg text-btn-color-red" />
                              <label className="text-xs font-semibold text-btn-color-red">
                                Reject
                              </label>
                            </button>
                          </div>
                        </>
                      </td>
                    )}
                    {isRejectedClicked &&
                      (court.status == "Rejected" ||
                        court.status == "Cancelled") && (
                        <td>{court.remarks}</td>
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
                className="appearance-none w-full border px-1 py-1 pr-5 rounded bg-white text-center"
              >
                {[5, 10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-gray-600 pr-1">
                <MdArrowDropDown size={18} />
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
              <MdKeyboardArrowLeft className="text-xl text-[#808080]" />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded"
            >
              <MdKeyboardArrowRight className="text-xl text-[#808080]" />
            </button>
          </div>
        </div>
        {isCreateClicked && (
          <CreateReservation onClose={() => setCreateClicked(false)} />
        )}
        {isRejectClicked && (
          <CourtReject
            reservationID={selectedReservationID}
            onClose={() => setRejectClicked(false)}
          />
        )}
      </main>
    </>
  );
}

export default CourtReservations;
