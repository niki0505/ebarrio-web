import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/Residents.css";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import Indigency from "./certificates/Indigency";

function Residents({ isCollapsed }) {
  const navigation = useNavigate();
  const { residents, setResidents } = useContext(InfoContext);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isCertClicked, setCertClicked] = useState(false);
  const [selectedResID, setSelectedResID] = useState(null);
  const [search, setSearch] = useState("");

  const handleAdd = () => {
    navigation("/create-resident");
  };

  const handleRowClick = (residentId) => {
    setExpandedRow(expandedRow === residentId ? null : residentId);
  };

  useEffect(() => {
    setFilteredResidents(residents);
  }, [residents]);
  useEffect(() => {
    console.log(residents);
  }, [residents]);

  const buttonClick = (e, resID) => {
    e.stopPropagation();
    alert(`Clicked ${resID}`);
  };

  const editBtn = (resID) => {
    navigation("/edit-resident", { state: { resID } });
  };

  const certBtn = (e, resID) => {
    e.stopPropagation();
    setSelectedResID(resID);
    setCertClicked(true);
  };

  const archiveBtn = async (e, resID) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/archiveresident/${resID}`
      );
      alert("Resident successfully archived");
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
      const filtered = residents.filter((resident) => {
        const first = resident.firstname || "";
        const middle = resident.middlename || "";
        const last = resident.lastname || "";

        return (
          first.includes(capitalizeFirstLetter) ||
          middle.includes(capitalizeFirstLetter) ||
          last.includes(capitalizeFirstLetter) ||
          `${first} ${last}`.includes(capitalizeFirstLetter) ||
          `${first} ${middle} ${last}`.includes(capitalizeFirstLetter)
        );
      });
      setFilteredResidents(filtered);
    } else {
      setFilteredResidents(residents);
    }
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Residents</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />

        <button className="add-btn" onClick={handleAdd}>
          <MdPersonAddAlt1 className=" text-xl" />
          <span className="font-bold">Add new resident</span>
        </button>

        <div className="table-container">
          <div className="table-inner-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile No.</th>
                  <th>Address</th>
                </tr>
              </thead>

              <tbody>
                {filteredResidents.length === 0 ? (
                  <tr className="bg-white">
                    <td colSpan={3}>No results found</td>
                  </tr>
                ) : (
                  filteredResidents.map((res) => (
                    <React.Fragment key={res._id}>
                      <tr
                        onClick={() => handleRowClick(res._id)}
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
                        {expandedRow === res._id ? (
                          <td colSpan={3}>
                            {/* Additional Information for the resident */}
                            <div className="profile-container">
                              <img
                                src={res.picture}
                                className="profile-img"
                              />
                              <div className="ml-5 text-sm">
                                <p>
                                  <strong>Name: </strong>
                                  {res.middlename
                                    ? `${res.firstname} ${res.middlename} ${res.lastname}`
                                    : `${res.firstname} ${res.lastname}`}
                                </p>
                                <p>
                                  <strong>Age:</strong> {res.age}
                                </p>
                                <p>
                                  <strong>Sex:</strong> {res.sex}
                                </p>
                                <p>
                                  <strong>Civil Status: </strong>{" "}
                                  {res.civilstatus}
                                </p>
                                <p>
                                  <strong>Mobile Number: </strong>{" "}
                                  {res.mobilenumber}
                                </p>
                                <p>
                                  <strong>Address: </strong> {res.address}
                                </p>
                              </div>
                              <div className="ml-5 text-sm">
                                <p>
                                  <strong>Emergency Contact:</strong>
                                </p>
                                <p>
                                  <strong>Name: </strong>
                                  {res.emergencyname}
                                </p>
                                <p>
                                  <strong>Mobile: </strong>
                                  {res.emergencymobilenumber}
                                </p>
                                <p>
                                  <strong>Address: </strong>
                                  {res.emergencyaddress}
                                </p>
                              </div>
                            </div>
                            <div className="btn-container">
                              <button
                                className="function-btn bg-btn-color-red"
                                type="submit"
                                onClick={(e) => archiveBtn(e, res._id)}
                              >
                                ARCHIVE
                              </button>
                              <button
                                className="function-btn bg-btn-color-blue"
                                type="submit"
                                onClick={(e) => buttonClick(e, res._id)}
                              >
                                BRGY ID
                              </button>
                              <button
                                className="function-btn bg-btn-color-blue"
                                type="submit"
                                onClick={(e) => certBtn(e, res._id)}
                              >
                                CERTIFICATE
                              </button>
                              <button
                                className="function-btn bg-btn-color-blue"
                                type="submit"
                                onClick={() => editBtn(res._id)}
                              >
                                EDIT
                              </button>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="text-sm">
                              {res.middlename
                                ? `${res.lastname} ${res.middlename} ${res.firstname}`
                                : `${res.lastname} ${res.firstname}`}
                            </td>
                            <td className="text-sm">{res.mobilenumber}</td>
                            <td className="text-sm">{res.address}</td>
                          </>
                        )}
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      {isCertClicked && <Indigency resID={selectedResID} />}
    </>
  );
}

export default Residents;
