import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import ReactDOM from "react-dom/client";
import { useConfirm } from "../context/ConfirmContext";
import IndigencyPrint from "./certificates/IndigencyPrint";
import CreateCertificate from "./CreateCertificate";
import BusinessClearancePrint from "./certificates/BusinessClearancePrint";
import ClearancePrint from "./certificates/ClearancePrint";
import { AuthContext } from "../context/AuthContext";
import Reject from "./Reject";

function CertificateRequests({ isCollapsed }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { fetchCertificates, certificates } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  //   const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [search, setSearch] = useState("");

  const [isRejectClicked, setRejectClicked] = useState(false);
  const [selectedCertID, setSelectedCertID] = useState(null);

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z\s.]/g, "");
    const formattedText = sanitizedText
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    setSearch(formattedText);
  };

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  useEffect(() => {
    if (search) {
      const filtered = certificates.filter((cert) => {
        const first = cert.resID.firstname || "";
        const middle = cert.resID.middlename || "";
        const last = cert.resID.lastname || "";

        const fullName = `${first} ${middle} ${last}`.trim();

        return fullName.includes(search);
      });
      setFilteredCertificates(filtered);
    } else {
      setFilteredCertificates(certificates);
    }
  }, [search, certificates]);

  const handleRowClick = (certId) => {
    setExpandedRow(expandedRow === certId ? null : certId);
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

  const rejectBtn = (e, certID) => {
    e.stopPropagation();
    setRejectClicked(true);
    setSelectedCertID(certID);
  };

  const certBtn = async (e, certID) => {
    e.stopPropagation();
    let response3 = await axios.get(
      `http://localhost:5000/api/getcertificate/${certID}`
    );
    const response4 = await axios.get(`http://localhost:5000/api/getcaptain/`);
    const response5 = await axios.get(
      `http://localhost:5000/api/getprepared/${user.userID}`
    );

    console.log("Cert Data", response3.data);
    console.log("Captain Data", response4.data);
    console.log("Prepared By Data", response5.data);
    console.log("Updated At", response3.data.updatedAt);

    if (response3.data.typeofcertificate === "Barangay Indigency") {
      if (response3.data.status === "Pending") {
        const isConfirmed = await confirm(
          "Are you sure you want to issue this certificate?",
          "confirm"
        );
        if (!isConfirmed) return;
        const gencert = await axios.put(
          `http://localhost:5000/api/generatecertificatereq/${certID}`
        );
        const qrCode = await uploadToFirebase(gencert.data.qrCode);
        const savecert = await axios.put(
          `http://localhost:5000/api/savecertificatereq/${certID}`,
          { qrCode }
        );
        response3 = await axios.get(
          `http://localhost:5000/api/getcertificate/${certID}`
        );
      }
      IndigencyPrint({
        certData: response3.data,
        captainData: response4.data,
        preparedByData: response5.data,
        updatedAt: response3.data.updatedAt,
      });
    }

    if (response3.data.typeofcertificate === "Barangay Clearance") {
      if (response3.data.status === "Pending") {
        const isConfirmed = await confirm(
          "Are you sure you want to issue this certificate?",
          "confirm"
        );
        if (!isConfirmed) return;
        const gencert = await axios.put(
          `http://localhost:5000/api/generatecertificatereq/${certID}`
        );
        const qrCode = await uploadToFirebase(gencert.data.qrCode);
        const savecert = await axios.put(
          `http://localhost:5000/api/savecertificatereq/${certID}`,
          { qrCode }
        );
        response3 = await axios.get(
          `http://localhost:5000/api/getcertificate/${certID}`
        );
      }
      ClearancePrint({
        certData: response3.data,
        captainData: response4.data,
        preparedByData: response5.data,
        updatedAt: response3.data.updatedAt,
      });
    }

    if (response3.data.typeofcertificate === "Barangay Business Clearance") {
      if (response3.data.status === "Pending") {
        const isConfirmed = await confirm(
          "Are you sure you want to issue this certificate?",
          "confirm"
        );
        if (!isConfirmed) return;
        const gencert = await axios.put(
          `http://localhost:5000/api/generatecertificatereq/${certID}`
        );
        const qrCode = await uploadToFirebase(gencert.data.qrCode);
        const savecert = await axios.put(
          `http://localhost:5000/api/savecertificatereq/${certID}`,
          { qrCode }
        );
        response3 = await axios.get(
          `http://localhost:5000/api/getcertificate/${certID}`
        );
      }
      BusinessClearancePrint({
        certData: response3.data,
        captainData: response4.data,
        preparedByData: response5.data,
        updatedAt: response3.data.updatedAt,
      });
    }
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Certificate Requests</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />

        <div className="white-bg-container">
          <div className="table-container">
            <div className="table-inner-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type of Certificate</th>
                    <th>Amount</th>
                    <th>Date Requested</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCertificates.length === 0 ? (
                    <tr className="bg-white">
                      <td colSpan={5}>No results found</td>
                    </tr>
                  ) : (
                    filteredCertificates.map((cert) => (
                      <React.Fragment key={cert._id}>
                        <tr
                          onClick={() => handleRowClick(cert._id)}
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
                          {expandedRow === cert._id ? (
                            <td colSpan={5}>
                              {/* Additional Information for the resident */}
                              {cert.typeofcertificate ===
                                "Barangay Clearance" ||
                                (cert.typeofcertificate ===
                                  "Barangay Indigency" && (
                                  <>
                                    <div className="profile-container">
                                      <div className="ml-5 text-xs">
                                        <p>
                                          <strong>Name: </strong>
                                          {cert.resID.middlename
                                            ? `${cert.resID.firstname} ${cert.resID.middlename} ${cert.resID.lastname}`
                                            : `${cert.resID.firstname} ${cert.resID.lastname}`}
                                        </p>
                                        <p>
                                          <strong>Type of Certificate:</strong>{" "}
                                          {cert.typeofcertificate}
                                        </p>
                                        <p>
                                          <strong>Purpose of Request:</strong>{" "}
                                          {cert.purpose}
                                        </p>
                                        <p>
                                          <strong>Amount: </strong>
                                          {cert.amount}
                                        </p>
                                        <p>
                                          <strong>Date Requested: </strong>
                                          {cert.createdAt.substring(
                                            0,
                                            cert.createdAt.indexOf(" at")
                                          )}
                                        </p>
                                        <p>
                                          <strong>Status: </strong>{" "}
                                          {cert.status}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="btn-container">
                                      {cert.status === "Pending" ? (
                                        <>
                                          <button
                                            className="actions-btn bg-btn-color-blue"
                                            type="submit"
                                            onClick={(e) =>
                                              certBtn(e, cert._id)
                                            }
                                          >
                                            ISSUE
                                          </button>
                                          <button
                                            className="actions-btn bg-btn-color-red"
                                            type="submit"
                                            onClick={(e) =>
                                              rejectBtn(e, cert._id)
                                            }
                                          >
                                            REJECT
                                          </button>
                                        </>
                                      ) : cert.status === "Issued" ? (
                                        <>
                                          <button
                                            className="actions-btn bg-btn-color-blue"
                                            type="submit"
                                            onClick={(e) =>
                                              certBtn(e, cert._id)
                                            }
                                          >
                                            PRINT
                                          </button>
                                        </>
                                      ) : null}
                                    </div>
                                  </>
                                ))}
                              {cert.typeofcertificate ===
                                "Barangay Business Clearance" && (
                                <>
                                  <div className="profile-container">
                                    <div className="ml-5 text-xs">
                                      <p>
                                        <strong>Name: </strong>
                                        {cert.resID.middlename
                                          ? `${cert.resID.firstname} ${cert.resID.middlename} ${cert.resID.lastname}`
                                          : `${cert.resID.firstname} ${cert.resID.lastname}`}
                                      </p>
                                      <p>
                                        <strong>Type of Certificate: </strong>
                                        {cert.typeofcertificate}
                                      </p>
                                      <p>
                                        <strong>Business Name: </strong>
                                        {cert.businessname}
                                      </p>
                                      <p>
                                        <strong>Line of Business: </strong>
                                        {cert.lineofbusiness}
                                      </p>
                                      <p>
                                        <strong>Location of Business: </strong>
                                        {cert.locationofbusiness ===
                                        "Resident's Address"
                                          ? `${cert.resID.address}`
                                          : `${cert.locationofbusiness}`}
                                      </p>
                                      <p>
                                        <strong>Amount: </strong> {cert.amount}
                                      </p>
                                      <p>
                                        <strong>Date Requested: </strong>
                                        {cert.createdAt.substring(
                                          0,
                                          cert.createdAt.indexOf(" at")
                                        )}
                                      </p>
                                      <p>
                                        <strong>Status: </strong> {cert.status}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="btn-container">
                                    {cert.status === "Pending" ? (
                                      <>
                                        <button
                                          className="actions-btn bg-btn-color-blue"
                                          type="submit"
                                          onClick={(e) => certBtn(e, cert._id)}
                                        >
                                          ISSUE
                                        </button>
                                        <button
                                          className="actions-btn bg-btn-color-red"
                                          type="submit"
                                          //   onClick={() => editBtn(res._id)}
                                        >
                                          REJECT
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          className="actions-btn bg-btn-color-blue"
                                          type="submit"
                                          onClick={(e) => certBtn(e, cert._id)}
                                        >
                                          PRINT
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </>
                              )}
                            </td>
                          ) : (
                            <>
                              <td>
                                {cert.resID.middlename
                                  ? `${cert.resID.lastname} ${cert.resID.middlename} ${cert.resID.firstname}`
                                  : `${cert.resID.lastname} ${cert.resID.firstname}`}
                              </td>
                              <td>{cert.typeofcertificate}</td>
                              <td>{cert.amount}</td>
                              <td>
                                {cert.createdAt.substring(
                                  0,
                                  cert.createdAt.indexOf(" at")
                                )}
                              </td>
                              <td>{cert.status}</td>
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
        {isRejectClicked && (
          <Reject
            certID={selectedCertID}
            onClose={() => setRejectClicked(false)}
          />
        )}
      </main>
    </>
  );
}

export default CertificateRequests;
