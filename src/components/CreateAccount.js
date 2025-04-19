import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import "../App.css";
import { InfoContext } from "../context/InfoContext";
import { IoClose } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function CreateAccount({ onClose }) {
  const { fetchResidents } = useContext(InfoContext);
  const [residents, setResidents] = useState([]);
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
    const loadResidents = async () => {
      try {
        const data = await fetchResidents();
        setResidents(data);
      } catch (err) {
        console.log("Failed to fetch residents");
      }
    };

    loadResidents();
  }, [fetchResidents]);

  useEffect(() => {
    console.log("User Form", userForm);
  }, [userForm]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "resID") {
      const selectedResident = residents.find((res) => res._id === value);

      let roleFromPosition = "";
      if (selectedResident.empID) {
        if (selectedResident.empID.position === "Assistant Secretary") {
          roleFromPosition = "Assistant Secretary";
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
    try {
      const response = await axios.post(
        "http://localhost:5000/api/createuser",
        userForm
      );
      alert("User successfully created!");
    } catch (error) {
      console.log("Error creating user");
    }
  };
  const handleClose = () => {
    setShowModal(false);
    onClose();
  };
  //   useEffect(() => {
  //     const fetchAvailableRole = async () => {
  //       try {
  //         const response = await axios.get("http://localhost:5000/api/rolecount");
  //         const counts = response.data;

  //         const remainingRole = Object.entries(userRole)
  //           .filter(([pos, limit]) => {
  //             const lowerPos = pos.toLowerCase();
  //             return (counts[lowerPos] || 0) < limit;
  //           })
  //           .map(([pos]) => pos);
  //         setAvailableRole(remainingRole);
  //       } catch (err) {
  //         console.error("Failed to fetch available role", err);
  //       }
  //     };
  //     fetchAvailableRole();
  //   }, []);

  return (
    <>
      {setShowModal && (
        <div className="modal-container">
          <div className="modal-content w-[20rem] h-[30rem] ">
            <div className="modal-title-bar bg-navy-blue">
              <h1 className="modal-title">Add New User</h1>
              <button className="modal-btn-close">
                <IoClose className="btn-close-icon" onClick={handleClose} />
              </button>
            </div>

            <form
              className="employee-form-container"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
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
                  {residents.map((element) => (
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
                <div className="text-start">
                  {usernameErrors.length > 0 && (
                    <ul className="text-[12px] text-red-600 m-0">
                      {usernameErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  onChange={usernameValidation}
                  required
                  className="form-input h-[30px]"
                />
              </div>

              <div className="employee-form-group">
                <label className="form-label">
                  Password<label className="text-red-600">*</label>
                </label>
                <div className="text-start">
                  {passwordErrors.length > 0 && (
                    <ul className="text-[12px] text-red-600 m-0">
                      {passwordErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="relative w-full h-[30px]">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    onChange={passwordValidation}
                    required
                    className="form-input h-[30px]"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-500" />
                    ) : (
                      <FaEye className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="actions-btn bg-btn-color-blue">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateAccount;
