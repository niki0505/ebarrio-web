import { useState, useEffect, useContext, useRef } from "react";
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useConfirm } from "../context/ConfirmContext";
import CreateCertificate from "./CreateCertificate";
import api from "../api";
import { MdArrowDropDown } from "react-icons/md";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import BarangayID from "./id/BarangayID";
import { AuthContext } from "../context/AuthContext";
import Aniban2logo from "../assets/aniban2logo.jpg";
import AppLogo from "../assets/applogo-lightbg.png";

function Residents({ isCollapsed }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { fetchResidents, residents } = useContext(InfoContext);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isCertClicked, setCertClicked] = useState(false);
  const [selectedResID, setSelectedResID] = useState(null);
  const [search, setSearch] = useState("");
  const { user } = useContext(AuthContext);
  const [isActiveClicked, setActiveClicked] = useState(true);
  const [isArchivedClicked, setArchivedClicked] = useState(false);
  const exportRef = useRef(null);

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [exportDropdown, setexportDropdown] = useState(false);

  const toggleExportDropdown = () => {
    setexportDropdown(!exportDropdown);
  };

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
        BarangayID({
          resData: response.data,
          captainData: response2.data,
        });
      } catch (error) {
        console.log("Error generating barangay ID", error);
      }
    } else if (action === "current") {
      try {
        const response = await api.get(`/getresident/${resID}`);
        const response2 = await api.get(`/getcaptain/`);
        if (
          !Array.isArray(response.data.brgyID) ||
          response.data.brgyID.length === 0
        ) {
          alert("This resident has not been issued an ID yet.");
          return;
        }
        BarangayID({
          resData: response.data,
          captainData: response2.data,
        });
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
        await api.put(`/archiveresident/${resID}`);
        alert("Resident has been successfully archived.");
      } catch (error) {
        console.log("Error", error);
      }
    }
  };

  const recoverBtn = async (e, resID) => {
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Are you sure you want to recover this resident?",
      "confirmred"
    );
    if (isConfirmed) {
      try {
        await api.put(`/recoverresident/${resID}`);
        alert("Resident has been successfully recovered.");
      } catch (error) {
        const response = error.response;
        if (response && response.data) {
          console.log("❌ Error status:", response.status);
          alert(response.data.message || "Something went wrong.");
        } else {
          console.log("❌ Network or unknown error:", error.message);
          alert("An unexpected error occurred.");
        }
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

  const exportCSV = () => {
    const title = "Barangay Aniban 2 Residents";
    const now = new Date().toLocaleString();
    const headers = ["Name", "Age", "Sex", "Mobile No.", "Address"];
    const rows = filteredResidents
      .sort((a, b) => {
        const nameA = `${a.lastname}`.toLowerCase();
        const nameB = `${b.lastname}`.toLowerCase();
        return nameA.localeCompare(nameB);
      })
      .map((res) => {
        const fullname = res.middlename
          ? `${res.lastname} ${res.middlename} ${res.firstname}`
          : `${res.lastname} ${res.firstname}`;

        return [
          fullname,
          res.age,
          res.sex,
          `"${res.mobilenumber.replace(/"/g, '""')}"`,
          `"${res.address.replace(/"/g, '""')}"`,
        ];
      });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        `${title}`,
        `Exported by: ${user.name}`,
        `Exported on: ${now}`,
        "",
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Barangay_Aniban_2_Residents_by_${user.name.replace(/ /g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setexportDropdown(false);
  };

  const exportPDF = () => {
    const now = new Date().toLocaleString();
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.width;
    const imageWidth = 30;
    const centerX = (pageWidth - imageWidth) / 2;

    //Header
    doc.addImage(Aniban2logo, "JPEG", centerX, 10, imageWidth, 30);
    doc.setFontSize(14);
    doc.text("Barangay Aniban 2, Bacoor Cavite City", pageWidth / 2, 45, {
      align: "center",
    });

    //Title
    doc.setFontSize(12);
    doc.text("Residents Reports", pageWidth / 2, 55, { align: "center" });

    // Table
    const rows = filteredResidents
      .sort((a, b) => a.lastname.localeCompare(b.lastname))
      .map((res) => {
        const fullname = res.middlename
          ? `${res.lastname} ${res.middlename} ${res.firstname}`
          : `${res.lastname} ${res.firstname}`;
        return [fullname, res.age, res.sex, res.mobilenumber, res.address];
      });

    autoTable(doc, {
      head: [["Name", "Age", "Sex", "Mobile No.", "Address"]],
      body: rows,
      startY: 65,
      didDrawPage: function (data) {
        const pageHeight = doc.internal.pageSize.height;

        // Footer
        const logoX = 10;
        const logoY = pageHeight - 20;

        doc.setFontSize(8);
        doc.text("Powered by", logoX + 7.5, logoY - 2, { align: "center" });

        // App Logo (left)
        doc.addImage(AppLogo, "PNG", logoX, logoY, 15, 15);

        // Exported by & exported on
        doc.setFontSize(10);
        doc.text(`Exported by: ${user.name}`, logoX + 20, logoY + 5);
        doc.text(`Exported on: ${now}`, logoX + 20, logoY + 10);

        // Page number
        const pageWidth = doc.internal.pageSize.width;
        const pageCount = doc.internal.getNumberOfPages();
        const pageText = `Page ${
          doc.internal.getCurrentPageInfo().pageNumber
        } of ${pageCount}`;
        doc.setFontSize(10);
        doc.text(pageText, pageWidth - 20, pageHeight - 10);
      },
    });

    const filename = `Barangay_Aniban_2_Residents_by_${user.name.replace(
      / /g,
      "_"
    )}.pdf`;
    doc.save(filename);
    setexportDropdown(false);
  };

  //To handle close when click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target) &&
        exportDropdown
      ) {
        setexportDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportDropdown]);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Residents</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />

        <div className="status-add-container">
          <div className="status-container">
            <p
              onClick={handleMenu1}
              className={`status-text ${
                isActiveClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Active
            </p>
            <p
              onClick={handleMenu2}
              className={`status-text ${
                isArchivedClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Archived
            </p>
          </div>
          {isActiveClicked && (
            <div className="flex flex-row gap-x-2 mt-4">
              <div className="relative" ref={exportRef}>
                {/* Export Button */}
                <div
                  className="relative flex items-center bg-[#fff] h-7 px-2 py-4 cursor-pointer appearance-none border rounded"
                  onClick={toggleExportDropdown}
                >
                  <h1 className="text-sm font-medium mr-2 text-[#0E94D3]">
                    Export
                  </h1>
                  <div className="pointer-events-none flex text-gray-600">
                    <MdArrowDropDown size={18} color={"#0E94D3"} />
                  </div>
                </div>

                {exportDropdown && (
                  <div className="absolute mt-2 w-40 bg-white shadow-md z-10 rounded-md">
                    <ul className="w-full">
                      <div className="navbar-dropdown-item">
                        <li
                          className="px-4 text-sm cursor-pointer text-[#0E94D3]"
                          onClick={exportCSV}
                        >
                          Export as CSV
                        </li>
                      </div>
                      <div className="navbar-dropdown-item">
                        <li
                          className="px-4 text-sm cursor-pointer text-[#0E94D3]"
                          onClick={exportPDF}
                        >
                          Export as PDF
                        </li>
                      </div>
                    </ul>
                  </div>
                )}
              </div>

              <div
                className="bg-[#0E94D3] h-7 px-4 py-4 cursor-pointer flex items-center justify-center rounded border"
                onClick={handleAdd}
              >
                <h1 className="font-medium text-sm text-[#fff] m-0">
                  Add New Resident
                </h1>
              </div>
            </div>
          )}
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Sex</th>
              <th>Mobile No.</th>
              <th>Address</th>
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredResidents.length === 0 ? (
              <tr className="bg-white">
                <td colSpan={5}>No results found</td>
              </tr>
            ) : (
              currentRows
                .sort((a, b) => {
                  const nameA = `${a.lastname}`.toLowerCase();
                  const nameB = `${b.lastname}`.toLowerCase();
                  return nameA.localeCompare(nameB);
                })
                .map((res) => (
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
                        <td colSpan={5}>
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
                                <p className="font-medium">
                                  {res.mobilenumber}
                                </p>
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
                                <p className="font-medium">
                                  {res.emergencyname}
                                </p>
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
                          {res.status === "Active" ? (
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
                          ) : (
                            <button
                              className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                              type="submit"
                              onClick={(e) => recoverBtn(e, res._id)}
                            >
                              RECOVER
                            </button>
                          )}
                        </td>
                      ) : (
                        <>
                          <td>
                            {res.middlename
                              ? `${res.lastname} ${res.middlename} ${res.firstname}`
                              : `${res.lastname} ${res.firstname}`}
                          </td>
                          <td>{res.age}</td>
                          <td>{res.sex}</td>
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
                className="appearance-none w-full border px-1 py-1 pr-5 rounded bg-white text-center text-[#0E94D3]"
              >
                {[5, 10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-gray-600 pr-1">
                <MdArrowDropDown size={18} color={"#0E94D3"} />
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
              <MdKeyboardArrowLeft color={"#0E94D3"} className="text-xl" />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded"
            >
              <MdKeyboardArrowRight color={"#0E94D3"} className="text-xl" />
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
