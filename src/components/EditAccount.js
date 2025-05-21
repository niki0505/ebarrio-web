import { useEffect, useRef, useState, useContext } from "react";
import "../App.css";
import { IoClose } from "react-icons/io5";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";
import { FaEyeSlash } from "react-icons/fa";

function EditAccount({ onClose, userID, userUsername }) {
  const confirm = useConfirm();
  const [userForm, setUserForm] = useState({
    username: userUsername,
    password: "",
  });
  const [showModal, setShowModal] = useState(true);

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to edit this user?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    if (userForm.username === userUsername && userForm.password === "") {
      alert("No changes detected");
      return;
    }

    try {
      if (userForm.username === userUsername) {
        delete userForm.username;
      }
      if (userForm.password === "") {
        delete userForm.password;
      }
      console.log(userForm);
      await api.put(`/edituser/${userID}`, { userForm });
      alert("User updated successfully");
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

  const generatePassword = () => {
    const characters = "0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      const randomChar = characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      password += randomChar;
    }

    setUserForm((prev) => ({
      ...prev,
      password: password,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
                    Username<label className="text-red-600">*</label>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={userForm.username}
                    onChange={handleInputChange}
                    className="form-input h-[30px]"
                  />
                </div>
                <div className="employee-form-group">
                  <label className="form-label">
                    Password<label className="text-red-600">*</label>
                  </label>
                  <div className="relative w-full h-[30px]">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      readOnly
                      value={userForm.password}
                      required
                      className="form-input h-[30px]"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={generatePassword}
                    >
                      <FaEyeSlash className="text-gray-500" />
                    </button>
                  </div>
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

export default EditAccount;
