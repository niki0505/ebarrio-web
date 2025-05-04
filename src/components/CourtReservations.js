import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
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

function CourtReservations({ isCollapsed }) {
  const confirm = useConfirm();
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
        (court) => court.status === "Rejected"
      );
    }
    if (search) {
      filtered = courtreservations.filter((court) => {
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

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Court Reservations</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />

        <p onClick={handleMenu1} style={{ cursor: "pointer" }}>
          Pending
        </p>
        <p onClick={handleMenu2} style={{ cursor: "pointer" }}>
          Approved
        </p>
        <p onClick={handleMenu3} style={{ cursor: "pointer" }}>
          Rejected
        </p>
        <button className="add-btn" onClick={handleAdd}>
          <MdPersonAddAlt1 className=" text-xl" />
          <span className="font-bold">Add new reservation</span>
        </button>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Purpose</th>
              <th>Date & Time</th>
              <th>Amount</th>
              <th>Status</th>
              {isRejectedClicked && <th>Remarks</th>}
              {isPendingClicked && <th>Action</th>}
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredReservations.length === 0 ? (
              <tr className="bg-white">
                <td
                  colSpan={isApprovedClicked ? 5 : 6}
                  className="text-center p-2"
                >
                  No results found
                </td>
              </tr>
            ) : (
              filteredReservations.map((court) => {
                const formattedDatetime = formatDateRange(
                  court.starttime,
                  court.endtime
                );

                return (
                  <tr key={court.resID._id} className="border-t">
                    <td className="p-2">
                      {court.resID.middlename
                        ? `${court.resID.lastname} ${court.resID.middlename} ${court.resID.firstname}`
                        : `${court.resID.lastname} ${court.resID.firstname}`}
                    </td>
                    <td className="p-2">{court.purpose}</td>
                    <td className="p-2">{formattedDatetime}</td>
                    <td className="p-2">{court.amount}</td>
                    <td className="p-2">{court.status}</td>
                    {isPendingClicked && court.status == "Pending" && (
                      <td>
                        <>
                          <button
                            className="actions-btn bg-btn-color-blue"
                            type="button"
                            onClick={(e) => approveBtn(e, court._id)}
                          >
                            APPROVE
                          </button>
                          <button
                            className="actions-btn bg-btn-color-red"
                            type="button"
                            onClick={(e) => rejectBtn(e, court._id)}
                          >
                            REJECT
                          </button>
                        </>
                      </td>
                    )}
                    {isRejectedClicked && court.status == "Rejected" && (
                      <td>{court.remarks}</td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
