import { useEffect, useRef, useState, useContext } from "react";
import "../App.css";
import { IoClose } from "react-icons/io5";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

function EditContact({ onClose, emergencyID, emergencyDetails }) {
  const confirm = useConfirm();
  const [name, setName] = useState(emergencyDetails.name);
  const [contactNumber, setContactNumber] = useState(
    emergencyDetails.contactnumber
  );
  const [showModal, setShowModal] = useState(true);

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to edit this contact?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    onClose();
    try {
      const response = await api.post(`/editemergencyhotlines/${emergencyID}`, {
        name,
        contactNumber,
      });
      alert("Emergency contact successfully updated!");
    } catch (error) {
      console.log("Error updating emergency contact", error);
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
          <div className="modal-content w-[30rem] h-[15rem] ">
            <div className="modal-title-bar">
              <h1 className="modal-title">Edit Contact</h1>
              <button className="modal-btn-close">
                <IoClose
                  className="modal-btn-close-icon"
                  onClick={handleClose}
                />
              </button>
            </div>

            <form
              className="modal-form-container"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="modal-form">
                <div className="employee-form-group">
                  <label for="resID" className="form-label">
                    Name<label className="text-red-600">*</label>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input h-[30px]"
                  />
                </div>
                <div className="employee-form-group">
                  <label className="form-label">
                    Contact Number<label className="text-red-600">*</label>
                  </label>
                  <input
                    type="text"
                    id="contactnumber"
                    name="contactnumber"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="form-input h-[30px]"
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default EditContact;
