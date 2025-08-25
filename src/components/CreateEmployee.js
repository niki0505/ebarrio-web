import { useEffect, useRef, useState, useContext } from "react";
import { InfoContext } from "../context/InfoContext";
import { storage } from "../firebase";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

//STYLES
import "../App.css";

//ICONS
import { IoClose } from "react-icons/io5";

function CreateEmployee({ onClose }) {
  const confirm = useConfirm();
  const { fetchResidents, residents, employees } = useContext(InfoContext);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [employeeForm, setEmployeeForm] = useState({
    resID: "",
    position: "",
    chairmanship: "",
  });
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(false);

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
    const isConfirmed = await confirm(
      "Are you sure you want to create a new employee?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }

    if (loading) return;

    setLoading(true);

    let formattedEmployeeForm = { ...employeeForm };
    if (employeeForm.position !== "Kagawad") {
      delete formattedEmployeeForm.chairmanship;
    }
    try {
      const response = await api.post("/createemployee", {
        formattedEmployeeForm,
      });
      try {
        const response2 = await api.post(
          `/generateemployeeID/${response.data.empID}`
        );
        const qrCode = await uploadToFirebase(response2.data.qrCode);

        try {
          await api.put(`/saveemployeeID/${response.data.empID}`, {
            idNumber: response2.data.idNumber,
            expirationDate: response2.data.expirationDate,
            qrCode,
            qrToken: response2.data.qrToken,
          });
        } catch (error) {
          console.log("Error saving employee ID", error);
        }
      } catch (error) {
        console.log("Error generating employee ID", error);
      }
      setEmployeeForm({
        resID: "",
        position: "",
        chairmanship: "",
      });
      alert("The employee has been successfully added.");
      onClose();
    } catch (error) {
      console.log("Error creating employee");
    } finally {
      setLoading(false);
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
      {showModal && (
        <div className="modal-container">
          <div className="modal-content h-[16rem] w-[30rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Add New Employee</h1>
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
                  <select
                    id="resID"
                    name="resID"
                    value={employeeForm.resID}
                    onChange={handleDropdownChange}
                    className="form-input h-[30px] appearance-none"
                    required
                  >
                    <option value="" disabled selected hidden>
                      Select
                    </option>
                    {residents
                      .filter((res) => !res.empID)
                      .filter(
                        (res) =>
                          res.status !== "Archived" && res.status !== "Rejected"
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
                  <label for="position" className="form-label">
                    Position<label className="text-red-600">*</label>
                  </label>
                  <select
                    id="position"
                    name="position"
                    value={employeeForm.position}
                    onChange={handleDropdownChange}
                    className="form-input h-[30px] appearance-none"
                    required
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
                      value={employeeForm.chairmanship}
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

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                  >
                    {loading ? "Submitting..." : "Submit"}
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
