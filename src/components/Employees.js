import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/Residents.css";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import Indigency from "./certificates/Indigency";
import CreateEmployee from "./CreateEmployee";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";

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

  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  const handleAdd = () => {
    setCreateClicked(true);
  };

  //   const buttonClick = (e, resID) => {
  //     e.stopPropagation();
  //     alert(`Clicked ${resID}`);
  //   };

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

        <div style={{ padding: "20px", overflowY: "auto" }}>
          <div style={{ height: "300px", overflowY: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid black",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "center",
                      border: "1px solid black",
                      padding: "10px",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      border: "1px solid black",
                      padding: "10px",
                    }}
                  >
                    Mobile No.
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      border: "1px solid black",
                      padding: "10px",
                    }}
                  >
                    Address
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      border: "1px solid black",
                      padding: "10px",
                    }}
                  >
                    Position
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
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
                          <td
                            colSpan={4}
                            style={{
                              textAlign: "center",
                              border: "1px solid black",
                            }}
                          >
                            {/* Additional Information for the resident */}
                            <div style={{ flexDirection: "row" }}>
                              <img src={emp.resID.picture} width={150} />
                              <p>
                                <strong>Name: </strong>
                                {emp.resID.middlename
                                  ? `${emp.resID.firstname} ${emp.resID.middlename} ${emp.resID.lastname}`
                                  : `${emp.resID.firstname} ${emp.resID.lastname}`}
                              </p>
                              <p>
                                <strong>Age:</strong> 20
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
                                <strong>Address: </strong> {emp.resID.address}
                              </p>
                              <p>
                                <strong>Position: </strong> {emp.position}
                              </p>
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
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  gap: "10px",
                                  justifyContent: "center",
                                }}
                              >
                                <button
                                  style={{
                                    backgroundColor: "red",
                                  }}
                                  type="submit"
                                  onClick={(e) => archiveBtn(e, emp._id)}
                                >
                                  ARCHIVE
                                </button>
                                <button
                                  style={{
                                    backgroundColor: "lightblue",
                                  }}
                                  type="submit"
                                  // onClick={(e) => buttonClick(e, emp._id)}
                                >
                                  EMPLOYEE ID
                                </button>
                                <button
                                  style={{
                                    backgroundColor: "lightblue",
                                  }}
                                  type="submit"
                                  // onClick={() => editBtn(emp._id)}
                                >
                                  EDIT
                                </button>
                              </div>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td
                              style={{
                                textAlign: "center",
                                border: "1px solid black",
                              }}
                            >
                              {emp.resID.middlename
                                ? `${emp.resID.lastname} ${emp.resID.middlename} ${emp.resID.firstname}`
                                : `${emp.resID.lastname} ${emp.resID.firstname}`}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                border: "1px solid black",
                              }}
                            >
                              {emp.resID.mobilenumber}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                border: "1px solid black",
                              }}
                            >
                              {emp.resID.address}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                border: "1px solid black",
                              }}
                            >
                              {emp.position}
                            </td>
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
          {isCreateClicked && <CreateEmployee />}
          <button className="resident-add-btn" onClick={handleAdd}>
            <MdPersonAddAlt1 className=" text-xl" />
            <span className="font-bold">Add new employee</span>
          </button>
        </div>
      </main>
    </>
  );
}

export default Employees;
