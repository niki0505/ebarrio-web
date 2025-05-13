import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import "../App.css";
import { InfoContext } from "../context/InfoContext";
import { IoClose } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../api";

function CourtReject({ onClose, reservationID }) {
  const [remarks, setRemarks] = useState("");
  const [showModal, setShowModal] = useState(true);

  const handleSubmit = async () => {
    try {
      await api.put(`/rejectcourtreservation/${reservationID}`, { remarks });
      alert("Court reservation request successfully rejected!");
      onClose();
    } catch (error) {
      console.log("Error rejecting court reservation request");
    }
  };
  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  return (
    <>
      {setShowModal && (
        <div className="modal-container">
          <div className="modal-content w-[20rem] h-[25rem] ">
            <div className="modal-title-bar bg-navy-blue">
              <h1 className="modal-title">Reject Court Reservation Request</h1>
              <button className="modal-btn-close">
                <IoClose className="btn-close-icon" onClick={handleClose} />
              </button>
            </div>
            <textarea
              placeholder="Enter your reason here..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={5}
              minLength={20}
              maxLength={255}
              className="w-full h-full border border-btn-color-gray rounded-md mt-10 text-justify p-2 font-subTitle font-semibold"
            ></textarea>
            <div style={{ fontSize: "12px", color: "gray", marginTop: "5px" }}>
              {remarks.length}/255
            </div>
            <button
              onClick={handleSubmit}
              type="submit"
              className="actions-btn bg-btn-color-blue"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default CourtReject;
