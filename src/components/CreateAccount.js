import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import "../App.css";
import { InfoContext } from "../context/InfoContext";

function CreateAccount() {
  const { residents, setResidents } = useContext(InfoContext);
  const [availableRole, setAvailableRole] = useState([]);
  const [usernameErrors, setUsernameErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    resID: "",
    role: "",
  });

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
    <div className="floating-container">
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          width: "400px",
          marginTop: "20px",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="resID">
            Name<label style={{ color: "red" }}>*</label>
          </label>
          <select
            id="resID"
            name="resID"
            style={{ width: "150px" }}
            onChange={handleInputChange}
            required
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
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>
            Role<label style={{ color: "red" }}>*</label>
          </label>
          <input
            type="text"
            id="role"
            name="role"
            value={userForm.role}
            onChange={handleInputChange}
            readOnly
            style={{ border: "1px solid black" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>
            Username<label style={{ color: "red" }}>*</label>
          </label>
          <input
            type="text"
            id="username"
            name="username"
            onChange={usernameValidation}
            style={{ border: "1px solid black" }}
            required
          />
        </div>
        {usernameErrors.length > 0 && (
          <ul style={{ color: "red", fontSize: "12px", margin: 0 }}>
            {usernameErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        )}
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>
            Password<label style={{ color: "red" }}>*</label>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            onChange={passwordValidation}
            style={{ border: "1px solid black" }}
            required
          />
        </div>
        {passwordErrors.length > 0 && (
          <ul style={{ color: "red", fontSize: "12px", margin: 0 }}>
            {passwordErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        )}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CreateAccount;
