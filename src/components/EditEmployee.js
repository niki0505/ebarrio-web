import { useEffect, useRef, useState, useContext } from "react";
import "../App.css";
import { IoClose } from "react-icons/io5";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";
import { InfoContext } from "../context/InfoContext";

function EditEmployee({ onClose, employeeDetails }) {
  const confirm = useConfirm();
  const { employees } = useContext(InfoContext);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [position, setPosition] = useState("");
  const [chairmanship, setChairmanship] = useState("");
  const [showModal, setShowModal] = useState(true);

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to edit this employee's position?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    onClose();
    try {
      const response = await api.post(`/editemployee/${empID}`, {
        position,
        chairmanship,
      });
      alert("Employee position successfully updated!");
    } catch (error) {
      console.log("Error updating employee position", error);
    }
  };
  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const brgyPosition = {
    Captain: 1,
    Secretary: 1,
    Clerk: 1,
    Kagawad: 7,
    Tanod: 20,
    Justice: 10,
  };

  useEffect(() => {
    const fetchAvailablePositions = async () => {
      try {
        const response = await api.get("/positioncount");
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

  const chairmanshipList = [
    "Budget and Appropriation",
    "Family, Women and Children",
    "Peace and Order",
    "Infrastructure",
    "VAWC (Violence Against Women and Children)",
    "Health",
    "Environment",
  ];

  const getUsedChairmanships = () => {
    return employees
      .filter((emp) => emp.position === "Kagawad")
      .map((emp) => emp.chairmanship);
  };

  return (
    <>
      {setShowModal && (
        <div className="modal-container">
          <div className="modal-content w-[30rem] h-[15rem] ">
            <div className="modal-title-bar">
              <h1 className="modal-title">Edit Employee Position</h1>
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
                  <label for="position" className="form-label">
                    Position<label className="text-red-600">*</label>
                  </label>
                  <select
                    id="position"
                    name="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="form-input h-[30px]"
                  >
                    <option value="" disabled selected hidden>
                      Select
                    </option>
                    {availablePositions.map((element) => (
                      <option value={element}>{element}</option>
                    ))}
                  </select>
                </div>

                {position === "Kagawad" && (
                  <div className="employee-form-group">
                    <label for="chairmanship" className="form-label">
                      Chairmanship<label className="text-red-600">*</label>
                    </label>
                    <select
                      id="chairmanship"
                      name="chairmanship"
                      value={chairmanship}
                      onChange={(e) => setChairmanship(e.target.value)}
                      className="form-input h-[30px]"
                    >
                      <option value="" disabled selected hidden>
                        Select
                      </option>
                      {chairmanshipList
                        .filter(
                          (chairmanship) =>
                            !getUsedChairmanships().includes(chairmanship)
                        )
                        .map((element) => (
                          <option value={element}>{element}</option>
                        ))}
                    </select>
                  </div>
                )}
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

export default EditEmployee;
