import { useEffect, useRef, useState, useContext } from "react";
import "../App.css";
import { InfoContext } from "../context/InfoContext";
import { IoClose } from "react-icons/io5";
import { storage } from "../firebase";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import api from "../api";

function CreateEmployee({ onClose }) {
  const { fetchResidents, residents, employees } = useContext(InfoContext);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [employeeForm, setEmployeeForm] = useState({
    resID: "",
    position: "",
    chairmanship: "",
    // assignedweeks: "",
    // assignedday: "",
  });
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    fetchResidents();
  }, []);

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function uploadToFirebase(url) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `id_images/${Date.now()}_${randomString}.png`;
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  const handleSubmit = async () => {
    try {
      let formattedEmployeeForm = { ...employeeForm };
      if (employeeForm.position !== "Justice") {
        delete employeeForm.assignedday;
        delete employeeForm.assignedweeks;
      }
      if (employeeForm.position !== "Kagawad") {
        delete employeeForm.chairmanship;
      }
      const response = await api.post("/createemployee", {
        formattedEmployeeForm,
      });
      try {
        const response2 = await api.post(
          `/generateemployeeID/${response.data.empID}`
        );
        const qrCode = await uploadToFirebase(response2.data.qrCode);

        try {
          const response3 = await api.put(
            `/saveemployeeID/${response.data.empID}`,
            {
              idNumber: response2.data.idNumber,
              expirationDate: response2.data.expirationDate,
              qrCode,
              qrToken: response2.data.qrToken,
            }
          );
          alert("Employee ID is successfully generated");
        } catch (error) {
          console.log("Error saving employee ID", error);
        }
      } catch (error) {
        console.log("Error generating employee ID", error);
      }
    } catch (error) {
      console.log("Error creating employee");
    }
  };

  const brgyPosition = {
    Captain: 1,
    Secretary: 1,
    Clerk: 1,
    Kagawad: 7,
    Tanod: 20,
    Justice: 10,
  };

  // const assignedWeeks = {
  //   "1st & 3rd Week": 5,
  //   "2nd & 4th Week": 5,
  // };

  // const assignedDay = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const chairmanshipList = [
    "Budget and Appropriation",
    "Family, Women and Children",
    "Peace and Order",
    "Infrastructure",
    "VAWC (Violence Against Women and Children)",
    "Health",
    "Environment",
  ];

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

  // useEffect(() => {
  //   const fetchAvailableWeeks = async () => {
  //     try {
  //       const response = await api.get("/weekscount");
  //       const counts = response.data;

  //       const remainingWeeks = Object.entries(assignedWeeks)
  //         .filter(([pos, limit]) => {
  //           const lowerPos = pos.toLowerCase();
  //           return (counts[lowerPos] || 0) < limit;
  //         })
  //         .map(([pos]) => pos);
  //       setAvailableWeeks(remainingWeeks);
  //     } catch (err) {
  //       console.error("Failed to fetch available weeks", err);
  //     }
  //   };
  //   fetchAvailableWeeks();
  // }, []);

  // const getUsedDaysForSelectedWeek = (week) => {
  //   return employees
  //     .filter((emp) => emp.position === "Justice" && emp.assignedweeks === week)
  //     .map((emp) => emp.assignedday);
  // };

  const getUsedChairmanships = () => {
    return employees
      .filter((emp) => emp.position === "Kagawad")
      .map((emp) => emp.chairmanship);
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
            <div className="modal-title-bar">
              <div className="modal-title">Add New Employee</div>
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
                    onChange={handleDropdownChange}
                    className="form-input h-[30px]"
                  >
                    <option value="" disabled selected hidden>
                      Select
                    </option>
                    {residents
                      .filter((res) => !res.empID)
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
                  <label for="position" className="form-label">
                    Position<label className="text-red-600">*</label>
                  </label>
                  <select
                    id="position"
                    name="position"
                    onChange={handleDropdownChange}
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

                {employeeForm.position === "Kagawad" && (
                  <div className="employee-form-group">
                    <label for="chairmanship" className="form-label">
                      Chairmanship<label className="text-red-600">*</label>
                    </label>
                    <select
                      id="chairmanship"
                      name="chairmanship"
                      onChange={handleDropdownChange}
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

                {/* {employeeForm.position === "Justice" && (
                  <div className="employee-form-group">
                    <label for="assignedweeks" className="form-label">
                      Assigned Weeks<label className="text-red-600">*</label>
                    </label>
                    <select
                      id="assignedweeks"
                      name="assignedweeks"
                      onChange={handleDropdownChange}
                      className="form-input h-[30px]"
                    >
                      <option value="" disabled selected hidden>
                        Select
                      </option>
                      {availableWeeks.map((element) => (
                        <option value={element}>{element}</option>
                      ))}
                    </select>
                  </div>
                )}
                {employeeForm.position === "Justice" &&
                  employeeForm.assignedweeks && (
                    <div className="employee-form-group">
                      <label for="assignedday" className="form-label">
                        Assigned Day<label className="text-red-600">*</label>
                      </label>
                      <select
                        id="assignedday"
                        name="assignedday"
                        onChange={handleDropdownChange}
                        className="form-input h-[30px]"
                      >
                        <option value="" disabled selected hidden>
                          Select
                        </option>
                        {assignedDay
                          .filter(
                            (day) =>
                              !getUsedDaysForSelectedWeek(
                                employeeForm.assignedweeks
                              ).includes(day)
                          )
                          .map((element) => (
                            <option value={element}>{element}</option>
                          ))}
                      </select>
                    </div>
                  )} */}

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

export default CreateEmployee;
