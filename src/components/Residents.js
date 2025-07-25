import { useState, useEffect, useContext, useRef } from "react";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useLocation, useNavigate } from "react-router-dom";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useConfirm } from "../context/ConfirmContext";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { removeBackground } from "@imgly/background-removal";
//SCREENS
import SearchBar from "./SearchBar";
import CreateCertificate from "./CreateCertificate";
import BarangayID from "./id/BarangayID";
import ResidentReject from "./ResidentReject";

//STYLES
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import Aniban2logo from "../assets/aniban2logo.jpg";
import AppLogo from "../assets/applogo-lightbg.png";

//ICONS
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdArrowDropDown,
} from "react-icons/md";
import { IoArchiveSharp } from "react-icons/io5";
import { FaIdCard, FaEdit, FaTrashRestoreAlt } from "react-icons/fa";
import { HiDocumentAdd } from "react-icons/hi";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import { CgEyeAlt } from "react-icons/cg";

function Residents({ isCollapsed }) {
  const location = useLocation();
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { selectedSort } = location.state || {};
  const { fetchResidents, residents } = useContext(InfoContext);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isCertClicked, setCertClicked] = useState(false);
  const [isRejectClicked, setRejectClicked] = useState(false);
  const [selectedResID, setSelectedResID] = useState(null);
  const [search, setSearch] = useState("");
  const { user } = useContext(AuthContext);
  const [isActiveClicked, setActiveClicked] = useState(true);
  const [isArchivedClicked, setArchivedClicked] = useState(false);
  const [isPendingClicked, setPendingClicked] = useState(false);
  const [sortOption, setSortOption] = useState(selectedSort || "All");
  const exportRef = useRef(null);
  const filterRef = useRef(null);

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [exportDropdown, setexportDropdown] = useState(false);
  const [filterDropdown, setfilterDropdown] = useState(false);

  const toggleExportDropdown = () => {
    setexportDropdown(!exportDropdown);
  };

  const toggleFilterDropdown = () => {
    setfilterDropdown(!filterDropdown);
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

  async function uploadToFirebaseImages(data) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `id_images/${Date.now()}_${randomString}.png`;
    const storageRef = ref(storage, fileName);

    // Convert to Blob if it’s not already
    let blob;
    if (data instanceof Blob) {
      blob = data;
    } else {
      blob = new Blob([data], { type: "image/png" });
    }

    await uploadBytes(storageRef, blob, { contentType: "image/png" });

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
          await api.put(`/savebrgyID/${resID}`, {
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
        try {
          await api.post(`/printcurrentbrgyid/${resID}`);
          BarangayID({
            resData: response.data,
            captainData: response2.data,
          });
        } catch (error) {
          console.log("Error in printing current barangay ID", error);
        }
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

  const approveBtn = async (e, resID) => {
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Are you sure you want to approve this resident?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await api.get(`/getresidentimages/${resID}`);
      const { picture, signature } = response.data;

      const pictureBlob = await fetch(picture).then((res) => res.blob());
      const signatureBlob = await fetch(signature).then((res) => res.blob());

      let pictureURL, signatureURL;

      console.log("Attempting to remove background...");

      // Try removing background from picture
      try {
        const removedBgPicture = await removeBackground(pictureBlob);
        pictureURL = await uploadToFirebaseImages(
          new Blob([removedBgPicture], { type: "image/png" })
        );
      } catch (err) {
        console.warn(
          "Failed to remove background from picture. Uploading original."
        );
        pictureURL = await uploadToFirebase(pictureBlob);
      }

      // Try removing background from signature
      try {
        const removedBgSignature = await removeBackground(signatureBlob);
        signatureURL = await uploadToFirebaseImages(
          new Blob([removedBgSignature], { type: "image/png" })
        );
      } catch (err) {
        console.warn(
          "Failed to remove background from signature. Uploading original."
        );
        signatureURL = await uploadToFirebase(signatureBlob);
      }

      await api.post(`/approveresident/${resID}`, {
        pictureURL,
        signatureURL,
      });

      setActiveClicked(true);
      setPendingClicked(false);
      alert("Resident has been approved successfully.");
    } catch (error) {
      console.log("Error in approving resident details", error);
      alert("Something went wrong while approving the resident.");
    }
  };

  const viewBtn = async (resID) => {
    try {
      await api.post(`/viewresidentdetails/${resID}`);
      navigation("/view-resident", { state: { resID } });
    } catch (error) {
      console.log("Error in viewing resident details", error);
    }
  };

  const editBtn = async (resID) => {
    try {
      await api.post(`/viewresidentdetails/${resID}`);
      navigation("/edit-resident", { state: { resID } });
    } catch (error) {
      console.log("Error in viewing resident details", error);
    }
  };

  const certBtn = (e, resID) => {
    e.stopPropagation();
    setSelectedResID(resID);
    setCertClicked(true);
  };

  const rejectBtn = (e, resID) => {
    e.stopPropagation();
    setSelectedResID(resID);
    setRejectClicked(true);
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
    const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, "");
    setSearch(sanitizedText);
  };

  useEffect(() => {
    let filtered = residents;
    if (isActiveClicked) {
      filtered = residents.filter((res) => res.status === "Active");
    } else if (isArchivedClicked) {
      filtered = residents.filter(
        (res) => res.status === "Archived" || res.status === "Rejected"
      );
    } else if (isPendingClicked) {
      filtered = residents.filter((res) => res.status === "Pending");
    }

    switch (sortOption) {
      case "Female":
        filtered = filtered.filter(
          (res) => res.sex?.toLowerCase() === "female"
        );
        break;
      case "Male":
        filtered = filtered.filter((res) => res.sex?.toLowerCase() === "male");
        break;
      case "Senior Citizens":
        filtered = filtered.filter((res) => res.age >= 60 || res.isSenior);
        break;
      case "PWD":
        filtered = filtered.filter((res) => res.isPWD);
        break;
      case "Pregnant":
        filtered = filtered.filter((res) => res.isPregnant);
        break;
      case "Unemployed":
        filtered = filtered.filter(
          (res) => res.employmentstatus === "Unemployed"
        );
        break;
      case "Voters":
        filtered = filtered.filter((res) => res.voter === "Yes");
        break;
      case "Newborn":
        filtered = filtered.filter((res) => res.isNewborn);
        break;
      case "Infant":
        filtered = filtered.filter((res) => res.isInfant);
        break;
      case "Under 5 y.o":
        filtered = filtered.filter((res) => res.isUnder5);
        break;
      case "School of Age":
        filtered = filtered.filter((res) => res.isSchoolAge);
        break;
      case "Adolescent":
        filtered = filtered.filter((res) => res.isAdolescent);
        break;
      case "Adolescent Pregnant":
        filtered = filtered.filter((res) => res.isAdolescentPregnant);
        break;
      case "Adult":
        filtered = filtered.filter((res) => res.isAdult);
        break;
      case "Postpartum":
        filtered = filtered.filter((res) => res.isPostpartum);
        break;
      case "Women of Reproductive Age":
        filtered = filtered.filter((res) => res.isWomenOfReproductive);
        break;
      default:
        break;
    }
    if (search) {
      const searchParts = search.toLowerCase().split(" ").filter(Boolean);
      filtered = filtered.filter((resident) => {
        const first = resident.firstname || "";
        const middle = resident.middlename || "";
        const last = resident.lastname || "";

        const fullName = `${first} ${middle} ${last}`.trim().toLowerCase();

        return searchParts.every(
          (part) =>
            fullName.includes(part) ||
            resident.address.toLowerCase().includes(part)
        );
      });
    }
    setFilteredResidents(filtered);
  }, [
    search,
    residents,
    isActiveClicked,
    isArchivedClicked,
    isPendingClicked,
    sortOption,
  ]);

  const handleMenu1 = () => {
    setActiveClicked(true);
    setArchivedClicked(false);
    setPendingClicked(false);
  };
  const handleMenu2 = () => {
    setArchivedClicked(true);
    setActiveClicked(false);
    setPendingClicked(false);
  };
  const handleMenu3 = () => {
    setPendingClicked(true);
    setArchivedClicked(false);
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

  const exportCSV = async () => {
    const title = `Barangay Aniban 2 ${
      sortOption === "All" ? "Residents" : sortOption
    }`;
    const now = new Date().toLocaleString();
    const headers =
      sortOption === "Voters"
        ? ["No.", "Name", "Age", "Sex", "Mobile No.", "Address", "Precinct"]
        : ["No.", "Name", "Age", "Sex", "Mobile No.", "Address"];
    const rows = filteredResidents
      .sort((a, b) => {
        const nameA = `${a.lastname}`.toLowerCase();
        const nameB = `${b.lastname}`.toLowerCase();
        return nameA.localeCompare(nameB);
      })
      .map((res, index) => {
        const fullname = res.middlename
          ? `${res.lastname} ${res.middlename} ${res.firstname}`
          : `${res.lastname} ${res.firstname}`;

        const baseRow = [
          index + 1,
          fullname,
          res.age,
          res.sex,
          `"${res.mobilenumber.replace(/"/g, '""')}"`,
          `"${res.address.replace(/"/g, '""')}"`,
        ];
        if (sortOption === "Voters") {
          return [...baseRow, res.precinct || "N/A"];
        } else {
          return baseRow;
        }
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
      `${
        sortOption === "All"
          ? `Barangay_Aniban_2_Residents_by_${user.name.replace(/ /g, "_")}.csv`
          : `Barangay_Aniban_2_${sortOption}_by_${user.name.replace(
              / /g,
              "_"
            )}.csv`
      }`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setexportDropdown(false);

    const action = "Residents";
    const description = `User exported ${
      sortOption === "All" ? "residents'" : sortOption.toLowerCase()
    } records to CSV.`;
    try {
      await api.post("/logexport", { action, description });
    } catch (error) {
      console.log("Error in logging export", error);
    }
  };

  const exportPDF = async () => {
    const now = new Date().toLocaleString();
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.width;
    const imageWidth = 30;
    const centerX = (pageWidth - imageWidth) / 2;

    //Header
    doc.addImage(Aniban2logo, "JPEG", centerX, 10, imageWidth, 30);
    doc.setFont("times");
    doc.setFontSize(14);
    doc.text("Barangay Aniban 2, Bacoor, Cavite", pageWidth / 2, 50, {
      align: "center",
    });

    //Title
    doc.setFontSize(12);
    doc.text(
      `${sortOption === "All" ? "Residents" : sortOption}`,
      pageWidth / 2,
      57,
      { align: "center" }
    );

    // Table
    const rows = filteredResidents
      .sort((a, b) => a.lastname.localeCompare(b.lastname))
      .map((res, index) => {
        const fullname = res.middlename
          ? `${res.lastname} ${res.middlename} ${res.firstname}`
          : `${res.lastname} ${res.firstname}`;
        const baseRow = [
          index + 1,
          fullname,
          res.age,
          res.sex,
          res.mobilenumber,
          res.address,
        ];
        if (sortOption === "Voters") {
          return [...baseRow, res.precinct || "N/A"];
        } else {
          return baseRow;
        }
      });

    autoTable(doc, {
      head: [
        sortOption === "Voters"
          ? ["No.", "Name", "Age", "Sex", "Mobile No.", "Address", "Precinct"]
          : ["No.", "Name", "Age", "Sex", "Mobile No.", "Address"],
      ],
      body: rows,
      startY: 65,
      margin: { bottom: 30 },
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
        doc.text(pageText, pageWidth - 40, pageHeight - 10);
      },
    });

    const filename = `${
      sortOption === "All"
        ? `Barangay_Aniban_2_Residents_by_${user.name.replace(/ /g, "_")}.pdf`
        : `Barangay_Aniban_2_${sortOption}_by_${user.name.replace(
            / /g,
            "_"
          )}.pdf`
    }`;
    doc.save(filename);
    setexportDropdown(false);

    const action = "Residents";
    const description = `User exported ${
      sortOption === "All" ? "residents'" : sortOption.toLowerCase()
    } records to CSV.`;
    try {
      await api.post("/logexport", { action, description });
    } catch (error) {
      console.log("Error in logging export", error);
    }
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

      if (
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        filterDropdown
      ) {
        setfilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportDropdown, filterDropdown]);

  const sortOptionsList = [
    "All",
    "Female",
    "Male",
    "Newborn",
    "Infant",
    "Under 5 y.o",
    "School of Age",
    "Adolescent",
    "Adolescent Pregnant",
    "Adult",
    "Postpartum",
    "Women of Reproductive Age",
    "Senior Citizens",
    "Pregnant",
    "PWD",
    "Unemployed",
    "Voters",
  ];

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
              onClick={handleMenu3}
              className={`status-text ${
                isPendingClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Pending
            </p>
            <p
              onClick={handleMenu2}
              className={`status-text ${
                isArchivedClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Archived/Rejected
            </p>
          </div>
          {isActiveClicked && (
            <div className="export-sort-btn-container">
              <div className="relative" ref={exportRef}>
                {/* Export Button */}
                <div className="export-sort-btn" onClick={toggleExportDropdown}>
                  <h1 className="export-sort-btn-text">Export</h1>
                  <div className="export-sort-btn-dropdown-icon">
                    <MdArrowDropDown size={18} color={"#0E94D3"} />
                  </div>
                </div>

                {exportDropdown && (
                  <div className="export-sort-dropdown-menu">
                    <ul className="w-full">
                      <div className="navbar-dropdown-item">
                        <li
                          className="export-sort-dropdown-option"
                          onClick={exportCSV}
                        >
                          Export as CSV
                        </li>
                      </div>
                      <div className="navbar-dropdown-item">
                        <li
                          className="export-sort-dropdown-option"
                          onClick={exportPDF}
                        >
                          Export as PDF
                        </li>
                      </div>
                    </ul>
                  </div>
                )}
              </div>

              <div className="relative" ref={filterRef}>
                {/* Filter Button */}
                <div className="export-sort-btn" onClick={toggleFilterDropdown}>
                  <h1 className="export-sort-btn-text">{sortOption}</h1>
                  <div className="export-sort-btn-dropdown-icon">
                    <MdArrowDropDown size={18} color={"#0E94D3"} />
                  </div>
                </div>

                {filterDropdown && (
                  <div className="absolute mt-2 w-40 bg-white shadow-md z-10 rounded-md max-h-60 overflow-y-auto">
                    <ul className="dropdown-list">
                      {sortOptionsList.map((option) => (
                        <div className="navbar-dropdown-item" key={option}>
                          <li
                            className="export-sort-dropdown-option"
                            onClick={() => {
                              setSortOption(option);
                              setfilterDropdown(false);
                            }}
                          >
                            {option}
                          </li>
                        </div>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button className="add-new-btn" onClick={handleAdd}>
                <h1 className="add-new-btn-text">Add New Resident</h1>
              </button>
            </div>
          )}
        </div>

        <div className="line-container">
          <hr className="line" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Mobile No.</th>
                <th>Address</th>
                {sortOption === "Voters" && <th>Precinct</th>}
                <th></th>
              </tr>
            </thead>

            <tbody className="bg-[#fff]">
              {filteredResidents.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={sortOption === "Voters" ? 7 : 6}>
                    No results found
                  </td>
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
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f0f0f0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "";
                        }}
                      >
                        {expandedRow === res._id ? (
                          <td colSpan={sortOption === "Voters" ? 7 : 6}>
                            {/* Additional Information for the resident */}
                            <div className="profile-container">
                              <div className="my-4 text-xs">
                                <div className="add-info-table-container">
                                  <div className="add-info-img-container">
                                    <img
                                      src={res.picture}
                                      alt="Profile"
                                      className="profile-img"
                                    />
                                  </div>
                                  {/* Name */}
                                  <div className="add-info-title">Name</div>
                                  <div className="add-info-container">
                                    {res.middlename
                                      ? `${res.firstname} ${res.middlename} ${res.lastname}`
                                      : `${res.firstname} ${res.lastname}`}
                                  </div>
                                  {/* Status */}
                                  <div className="add-info-title">Status</div>
                                  <div className="add-info-container">
                                    {res.voter === "Yes"
                                      ? "Voter"
                                      : "Not Voter"}
                                  </div>
                                  {/* Age */}
                                  <div className="add-info-title">Age</div>
                                  <div className="add-info-container">
                                    {res.age}
                                  </div>
                                  {/* Precinct */}
                                  <div className="add-info-title">Precinct</div>
                                  <div className="add-info-container">
                                    {res.precinct || "N/A"}
                                  </div>
                                  {/* Sex */}
                                  <div className="add-info-title">Sex</div>
                                  <div className="add-info-container">
                                    {res.sex}
                                  </div>

                                  <div className="border border-[#C1C0C0] bg-white col-span-2 flex items-center justify-center">
                                    Emergency Contact
                                  </div>

                                  {/* Civil Status */}
                                  <div className="add-info-title">
                                    Civil Status
                                  </div>
                                  <div className="add-info-container">
                                    {res.civilstatus}
                                  </div>
                                  {/* Name */}
                                  <div className="add-info-title">Name</div>
                                  <div className="add-info-container">
                                    {res.emergencyname}
                                  </div>

                                  {/* Mobile Number */}
                                  <div className="add-info-title">
                                    Mobile Number
                                  </div>
                                  <div className="add-info-container">
                                    {res.mobilenumber}
                                  </div>
                                  <div className="add-info-title">
                                    Mobile Number
                                  </div>
                                  <div className="add-info-container">
                                    {res.emergencymobilenumber}
                                  </div>

                                  {/* Address */}
                                  <div className="add-info-title">Address</div>
                                  <div className="add-info-container min-w-[250px] max-w-[250px]">
                                    {res.address}
                                  </div>
                                  <div className="add-info-title min-w-[250px] max-w-[250px]">
                                    Address
                                  </div>
                                  <div className="add-info-container">
                                    {res.emergencyaddress}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {res.status === "Active" ? (
                              <div className="btn-container">
                                <button
                                  className="table-actions-container"
                                  type="submit"
                                  onClick={(e) => archiveBtn(e, res._id)}
                                >
                                  <IoArchiveSharp className="text-[24px] text-btn-color-blue" />
                                  <label className="text-btn-color-blue text-xs">
                                    ARCHIVE
                                  </label>
                                </button>

                                <button
                                  className="table-actions-container"
                                  type="submit"
                                  onClick={(e) => handleBRGYID(e, res._id)}
                                >
                                  <FaIdCard className="text-[24px] text-btn-color-blue" />
                                  <label className="text-btn-color-blue text-xs">
                                    BRGY ID
                                  </label>
                                </button>
                                <button
                                  className="table-actions-container"
                                  type="submit"
                                  onClick={(e) => certBtn(e, res._id)}
                                >
                                  <HiDocumentAdd className="text-[24px] text-btn-color-blue" />
                                  <label className="text-btn-color-blue text-xs">
                                    DOCUMENT
                                  </label>
                                </button>
                                <button
                                  className="table-actions-container"
                                  type="submit"
                                  onClick={() => editBtn(res._id)}
                                >
                                  <FaEdit className="text-[24px] text-btn-color-blue" />
                                  <label className="text-btn-color-blue text-xs">
                                    EDIT
                                  </label>
                                </button>
                              </div>
                            ) : res.status === "Archived" ? (
                              <div className="btn-container">
                                <button
                                  className="table-actions-container"
                                  type="submit"
                                  onClick={(e) => recoverBtn(e, res._id)}
                                >
                                  <FaTrashRestoreAlt className="text-[24px] text-btn-color-blue" />
                                  <label className="text-btn-color-blue text-xs">
                                    RECOVER
                                  </label>
                                </button>
                              </div>
                            ) : res.status === "Pending" ? (
                              <>
                                <div className="btn-container">
                                  <button
                                    className="table-actions-container"
                                    type="submit"
                                    onClick={(e) => rejectBtn(e, res._id)}
                                  >
                                    <FaCircleXmark className="text-[24px] text-btn-color-blue" />
                                    <label className="text-btn-color-blue text-xs">
                                      REJECT
                                    </label>
                                  </button>
                                  <button
                                    className="table-actions-container"
                                    type="submit"
                                    onClick={(e) => approveBtn(e, res._id)}
                                  >
                                    <FaCircleCheck className="text-[24px] text-btn-color-blue" />
                                    <label className="text-btn-color-blue text-xs">
                                      APPROVE
                                    </label>
                                  </button>
                                  <button
                                    className="table-actions-container"
                                    type="submit"
                                    onClick={() => viewBtn(res._id)}
                                  >
                                    <CgEyeAlt className="text-[24px] text-btn-color-blue" />
                                    <label className="text-btn-color-blue text-xs">
                                      VIEW
                                    </label>
                                  </button>
                                </div>
                              </>
                            ) : null}
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
                            {sortOption === "Voters" && (
                              <td>{res.precinct ? res.precinct : "N/A"}</td>
                            )}
                            {/* Dropdown Arrow */}
                            <td className="text-center">
                              <span
                                className={`cursor-pointer transition-transform ${
                                  expandedRow === res._id ? "rotate-180" : ""
                                }`}
                              >
                                ▼
                              </span>
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
        <div className="table-pagination">
          <div className="table-pagination-size">
            <span>Rows per page:</span>
            <div className="relative w-12">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="table-pagination-select"
              >
                {[5, 10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <div className="table-pagination-select-icon">
                <MdArrowDropDown size={18} color={"#0E94D3"} />
              </div>
            </div>
          </div>

          <div>
            {startRow}-{endRow} of {totalRows}
          </div>

          <div>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="table-pagination-btn"
            >
              <MdKeyboardArrowLeft color={"#0E94D3"} className="text-xl" />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="table-pagination-btn"
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
        {isRejectClicked && (
          <ResidentReject
            resID={selectedResID}
            onClose={() => setRejectClicked(false)}
          />
        )}
      </main>
    </>
  );
}

export default Residents;
