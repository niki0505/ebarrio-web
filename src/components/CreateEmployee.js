import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import "../App.css";
import { InfoContext } from "../context/InfoContext";
import { IoClose } from "react-icons/io5";

function CreateEmployee({ onClose }) {
  const [showModal, setShowModal] = useState(true);
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

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  return (
    <>
      {setShowModal && (
        <div className="modal-container">
          <div className="employees-modal-content">
            <div className="modal-title-bar">
              <h1 className="modal-title">Add New Employee</h1>
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
                  Name<label style={{ color: "red" }}>*</label>
                </label>
                <select
                  id="resID"
                  name="resID"
                  onChange={handleDropdownChange}
                  className="form-input"
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
                <label for="position" className="form-label">
                  Position<label style={{ color: "red" }}>*</label>
                </label>
                <select
                  id="position"
                  name="position"
                  onChange={handleDropdownChange}
                  className="form-input"
                >
                  <option value="" disabled selected hidden>
                    Select
                  </option>
                  {availablePositions.map((element) => (
                    <option value={element}>{element}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="function-btn bg-btn-color-blue">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateEmployee;
