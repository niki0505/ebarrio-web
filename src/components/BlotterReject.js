import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import "../App.css";
import { InfoContext } from "../context/InfoContext";
import { IoClose } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../context/ConfirmContext";

function BlotterReject({ onClose, blotterID, onViewClose }) {
  const navigation = useNavigate();
  const confirm = useConfirm();
  const [remarks, setRemarks] = useState("");
  const [showModal, setShowModal] = useState(true);

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to reject this blotter report?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.put(`/rejectblotter/${blotterID}`, { remarks });
      alert("Blotter is successfully rejected!");
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
            <div className="modal-title-bar">
              <h1 className="modal-title">Reject Blotter Report</h1>
              <button className="modal-btn-close">
                <IoClose
                  className="modal-btn-close-icon"
                  onClick={handleClose}
                />
              </button>
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
                  className="w-full h-[12rem] border border-btn-color-gray rounded-md text-justify font-subTitle font-semibold"
                ></textarea>
                <div
                  style={{ fontSize: "12px", color: "gray", textAlign: "end" }}
                >
                  {remarks.length}/255
                </div>
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
