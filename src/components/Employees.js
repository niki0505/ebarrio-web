import { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import Indigency from "./certificates/Indigency";
import CreateEmployee from "./CreateEmployee";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import "../Stylesheets/Employees.css";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

function Employees({ isCollapsed }) {
  const navigation = useNavigate();
  const { employees, setEmployees } = useContext(InfoContext);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isCertClicked, setCertClicked] = useState(false);
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [selectedResID, setSelectedResID] = useState(null);
  const [search, setSearch] = useState("");

  const handleRowClick = (residentId) => {
    setExpandedRow(expandedRow === residentId ? null : residentId);
  };

  async function uploadToFirebase(url) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `id_qrcode/${Date.now()}_${randomString}.png`;
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  const handleEmployeeID = async (e, empID) => {
    e.stopPropagation();
    try {
      const response = await axios.post(
        `http://localhost:5000/api/generateemployeeID/${empID}`
      );
      console.log(response.data);
      const qrCode = await uploadToFirebase(response.data.qrCode);

      try {
        const response2 = await axios.put(
          `http://localhost:5000/api/saveemployeeID/${empID}`,
          {
            idNumber: response.data.idNumber,
            expirationDate: response.data.expirationDate,
            qrCode,
            qrToken: response.data.qrToken,
          }
        );
        alert("Employee ID is successfully generated");
      } catch (error) {
        console.log("Error saving employee ID", error);
      }
    } catch (error) {
      console.log("Error generating employee ID", error);
    }
  };

  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const handleAdd = () => {
    setCreateClicked(true);
  };

  const buttonClicks = (e, resID) => {
    e.stopPropagation();
    alert(`Clicked ${resID}`);
  };

  //   const editBtn = (resID) => {
  //     navigation("/editresident", { state: { resID } });
  //   };

  //   const certBtn = (e, resID) => {
  //     e.stopPropagation();
  //     setSelectedResID(resID);
  //     setCertClicked(true);
  //   };

  const archiveBtn = async (e, empID) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/archiveemployee/${empID}`
      );
      alert("Employee successfully archived");
      window.location.reload();
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleSearch = (text) => {
    const lettersOnly = text.replace(/[^a-zA-Z\s.]/g, "");
    const capitalizeFirstLetter = lettersOnly
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    setSearch(capitalizeFirstLetter);
    if (capitalizeFirstLetter) {
      const filtered = employees.filter((employees) => {
        const first = employees.resID.firstname || "";
        const middle = employees.resID.middlename || "";
        const last = employees.resID.lastname || "";
        const position = employees.position || "";

        return (
          first.includes(capitalizeFirstLetter) ||
          middle.includes(capitalizeFirstLetter) ||
          last.includes(capitalizeFirstLetter) ||
          `${first} ${last}`.includes(capitalizeFirstLetter) ||
          `${first} ${middle} ${last}`.includes(capitalizeFirstLetter) ||
          position.includes(capitalizeFirstLetter)
        );
      });
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Employees</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />

        <button className="add-btn" onClick={handleAdd}>
          <MdPersonAddAlt1 className=" text-xl" />
          <span className="font-bold">Add new employee</span>
        </button>

        <div className="white-bg-container">
          <div className="table-container">
            <div className="table-inner-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile No.</th>
                    <th>Address</th>
                    <th>Position</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr className="bg-white">
                      <td colSpan={4}>No results found</td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <React.Fragment key={emp._id}>
                        <tr
                          onClick={() => handleRowClick(emp._id)}
                          style={{
                            cursor: "pointer",
                            transition: "background-color 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f0f0f0";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "";
                          }}
                        >
                          {expandedRow === emp._id ? (
                            <td colSpan={4}>
                              {/* Additional Information for the resident */}
                              <div className="profile-container">
                                <img
                                  src={emp.resID.picture}
                                  className="profile-img"
                                />
                                <div className="ml-5 text-sm">
                                  <p>
                                    <strong>Name: </strong>
                                    {emp.resID.middlename
                                      ? `${emp.resID.firstname} ${emp.resID.middlename} ${emp.resID.lastname}`
                                      : `${emp.resID.firstname} ${emp.resID.lastname}`}
                                  </p>
                                  <p>
                                    <strong>Age:</strong> {emp.resID.age}
                                  </p>
                                  <p>
                                    <strong>Sex:</strong> {emp.resID.sex}
                                  </p>
                                  <p>
                                    <strong>Civil Status: </strong>{" "}
                                    {emp.resID.civilstatus}
                                  </p>
                                  <p>
                                    <strong>Mobile Number: </strong>{" "}
                                    {emp.resID.mobilenumber}
                                  </p>
                                  <p>
                                    <strong>Address: </strong>{" "}
                                    {emp.resID.address}
                                  </p>
                                  <p>
                                    <strong>Position: </strong> {emp.position}
                                  </p>
                                </div>
                                <div className="ml-5 text-sm">
                                  <p>
                                    <strong>Emergency Contact:</strong>
                                  </p>
                                  <p>
                                    <strong>Name: </strong>
                                    {emp.resID.emergencyname}
                                  </p>
                                  <p>
                                    <strong>Mobile: </strong>
                                    {emp.resID.emergencymobilenumber}
                                  </p>
                                  <p>
                                    <strong>Address: </strong>
                                    {emp.resID.emergencyaddress}
                                  </p>
                                </div>
                              </div>
                              <div className="btn-container">
                                <button
                                  className="actions-btn bg-btn-color-red"
                                  type="submit"
                                  onClick={(e) => archiveBtn(e, emp._id)}
                                >
                                  ARCHIVE
                                </button>
                                <button
                                  className="actions-btn bg-btn-color-blue"
                                  type="submit"
                                  onClick={(e) => handleEmployeeID(e, emp._id)}
                                >
                                  EMPLOYEE ID
                                </button>
                                <button
                                  className="actions-btn bg-btn-color-blue"
                                  type="submit"
                                  // onClick={() => editBtn(emp._id)}
                                >
                                  EDIT
                                </button>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td>
                                {emp.resID.middlename
                                  ? `${emp.resID.lastname} ${emp.resID.middlename} ${emp.resID.firstname}`
                                  : `${emp.resID.lastname} ${emp.resID.firstname}`}
                              </td>
                              <td>{emp.resID.mobilenumber}</td>
                              <td>{emp.resID.address}</td>
                              <td>{emp.position}</td>
                            </>
                          )}
                        </tr>
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {isCertClicked && <Indigency resID={selectedResID} />}
            {isCreateClicked && (
              <CreateEmployee onClose={() => setCreateClicked(false)} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default Employees;
