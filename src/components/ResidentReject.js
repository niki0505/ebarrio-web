import { useState } from "react";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

//STYLES
import "../App.css";

//ICONS
import { IoClose } from "react-icons/io5";

function ResidentReject({ onClose, resID }) {
  const confirm = useConfirm();
  const [remarks, setRemarks] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [errors, setErrors] = useState([]);

  const validateRemarks = (input) => {
    const newErrors = [];

    if (input.length < 10 || input.length > 200) {
      newErrors.push("Remarks must be between 10 and 200 characters.");
    }

    const invalidChars = /[^a-zA-Z0-9,.\s]/;
    if (invalidChars.test(input)) {
      newErrors.push("Use only letters, numbers, commas, and periods.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateRemarks(remarks)) return;

    const isConfirmed = await confirm(
      "Are you sure you want to reject this resident profile?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.post(`/rejectresident/${resID}`, { remarks });
      confirm(
        "The residency application has been successfully rejected.",
        "success"
      );
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
                  onChange={(e) => {
                    const input = e.target.value;
                    setRemarks(input);
                    validateRemarks(input);
                  }}
                  rows={5}
                  minLength={20}
                  maxLength={255}
                  className="h-[11rem] textarea-container"
                ></textarea>
                <div className="textarea-length-text">{remarks.length}/255</div>

                {errors.length > 0 && (
                  <div className="text-[12px] text-red-600 mt-2">
                    {errors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}

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
