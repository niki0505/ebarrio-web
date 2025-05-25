import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useLocation, useNavigate } from "react-router-dom";
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
import api from "../api";
import { MdArrowDropDown } from "react-icons/md";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

function CertificateRequests({ isCollapsed }) {
  const location = useLocation();
  const { cancelled } = location.state || {};
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { fetchCertificates, certificates } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  //   const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [search, setSearch] = useState("");

  const [isRejectClicked, setRejectClicked] = useState(false);

  const [isPendingClicked, setPendingClicked] = useState(true);
  const [isIssuedClicked, setIssuedClicked] = useState(false);
  const [isRejectedClicked, setRejectedClicked] = useState(false);
  const [selectedCertID, setSelectedCertID] = useState(null);

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z\s.]/g, "");
    const formattedText = sanitizedText
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    setSearch(formattedText);
  };

  useEffect(() => {
    console.log("location.state:", location.state);
  }, []);

  useEffect(() => {
    if (cancelled) {
      setRejectedClicked(true);
      setPendingClicked(false);
      setIssuedClicked(false);
    }
    console.log(cancelled);
  }, [cancelled]);

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    let filtered = certificates;

    if (isPendingClicked) {
      filtered = certificates.filter((cert) => cert.status === "Pending");
    } else if (isIssuedClicked) {
      filtered = certificates.filter((cert) => cert.status === "Issued");
    } else if (isRejectedClicked) {
      filtered = certificates.filter(
        (cert) => cert.status === "Rejected" || cert.status === "Cancelled"
      );
    }
    if (search) {
      filtered = filtered.filter((cert) => {
        const first = cert.resID.firstname || "";
        const middle = cert.resID.middlename || "";
        const last = cert.resID.lastname || "";

        const fullName = `${first} ${middle} ${last}`.trim();

        return fullName.includes(search);
      });
    }
    setFilteredCertificates(filtered);
  }, [
    certificates,
    search,
    isPendingClicked,
    isIssuedClicked,
    isRejectedClicked,
  ]);

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
    let response3 = await api.get(`/getcertificate/${certID}`);
    const response4 = await api.get(`/getcaptain/`);
    const response5 = await api.get(`/getprepared/${user.userID}`);

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
        const gencert = await api.put(`/generatecertificatereq/${certID}`);
        const qrCode = await uploadToFirebase(gencert.data.qrCode);
        const savecert = await api.put(`/savecertificatereq/${certID}`, {
          qrCode,
        });
        response3 = await api.get(`/getcertificate/${certID}`);
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
        const gencert = await api.put(`/generatecertificatereq/${certID}`);
        const qrCode = await uploadToFirebase(gencert.data.qrCode);
        const savecert = await api.put(`/savecertificatereq/${certID}`, {
          qrCode,
        });
        response3 = await api.get(`/getcertificate/${certID}`);
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
        const gencert = await api.put(`/generatecertificatereq/${certID}`);
        const qrCode = await uploadToFirebase(gencert.data.qrCode);
        const savecert = await api.put(`/savecertificatereq/${certID}`, {
          qrCode,
        });
        response3 = await api.get(`/getcertificate/${certID}`);
      }
      BusinessClearancePrint({
        certData: response3.data,
        captainData: response4.data,
        preparedByData: response5.data,
        updatedAt: response3.data.updatedAt,
      });
    }
  };

  const handleMenu1 = () => {
    setPendingClicked(true);
    setIssuedClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu2 = () => {
    setIssuedClicked(true);
    setPendingClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu3 = () => {
    setRejectedClicked(true);
    setPendingClicked(false);
    setIssuedClicked(false);
  };

  //For Pagination
  const parseDate = (dateStr) => new Date(dateStr.replace(" at ", " "));

  const sortedFilteredCert = [...filteredCertificates].sort(
    (a, b) => parseDate(b.updatedAt) - parseDate(a.updatedAt)
  );
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedFilteredCert.slice(indexOfFirstRow, indexOfLastRow);
  const totalRows = filteredCertificates.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Certificate Requests</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />
        <div className="flex flex-row gap-x-3 mt-10">
          <p
            onClick={handleMenu1}
            className={`cursor-pointer text-base font-bold ${
              isPendingClicked ? "border-b-4 border-btn-color-blue" : ""
            }`}
          >
            Pending
          </p>
          <p
            onClick={handleMenu2}
            className={`cursor-pointer text-base font-bold ${
              isIssuedClicked ? "border-b-4 border-btn-color-blue" : ""
            }`}
          >
            Issued
          </p>
          <p
            onClick={handleMenu3}
            className={`cursor-pointer text-base font-bold ${
              isRejectedClicked ? "border-b-4 border-btn-color-blue" : ""
            }`}
          >
            Cancelled/Rejected
          </p>
        </div>
        <hr className="mt-4 border border-gray-300" />

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type of Certificate</th>
              <th>Amount</th>
              {isPendingClicked && <th>Date Requested</th>}
              {isIssuedClicked && <th>Date Issued</th>}
              {isRejectedClicked && <th>Date Cancelled/Rejected</th>}
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredCertificates.length === 0 ? (
              <tr className="bg-white">
                <td colSpan={5}>No results found</td>
              </tr>
            ) : (
              currentRows.map((cert) => (
                <React.Fragment key={cert._id}>
                  <tr
                    onClick={() => handleRowClick(cert._id)}
                    className="border-t transition-colors duration-300 ease-in-out"
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
                        {cert.typeofcertificate === "Barangay Clearance" ||
                          (cert.typeofcertificate === "Barangay Indigency" && (
                            <>
                              <div className="profile-container">
                                <div className="ml-5 text-xs">
                                  <div className="flex flex-row gap-x-2">
                                    <h1 className="font-bold">Name:</h1>
                                    <p className="font-medium">
                                      {cert.resID.middlename
                                        ? `${cert.resID.firstname} ${cert.resID.middlename} ${cert.resID.lastname}`
                                        : `${cert.resID.firstname} ${cert.resID.lastname}`}
                                    </p>
                                  </div>
                                  <div className="flex flex-row gap-x-2">
                                    <h1 className="font-bold">
                                      Type of Certificate:
                                    </h1>
                                    <p className="font-medium">
                                      {cert.typeofcertificate}
                                    </p>
                                  </div>

                                  <div className="flex flex-row gap-x-2">
                                    <h1 className="font-bold">
                                      Purpose of Request:
                                    </h1>
                                    <p className="font-medium">
                                      {cert.purpose}
                                    </p>
                                  </div>

                                  <div className="flex flex-row gap-x-2">
                                    <h1 className="font-bold">Amount:</h1>
                                    <p className="font-medium">{cert.amount}</p>
                                  </div>

                                  <div className="flex flex-row gap-x-2">
                                    <h1 className="font-bold">
                                      Date Requested:
                                    </h1>
                                    <p className="font-medium">
                                      {cert.createdAt.substring(
                                        0,
                                        cert.createdAt.indexOf(" at")
                                      )}
                                    </p>
                                  </div>

                                  {(cert.status === "Rejected" ||
                                    cert.status === "Cancelled") && (
                                    <div className="flex flex-row gap-x-2">
                                      <h1 className="font-bold">Remarks:</h1>
                                      <p className="font-medium">
                                        {cert.remarks}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="btn-container">
                                {cert.status === "Pending" ? (
                                  <>
                                    <button
                                      className="actions-btn bg-btn-color-red hover:bg-red-700"
                                      type="submit"
                                      onClick={(e) => rejectBtn(e, cert._id)}
                                    >
                                      REJECT
                                    </button>
                                    <button
                                      className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                                      type="submit"
                                      onClick={(e) => certBtn(e, cert._id)}
                                    >
                                      ISSUE
                                    </button>
                                  </>
                                ) : cert.status === "Issued" ? (
                                  <>
                                    <button
                                      className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                                      type="submit"
                                      onClick={(e) => certBtn(e, cert._id)}
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
                                <div className="flex flex-row gap-x-2">
                                  <h1 className="font-bold">Name:</h1>
                                  <p className="font-medium">
                                    {cert.resID.middlename
                                      ? `${cert.resID.firstname} ${cert.resID.middlename} ${cert.resID.lastname}`
                                      : `${cert.resID.firstname} ${cert.resID.lastname}`}
                                  </p>
                                </div>

                                <div className="flex flex-row gap-x-2">
                                  <h1 className="font-bold">
                                    Type of Certificate:
                                  </h1>
                                  <p className="font-medium">
                                    {cert.typeofcertificate}
                                  </p>
                                </div>

                                <div className="flex flex-row gap-x-2">
                                  <h1 className="font-bold">Business Name:</h1>
                                  <p className="font-medium">
                                    {cert.businessname}
                                  </p>
                                </div>

                                <div className="flex flex-row gap-x-2">
                                  <h1 className="font-bold">
                                    Line of Business:
                                  </h1>
                                  <p className="font-medium">
                                    {cert.lineofbusiness}
                                  </p>
                                </div>

                                <div className="flex flex-row gap-x-2">
                                  <h1 className="font-bold">
                                    Location of Business:
                                  </h1>
                                  <p className="font-medium">
                                    {cert.locationofbusiness ===
                                    "Resident's Address"
                                      ? `${cert.resID.address}`
                                      : `${cert.locationofbusiness}`}
                                  </p>
                                </div>

                                <div className="flex flex-row gap-x-2">
                                  <h1 className="font-bold">Amount:</h1>
                                  <p className="font-medium">{cert.amount}</p>
                                </div>

                                <div className="flex flex-row gap-x-2">
                                  <h1 className="font-bold">Date Requested:</h1>
                                  <p className="font-medium">
                                    {cert.createdAt.substring(
                                      0,
                                      cert.createdAt.indexOf(" at")
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="btn-container">
                              {cert.status === "Pending" ? (
                                <>
                                  <button
                                    className="actions-btn bg-btn-color-red hover:bg-red-700"
                                    type="submit"
                                    onClick={(e) => rejectBtn(e, cert._id)}
                                  >
                                    REJECT
                                  </button>
                                  <button
                                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                                    type="submit"
                                    onClick={(e) => certBtn(e, cert._id)}
                                  >
                                    ISSUE
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
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
                        {isPendingClicked && (
                          <td>
                            {cert.createdAt.substring(
                              0,
                              cert.createdAt.indexOf(" at")
                            )}
                          </td>
                        )}
                        {(isIssuedClicked || isRejectedClicked) && (
                          <td>
                            {cert.updatedAt.substring(
                              0,
                              cert.updatedAt.indexOf(" at")
                            )}
                          </td>
                        )}
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
