import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { InfoContext } from "../context/InfoContext";
import { useConfirm } from "../context/ConfirmContext";
import api from "../api";

//STYLES
import "../App.css";

//ICONS
import { IoClose } from "react-icons/io5";

function CourtReject({ onClose, reservationID }) {
  const [remarks, setRemarks] = useState("");
  const [showModal, setShowModal] = useState(true);
    const confirm = useConfirm();

  const handleSubmit = async () => {
    try {
      await api.put(`/rejectcourtreservation/${reservationID}`, { remarks });
      confirm("Court reservation request successfully rejected", "success");
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
          <div className="modal-content w-[30rem] h-[22rem] ">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">
                    Reject Court Reservation Request
                  </h1>
                  <IoClose
                    onClick={handleClose}
                    class="dialog-title-bar-icon"
                  ></IoClose>
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            <div className="modal-form-container">
              <div className="modal-form">
                <textarea
                  placeholder="Enter your reason here..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={5}
                  minLength={20}
                  maxLength={255}
                  className="h-[11rem] textarea-container"
                ></textarea>
                <div className="textarea-length-text">{remarks.length}/255</div>
                <div className="flex justify-center">
                  <button
                    onClick={handleSubmit}
                    type="submit"
                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CourtReject;
