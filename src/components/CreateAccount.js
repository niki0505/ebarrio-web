import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import "../App.css";
import { InfoContext } from "../context/InfoContext";
import { IoClose } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

function CreateAccount({ onClose }) {
  const confirm = useConfirm();
  const { fetchResidents, residents } = useContext(InfoContext);
  const [availableRole, setAvailableRole] = useState([]);
  const [usernameErrors, setUsernameErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    resID: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    fetchResidents();
  }, []);

  const usernameValidation = (e) => {
    const { name, value } = e.target;
    let errors = [];
    let formattedVal = value.replace(/\s+/g, "");

    if (!formattedVal) {
      errors.push("Username must not be empty");
    }
    if (
      (formattedVal && formattedVal.length < 3) ||
      (formattedVal && formattedVal.length > 16)
    ) {
      errors.push("Username must be between 3 and 16 characters only");
    }
    if (formattedVal && !/^[a-zA-Z0-9_]+$/.test(formattedVal)) {
      errors.push(
        "Username can only contain letters, numbers, and underscores."
      );
    }
    if (
      (formattedVal && formattedVal.startsWith("_")) ||
      (formattedVal && formattedVal.endsWith("_"))
    ) {
      errors.push("Username must not start or end with an underscore");
    }

    setUsernameErrors(errors);
    setUserForm((prev) => ({
      ...prev,
      [name]: formattedVal,
    }));
  };

  const passwordValidation = (e) => {
    const { name, value } = e.target;
    let errors = [];
    let formattedVal = value.replace(/\s+/g, "");

    if (!formattedVal) {
      errors.push("Password must not be empty");
    }
    if (
      (formattedVal && formattedVal.length < 8) ||
      (formattedVal && formattedVal.length > 64)
    ) {
      errors.push("Password must be between 8 and 64 characters only");
    }
    if (formattedVal && !/^[a-zA-Z0-9!@\$%\^&*\+#]+$/.test(formattedVal)) {
      errors.push(
        "Password can only contain letters, numbers, and !, @, $, %, ^, &, *, +, #"
      );
    }
    setPasswordErrors(errors);
    setUserForm((prev) => ({
      ...prev,
      [name]: formattedVal,
    }));
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

    if (name === "resID") {
      const selectedResident = residents.find((res) => res._id === value);

      let roleFromPosition = "";
      if (selectedResident.empID) {
        if (selectedResident.empID.position === "Clerk") {
          roleFromPosition = "Clerk";
        } else if (selectedResident.empID.position === "Justice") {
          roleFromPosition = "Justice";
        } else {
          roleFromPosition = "Official";
        }
      } else {
        roleFromPosition = "Resident";
      }

      setUserForm((prev) => ({
        ...prev,
        [name]: value,
        role: roleFromPosition || "",
      }));
    }
  };

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to create a new account?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      const response = await api.post("/createuser", userForm);
      alert("User successfully created!");
      onClose();
    } catch (error) {
      console.log("Error creating user");
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
          <div className="modal-content h-[20rem] w-[30rem]">
            <div className="modal-title-bar">
              <h1 className="modal-title">Add New User</h1>
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
                  <select
                    id="resID"
                    name="resID"
                    onChange={handleInputChange}
                    required
                    className="form-input h-[30px]"
                  >
                    <option value="" disabled selected hidden>
                      Select
                    </option>
                    {residents
                      .filter(
                        (element) =>
                          !element.userID &&
                          !(element.empID && element.empID.userID)
                      )
                      .map((element) => (
                        <option value={element._id}>
                          {element.middlename
                            ? `${element.firstname} ${element.middlename} ${element.lastname}`
                            : `${element.firstname} ${element.lastname}`}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="employee-form-group">
                  <label className="form-label">
                    Role<label className="text-red-600">*</label>
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={userForm.role}
                    onChange={handleInputChange}
                    readOnly
                    className="form-input h-[30px]"
                  />
                </div>

                <div className="employee-form-group">
                  <label className="form-label">
                    Username <label className="text-red-600">*</label>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    onChange={usernameValidation}
                    required
                    className="form-input h-[30px]"
                  />
                  <div className="text-start">
                    {usernameErrors.length > 0 && (
                      <ul className="text-[12px] text-red-600 m-0">
                        {usernameErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
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
                      onChange={passwordValidation}
                      value={userForm.password}
                      required
                      className="form-input h-[30px]"
                    />
                    <div className="text-start">
                      {passwordErrors.length > 0 && (
                        <ul className="text-[12px] text-red-600 m-0">
                          {passwordErrors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
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

export default CreateAccount;
