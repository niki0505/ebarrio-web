import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import "../App.css";
import { InfoContext } from "../context/InfoContext";

function CreateEmployee() {
  const { residents, setResidents } = useContext(InfoContext);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [employeeForm, setEmployeeForm] = useState({
    resID: "",
    position: "",
  });

  useEffect(() => {
    console.log("Employee Form", employeeForm);
  }, [employeeForm]);

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/createemployee",
        employeeForm
      );
      alert("Employee successfully created!");
    } catch (error) {
      console.log("Error creating employee");
    }
  };

  const brgyPosition = {
    Captain: 1,
    Secretary: 1,
    "Assistant Secretary": 1,
    Kagawad: 7,
    Tanod: 20,
  };

  useEffect(() => {
    const fetchAvailablePositions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/positioncount"
        );
        const counts = response.data;

        const remainingPositions = Object.entries(brgyPosition)
          .filter(([pos, limit]) => {
            const lowerPos = pos.toLowerCase();
            return (counts[lowerPos] || 0) < limit;
          })
          .map(([pos]) => pos);
        setAvailablePositions(remainingPositions);
      } catch (err) {
        console.error("Failed to fetch available positions", err);
      }
    };
    fetchAvailablePositions();
  }, []);

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
            onChange={handleDropdownChange}
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
          <label for="position">
            Position<label style={{ color: "red" }}>*</label>
          </label>
          <select
            id="position"
            name="position"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {availablePositions.map((element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CreateEmployee;
