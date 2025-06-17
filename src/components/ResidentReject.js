import { useState } from "react";
import "../App.css";
import { IoClose } from "react-icons/io5";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

function ResidentReject({ onClose, resID }) {
  const confirm = useConfirm();
  const [remarks, setRemarks] = useState("");
  const [showModal, setShowModal] = useState(true);

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to reject this resident profile?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.post(`/rejectresident/${resID}`, { remarks });
      alert("Resident profile has been rejected successfully.");
      onClose();
    } catch (error) {
      console.log("Error rejecting resident profile");
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
          <div className="modal-content w-[30rem] h-[22rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Reject Resident</h1>
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
                  className="w-full h-[11rem] resize-none border border-btn-color-gray rounded-md text-justify font-subTitle font-semibold p-2"
                ></textarea>
                <div
                  style={{ fontSize: "12px", color: "gray", textAlign: "end" }}
                >
                  {remarks.length}/255
                </div>
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

export default ResidentReject;
