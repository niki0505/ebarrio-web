import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { InfoContext } from "../context/InfoContext";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../context/ConfirmContext";

//STYLES
import "../App.css";

//ICONS
import { IoClose } from "react-icons/io5";

function BlotterReject({ onClose, blotterID, onViewClose }) {
  const navigation = useNavigate();
  const confirm = useConfirm();
  const [remarks, setRemarks] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [error, setError] = useState([]);

  const validateRemarks = (text) => {
    const errors = [];

    if (text.length < 10 || text.length > 200) {
      errors.push("Remarks must be between 10 and 200 characters.");
    }

    const invalidChars = /[^a-zA-Z0-9,.\s]/;
    if (invalidChars.test(text)) {
      errors.push("Use only letters, numbers, commas, and periods.");
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateRemarks(remarks);
    setError(validationErrors);

    if (validationErrors.length > 0) {
      return; 
    }
    
    const isConfirmed = await confirm(
      "Are you sure you want to reject this blotter report?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.put(`/rejectblotter/${blotterID}`, { remarks });
      confirm("The blotter report has been successfully rejected.", "success");
      onClose();
      onViewClose();
    } catch (error) {
      console.log("Error rejecting blotter");
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
          <div className="modal-content w-[30rem] h-[20rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Reject Blotter Report</h1>
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setRemarks(value);
                    setError(validateRemarks(value));
                  }}
                  rows={5}
                  minLength={20}
                  maxLength={255}
                  className="h-[9rem] textarea-container"
                ></textarea>
                <div className="textarea-length-text">{remarks.length}/255</div>
                {error.length > 0 && (
                  <div className="text-red-500 text-sm mt-1 space-y-1">
                    {error.map((err, index) => (
                      <p key={index}>{err}</p>
                    ))}
                  </div>
                )}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="actions-btn bg-btn-color-blue"
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

export default BlotterReject;
