import { useEffect, useRef, useState, useContext } from "react";
import "../App.css";
import { IoClose } from "react-icons/io5";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

function CreateContact({ onClose }) {
  const confirm = useConfirm();
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("+63");
  const [showModal, setShowModal] = useState(true);

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to create a new contact?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      let formattedNumber = contactNumber;
      formattedNumber = "0" + contactNumber.slice(3);
      await api.post("/createemergencyhotlines", {
        name,
        contactNumber: formattedNumber,
      });
      alert("Emergency contact successfully created!");
      onClose();
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        console.log("❌ Error status:", response.status);
        alert(response.data.message || "Something went wrong.");
      } else {
        console.log("❌ Network or unknown error:", error.message);
        alert("An unexpected error occurred.");
      }
    }
  };
  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const mobileInputChange = (e) => {
    let input = e.target.value;
    input = input.replace(/\D/g, "");

    if (!input.startsWith("+63")) {
      input = "+63" + input.replace(/^0+/, "").slice(2);
    }
    if (input.length > 13) {
      input = input.slice(0, 13);
    }
    if (input.length >= 4 && input[3] === "0") {
      return;
    }

    setContactNumber(input);
  };

  return (
    <>
      {setShowModal && (
        <div className="modal-container">
          <div className="modal-content h-[16rem] w-[30rem]">
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
                    required
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
                    onChange={(e) => mobileInputChange(e)}
                    className="form-input h-[30px]"
                    required
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
