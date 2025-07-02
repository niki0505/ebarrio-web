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
  const [mobileNumError, setMobileNumError] = useState("");

  const handleSubmit = async () => {
    let hasErrors = false;
    if (contactNumber === "+63") {
      setMobileNumError("Invalid mobile number.");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }
    try {
      const isConfirmed = await confirm(
        "Are you sure you want to create a new contact?",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }
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

  const smartCapitalize = (word) => {
    if (word === word.toUpperCase()) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  const lettersAndSpaceOnly = (e) => {
    const { name, value } = e.target;
    const filtered = value.replace(/[^a-zA-Z\s.'-]/g, "");

    const capitalized = filtered
      .split(" ")
      .map((word) => smartCapitalize(word))
      .join(" ");

    setName(capitalized);
  };

  const mobileInputChange = (e) => {
    let { name, value } = e.target;
    value = value.replace(/\D/g, "");

    if (!value.startsWith("+63")) {
      value = "+63" + value.replace(/^0+/, "").slice(2);
    }
    if (value.length > 13) {
      value = value.slice(0, 13);
    }
    if (value.length >= 4 && value[3] === "0") {
      return;
    }

    setContactNumber(value);

    if (name === "contactnumber") {
      if (value.length >= 13) {
        setMobileNumError(null);
      } else {
        setMobileNumError("Invalid mobile number.");
      }
    }
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
                    onChange={lettersAndSpaceOnly}
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
                  {mobileNumError ? (
                    <label className="text-red-500 font-semibold font-subTitle text-[14px]">
                      {mobileNumError}
                    </label>
                  ) : null}
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
