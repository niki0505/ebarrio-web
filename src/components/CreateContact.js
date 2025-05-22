import { useEffect, useRef, useState, useContext } from "react";
import "../App.css";
import { IoClose } from "react-icons/io5";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

function CreateContact({ onClose }) {
  const confirm = useConfirm();
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [showModal, setShowModal] = useState(true);

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to create a new contact?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    onClose();
    try {
      const response = await api.post("/createemergencyhotlines", {
        name,
        contactNumber,
      });
      alert("Emergency contact successfully created!");
    } catch (error) {
      console.log("Error creating emergency contact", error);
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
          <div className="modal-content h-[15rem] w-[30rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Add New Contact</h1>
                  <IoClose
                    onClick={handleClose}
                    class="dialog-title-bar-icon"
                  ></IoClose>
                </div>
                <hr className="dialog-line" />
              </div>
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

export default CreateContact;
