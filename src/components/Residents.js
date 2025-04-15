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
import BrgyID from "./certificates/BrgyID";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import BrgyIDImage from "../assets/brgyid.jpg";
import ReactDOM from "react-dom/client";

function Residents({ isCollapsed }) {
  const navigation = useNavigate();
  const { residents, setResidents } = useContext(InfoContext);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isCertClicked, setCertClicked] = useState(false);
  const [isBrgyIDClicked, setBrgyIDClicked] = useState(false);
  const [selectedResID, setSelectedResID] = useState(null);
  const [search, setSearch] = useState("");

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
    const printContent = (
      <div id="printContent">
        <div className="id-page">
          <p style={{ position: "absolute", top: "20px" }}>Hello</p>
          <img className="id-img" src={BrgyIDImage} />
        </div>
        <div className="id-page">
          <img className="id-img" src={BrgyIDImage} />
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
    
    
      @media screen {
        #printContent {
          display: none;
        }
      }
    `;

    document.head.appendChild(printStyle);

    setTimeout(() => {
      window.print();
      window.onafterprint = () => {
        document.body.removeChild(printDiv);
        document.head.removeChild(printStyle);
      };
    }, 500);

    // e.stopPropagation();
    // try {
    //   const response = await axios.post(
    //     `http://localhost:5000/api/generatebrgyID/${resID}`
    //   );
    //   console.log(response.data);
    //   const qrCode = await uploadToFirebase(response.data.qrCode);
    //   try {
    //     const response2 = await axios.put(
    //       `http://localhost:5000/api/savebrgyID/${resID}`,
    //       {
    //         idNumber: response.data.idNumber,
    //         expirationDate: response.data.expirationDate,
    //         qrCode,
    //         qrToken: response.data.qrToken,
    //       }
    //     );
    //     alert("Barangay ID is successfully generated");
    //   } catch (error) {
    //     console.log("Error saving barangay ID", error);
    //   }
    // } catch (error) {
    //   console.log("Error generating barangay ID", error);
    // }
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

        <div className="white-bg-container">
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
                                  className="actions-btn bg-btn-color-red"
                                  type="submit"
                                  onClick={(e) => archiveBtn(e, res._id)}
                                >
                                  ARCHIVE
                                </button>
                                <button
                                  className="actions-btn bg-btn-color-blue"
                                  type="submit"
                                  onClick={(e) => handleBRGYID(e, res._id)}
                                >
                                  BRGY ID
                                </button>
                                <button
                                  className="actions-btn bg-btn-color-blue"
                                  type="submit"
                                  onClick={(e) => certBtn(e, res._id)}
                                >
                                  CERTIFICATE
                                </button>
                                <button
                                  className="actions-btn bg-btn-color-blue"
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
        </div>
      </main>
    </>
  );
}

export default Residents;
