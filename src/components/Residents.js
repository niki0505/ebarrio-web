import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import BrgyIDBack from "../assets/brgyidback.png";
import BrgyIDFront from "../assets/brgyidfront.png";
import ReactDOM from "react-dom/client";
import { useConfirm } from "../context/ConfirmContext";
import CreateCertificate from "./CreateCertificate";
import api from "../api";
import { MdArrowDropDown } from "react-icons/md";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

function Residents({ isCollapsed }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { fetchResidents, residents } = useContext(InfoContext);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isCertClicked, setCertClicked] = useState(false);
  const [isBrgyIDClicked, setBrgyIDClicked] = useState(false);
  const [selectedResID, setSelectedResID] = useState(null);
  const [search, setSearch] = useState("");

  const [isActiveClicked, setActiveClicked] = useState(true);
  const [isArchivedClicked, setArchivedClicked] = useState(false);

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleAdd = () => {
    navigation("/create-resident");
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

  const handleBRGYID = async (e, resID) => {
    e.stopPropagation();
    const action = await confirm(
      "Do you want to print the current barangay ID or generate a new one?",
      "id"
    );

    if (action === "cancel") {
      return;
    }
    if (action === "generate") {
      try {
        const response = await api.post(`/generatebrgyID/${resID}`);
        const qrCode = await uploadToFirebase(response.data.qrCode);
        try {
          const response2 = await api.put(`/savebrgyID/${resID}`, {
            idNumber: response.data.idNumber,
            expirationDate: response.data.expirationDate,
            qrCode,
            qrToken: response.data.qrToken,
          });
        } catch (error) {
          console.log("Error saving barangay ID", error);
        }
      } catch (error) {
        console.log("Error generating barangay ID", error);
      }

      try {
        const response = await api.get(`/getresident/${resID}`);
        const response2 = await api.get(`/getcaptain/`);
        const printContent = (
          <div id="printContent">
            <div className="id-page">
              <div
                style={{
                  position: "absolute",
                  top: "52px",
                  left: "32px",
                  width: "95px",
                  height: "10px",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response.data.brgyID[0]?.idNumber}
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "75px",
                  left: "10px",
                  width: "91px",
                  height: "85px",
                  border: "1px solid black",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  style={{ width: "100%", height: "100%" }}
                  src={response.data.picture}
                />
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "165px",
                  left: "287px",
                  width: "35px",
                  height: "36px",
                  border: "1px solid black",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  style={{ width: "100%", height: "100%" }}
                  src={response.data.brgyID[0]?.qrCode}
                />
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "82px",
                  left: "118px",
                  width: "190px",
                  height: "18px",
                }}
              >
                <p
                  style={{
                    fontSize: "9px",
                  }}
                >
                  {response.data.middlename
                    ? `${response.data.lastname}, ${
                        response.data.firstname
                      }, ${response.data.middlename.substring(0, 1)}.`
                    : `${response.data.lastname}, ${response.data.firstname}`}
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "105px",
                  left: "118px",
                  width: "60px",
                  height: "13px",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response.data.birthdate}
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "105px",
                  left: "198px",
                  width: "60px",
                  height: "13px",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response.data.sex}
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "125px",
                  left: "118px",
                  width: "70px",
                  height: "13px",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response.data.civilstatus}
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "125px",
                  left: "198px",
                  width: "68px",
                  height: "13px",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response.data.nationality}
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "125px",
                  left: "268px",
                  width: "40px",
                  height: "13px",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response.data.precinct ? response.data.precinct : "N/A"}
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "148px",
                  left: "118px",
                  width: "190px",
                  height: "13px",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response.data.address}
                </p>
              </div>

              <img className="id-img" src={BrgyIDFront} />
            </div>
            <div className="id-page">
              <div
                style={{
                  position: "absolute",
                  top: "240px",
                  left: "10px",
                  width: "158px",
                  height: "70px",
                  paddingLeft: "5px",
                  paddingRight: "5px",
                }}
              >
                <p
                  style={{
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {response.data.emergencyname}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  {response.data.emergencyaddress}
                </p>
                <p
                  style={{
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {response.data.emergencymobilenumber}
                </p>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "320px",
                  width: "158px",
                  left: "10px",
                  height: "55px",
                  paddingLeft: "5px",
                  paddingRight: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  flexDirection: "column",
                }}
              >
                <img
                  style={{
                    position: "absolute",
                    width: "50px",
                    height: "50px",
                  }}
                  src={response2.data.resID.signature}
                />
                <p
                  style={{
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {response2.data.resID.firstname}{" "}
                  {response2.data.resID.lastname}
                </p>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "388px",
                  width: "70px",
                  left: "214px",
                  display: "flex",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response2.data.resID.brgyID[0]?.expirationDate}
                </p>
              </div>

              <img className="id-img" src={BrgyIDBack} />
            </div>
          </div>
        );

        const printDiv = document.createElement("div");
        document.body.appendChild(printDiv);

        const root = ReactDOM.createRoot(printDiv);
        root.render(printContent);

        const printStyle = document.createElement("style");
        printStyle.innerHTML = `
          @page {
            size: 86mm 54mm;
            margin: 0;
          }
    
         @media screen {
          #printContent, #printContent * {
            display: none;
          }
        }
          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 86mm !important;
              height: 54mm !important;
              overflow: hidden !important;
            }
    
            body * {
              visibility: hidden;
            }
    
            #printContent, #printContent * {
              visibility: visible;
            }
    
            #printContent {
              position: absolute;
              top: 0;
              left: 0;
              width: 86mm;
              height: 54mm;
            }
    
            .id-page {
              width: 86mm;
              height: 54mm;
              overflow: hidden;
              margin: 0;
              padding: 0;
              page-break-after: avoid;
            }
    
            .id-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
    
        `;

        document.head.appendChild(printStyle);

        window.onbeforeprint = () => {
          console.log("Barangay ID is generated.");
        };
        window.onafterprint = () => {
          console.log("Barangay ID is issued.");
          document.body.removeChild(printDiv);
          document.head.removeChild(printStyle);
        };

        setTimeout(() => {
          window.print();
        }, 1000);
      } catch (error) {
        console.log("Error generating barangay ID", error);
      }
    } else if (action === "current") {
      try {
        const response = await api.get(`/getresident/${resID}`);
        const response2 = await api.get(`/getcaptain/`);
        const printContent = (
          <div id="printContent">
            <div className="id-page">
              <div
                style={{
                  position: "absolute",
                  top: "52px",
                  left: "32px",
                  width: "95px",
                  height: "10px",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response.data.brgyID[0]?.idNumber}
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "75px",
                  left: "10px",
                  width: "91px",
                  height: "85px",
                  border: "1px solid black",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  style={{ width: "100%", height: "100%" }}
                  src={response.data.picture}
                />
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "165px",
                  left: "287px",
                  width: "35px",
                  height: "36px",
                  border: "1px solid black",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  style={{ width: "100%", height: "100%" }}
                  src={response.data.brgyID[0]?.qrCode}
                />
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "82px",
                  left: "118px",
                  width: "190px",
                  height: "18px",
                }}
              >
                <p
                  style={{
                    fontSize: "9px",
                    fontWeight: "bold",
                  }}
                >
                  {response.data.middlename
                    ? `${response.data.lastname}, ${
                        response.data.firstname
                      }, ${response.data.middlename.substring(0, 1)}.`
                    : `${response.data.lastname}, ${response.data.firstname}`}
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "105px",
                  left: "118px",
                  width: "60px",
                  height: "13px",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response.data.birthdate}
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "105px",
                  left: "198px",
                  width: "60px",
                  height: "13px",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response.data.sex}
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "125px",
                  left: "118px",
                  width: "70px",
                  height: "13px",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response.data.civilstatus}
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "125px",
                  left: "198px",
                  width: "68px",
                  height: "13px",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response.data.nationality}
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "125px",
                  left: "268px",
                  width: "40px",
                  height: "13px",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response.data.precinct ? response.data.precinct : "N/A"}
                </p>
              </div>

              <div
                style={{
                  position: "absolute",
                  top: "148px",
                  left: "118px",
                  width: "190px",
                  height: "13px",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response.data.address}
                </p>
              </div>

              <img className="id-img" src={BrgyIDFront} />
            </div>
            <div className="id-page">
              <div
                style={{
                  position: "absolute",
                  top: "240px",
                  left: "10px",
                  width: "158px",
                  height: "70px",
                  paddingLeft: "5px",
                  paddingRight: "5px",
                }}
              >
                <p
                  style={{
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {response.data.emergencyname}
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    textAlign: "center",
                  }}
                >
                  {response.data.emergencyaddress}
                </p>
                <p
                  style={{
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {response.data.emergencymobilenumber}
                </p>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "320px",
                  width: "158px",
                  left: "10px",
                  height: "55px",
                  paddingLeft: "5px",
                  paddingRight: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  flexDirection: "column",
                }}
              >
                <img
                  style={{
                    position: "absolute",
                    width: "50px",
                    height: "50px",
                  }}
                  src={response2.data.resID.signature}
                />
                <p
                  style={{
                    fontSize: "9px",
                    textAlign: "center",
                  }}
                >
                  {response2.data.resID.firstname}{" "}
                  {response2.data.resID.lastname}
                </p>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "388px",
                  width: "70px",
                  left: "214px",
                  display: "flex",
                }}
              >
                <p
                  style={{
                    fontSize: "8px",
                  }}
                >
                  {response2.data.resID.brgyID[0]?.expirationDate}
                </p>
              </div>

              <img className="id-img" src={BrgyIDBack} />
            </div>
          </div>
        );

        const printDiv = document.createElement("div");
        document.body.appendChild(printDiv);

        const root = ReactDOM.createRoot(printDiv);
        root.render(printContent);

        const printStyle = document.createElement("style");
        printStyle.innerHTML = `
          @page {
            size: 86mm 54mm;
            margin: 0;
          }
    
         @media screen {
          #printContent, #printContent * {
            display: none;
          }
        }
          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 86mm !important;
              height: 54mm !important;
              overflow: hidden !important;
            }
    
            body * {
              visibility: hidden;
            }
    
            #printContent, #printContent * {
              visibility: visible;
            }
    
            #printContent {
              position: absolute;
              top: 0;
              left: 0;
              width: 86mm;
              height: 54mm;
            }
    
            .id-page {
              width: 86mm;
              height: 54mm;
              overflow: hidden;
              margin: 0;
              padding: 0;
              page-break-after: avoid;
            }
    
            .id-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
    
        `;

        document.head.appendChild(printStyle);

        window.onbeforeprint = () => {
          console.log("Current barangay ID is printed.");
        };
        window.onafterprint = () => {
          console.log("Current barangay ID is issued.");
          document.body.removeChild(printDiv);
          document.head.removeChild(printStyle);
        };

        setTimeout(() => {
          window.print();
        }, 1000);
      } catch (error) {
        console.log("Error viewing current barangay ID", error);
      }
    }
  };

  const handleRowClick = (residentId) => {
    setExpandedRow(expandedRow === residentId ? null : residentId);
  };

  useEffect(() => {
    fetchResidents();
  }, []);

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
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Are you sure you want to archive this resident?",
      "confirmred"
    );
    if (isConfirmed) {
      try {
        const response = await api.delete(`/archiveresident/${resID}`);
        alert("Resident successfully archived");
        window.location.reload();
      } catch (error) {
        console.log("Error", error);
      }
    }
  };

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z\s.]/g, "");
    const formattedText = sanitizedText
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    setSearch(formattedText);
  };

  useEffect(() => {
    let filtered = residents;
    if (isActiveClicked) {
      filtered = residents.filter((res) => res.status === "Active");
    } else if (isArchivedClicked) {
      filtered = residents.filter((res) => res.status === "Archived");
    }
    if (search) {
      filtered = filtered.filter((resident) => {
        const first = resident.firstname || "";
        const middle = resident.middlename || "";
        const last = resident.lastname || "";

        const fullName = `${first} ${middle} ${last}`.trim();

        return fullName.includes(search);
      });
    }
    setFilteredResidents(filtered);
  }, [search, residents, isActiveClicked, isArchivedClicked]);

  const handleMenu1 = () => {
    setActiveClicked(true);
    setArchivedClicked(false);
  };
  const handleMenu2 = () => {
    setArchivedClicked(true);
    setActiveClicked(false);
  };

  //For Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredResidents.slice(indexOfFirstRow, indexOfLastRow);
  const totalRows = filteredResidents.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Residents</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />

        <div className="status-add-container">
          <div className="status-container">
            <p
              onClick={handleMenu1}
              className={`status-text ${isActiveClicked ? "status-line" : ""}`}
            >
              Active
            </p>
            <p
              onClick={handleMenu2}
              className={`status-text ${
                isArchivedClicked ? "status-line" : ""
              }`}
            >
              Archived
            </p>
          </div>
          {isActiveClicked && (
            <button className="add-container" onClick={handleAdd}>
              <MdPersonAddAlt1 className=" text-xl" />
              <span className="font-bold">Add new resident</span>
            </button>
          )}
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile No.</th>
              <th>Address</th>
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredResidents.length === 0 ? (
              <tr className="bg-white">
                <td colSpan={3}>No results found</td>
              </tr>
            ) : (
              currentRows.map((res) => (
                <React.Fragment key={res._id}>
                  <tr
                    onClick={() => handleRowClick(res._id)}
                    className="border-t transition-colors duration-300 ease-in-out"
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
                          <img src={res.picture} className="profile-img" />
                          <div className="ml-10 mr-28 text-xs">
                            <div className="flex flex-row gap-x-2">
                              <h1 className="font-bold">Name: </h1>
                              <p className="font-medium">
                                {res.middlename
                                  ? `${res.firstname} ${res.middlename} ${res.lastname}`
                                  : `${res.firstname} ${res.lastname}`}
                              </p>
                            </div>

                            <div className="flex flex-row gap-x-2">
                              <h1 className="font-bold">Age: </h1>
                              <p className="font-medium">{res.age}</p>
                            </div>

                            <div className="flex flex-row gap-x-2">
                              <h1 className="font-bold">Sex: </h1>
                              <p className="font-medium">{res.sex}</p>
                            </div>

                            <div className="flex flex-row gap-x-2">
                              <h1 className="font-bold">Civil Status: </h1>
                              <p className="font-medium">{res.civilstatus}</p>
                            </div>

                            <div className="flex flex-row gap-x-2">
                              <h1 className="font-bold">Mobile Number: </h1>
                              <p className="font-medium">{res.mobilenumber}</p>
                            </div>

                            <div className="flex flex-row gap-x-2">
                              <h1 className="font-bold">Address: </h1>
                              <p className="font-medium">{res.address}</p>
                            </div>
                          </div>
                          <div className="text-xs">
                            {res.voter === "Yes" ? (
                              <>
                                <div className="flex flex-row gap-x-2">
                                  <h1 className="font-bold">Status: </h1>
                                  <p className="font-medium">Voter</p>
                                </div>
                                <div className="flex flex-row gap-x-2">
                                  <h1 className="font-bold">Precinct: </h1>
                                  <p className="font-medium">
                                    {res.precinct ? res.precinct : "N/A"}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex flex-row gap-x-2">
                                  <h1 className="font-bold">Status: </h1>
                                  <p className="font-medium">Not Voter</p>
                                </div>
                              </>
                            )}

                            <div className="mt-4 mb-2">
                              <h1 className="font-bold text-sm">
                                EMERGENCY CONTACT{" "}
                              </h1>
                            </div>

                            <div className="flex flex-row gap-x-2">
                              <h1 className="font-bold">Name: </h1>
                              <p className="font-medium">{res.emergencyname}</p>
                            </div>

                            <div className="flex flex-row gap-x-2">
                              <h1 className="font-bold">Mobile: </h1>
                              <p className="font-medium">
                                {res.emergencymobilenumber}
                              </p>
                            </div>

                            <div className="flex flex-row gap-x-2">
                              <h1 className="font-bold">Address: </h1>
                              <p className="font-medium">
                                {res.emergencyaddress}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="btn-container">
                          <button
                            className="actions-btn bg-btn-color-red hover:bg-red-700"
                            type="submit"
                            onClick={(e) => archiveBtn(e, res._id)}
                          >
                            ARCHIVE
                          </button>
                          <button
                            className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                            type="submit"
                            onClick={(e) => handleBRGYID(e, res._id)}
                          >
                            BRGY ID
                          </button>
                          <button
                            className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                            type="submit"
                            onClick={(e) => certBtn(e, res._id)}
                          >
                            CERTIFICATE
                          </button>
                          <button
                            className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                            type="submit"
                            onClick={() => editBtn(res._id)}
                          >
                            EDIT
                          </button>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td>
                          {res.middlename
                            ? `${res.lastname} ${res.middlename} ${res.firstname}`
                            : `${res.lastname} ${res.firstname}`}
                        </td>
                        <td>{res.mobilenumber}</td>
                        <td>{res.address}</td>
                      </>
                    )}
                  </tr>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-end items-center mt-4 text-sm text-gray-700 gap-x-4">
          <div className="flex items-center space-x-1">
            <span>Rows per page:</span>
            <div className="relative w-12">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none w-full border px-1 py-1 pr-5 rounded bg-white text-center"
              >
                {[5, 10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-gray-600 pr-1">
                <MdArrowDropDown size={18} />
              </div>
            </div>
          </div>

          <div>
            {startRow}-{endRow} of {totalRows}
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded"
            >
              <MdKeyboardArrowLeft className="text-xl text-[#808080]" />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded"
            >
              <MdKeyboardArrowRight className="text-xl text-[#808080]" />
            </button>
          </div>
        </div>
        {isCertClicked && (
          <CreateCertificate
            resID={selectedResID}
            onClose={() => setCertClicked(false)}
          />
        )}
      </main>
    </>
  );
}

export default Residents;
