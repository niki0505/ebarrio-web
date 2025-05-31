import { useState, useEffect, useContext, useRef } from "react";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import CreateEmployee from "./CreateEmployee";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import "../Stylesheets/Employees.css";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useConfirm } from "../context/ConfirmContext";
import EditEmployee from "./EditEmployee";
import api from "../api";
import { MdArrowDropDown } from "react-icons/md";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import EmployeeID from "./id/EmployeeID";
import { AuthContext } from "../context/AuthContext";
import Aniban2logo from "../assets/aniban2logo.jpg";
import AppLogo from "../assets/applogo-lightbg.png";
import { TbAdjustmentsHorizontal } from "react-icons/tb";

function Employees({ isCollapsed }) {
  const confirm = useConfirm();
  const { fetchEmployees, employees } = useContext(InfoContext);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [isEditClicked, setEditClicked] = useState(false);
  const { user } = useContext(AuthContext);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState("");
  const [isActiveClicked, setActiveClicked] = useState(true);
  const [isArchivedClicked, setArchivedClicked] = useState(false);

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
    const action = await confirm(
      "Do you want to print the current employee ID or generate a new one?",
      "id"
    );

    if (action === "cancel") {
      return;
    }

    if (action === "generate") {
      try {
        const response = await api.post(`/generateemployeeID/${empID}`);
        const qrCode = await uploadToFirebase(response.data.qrCode);

        try {
          const response2 = await api.put(`/saveemployeeID/${empID}`, {
            idNumber: response.data.idNumber,
            expirationDate: response.data.expirationDate,
            qrCode,
            qrToken: response.data.qrToken,
          });
          try {
            const response = await api.get(`/getemployee/${empID}`);
            const response2 = await api.get(`/getcaptain/`);
            EmployeeID({
              empData: response.data,
              captainData: response2.data,
            });
          } catch (error) {
            console.log("Error viewing current employee ID", error);
          }
        } catch (error) {
          console.log("Error saving employee ID", error);
        }
      } catch (error) {
        console.log("Error generating employee ID", error);
      }
    } else if (action === "current") {
      try {
        const response = await api.get(`/getemployee/${empID}`);
        const response2 = await api.get(`/getcaptain/`);
        if (
          !Array.isArray(response.data.employeeID) ||
          response.data.employeeID.length === 0
        ) {
          alert("This employee has not been issued an ID yet.");
          return;
        }
        EmployeeID({
          empData: response.data,
          captainData: response2.data,
        });
      } catch (error) {
        console.log("Error viewing current employee ID", error);
      }
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAdd = () => {
    setCreateClicked(true);
  };

  const archiveBtn = async (e, empID) => {
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Are you sure you want to archive this employee?",
      "confirmred"
    );
    if (isConfirmed) {
      try {
        await api.put(`/archiveemployee/${empID}`);
        alert("Employee has been successfully archived.");
      } catch (error) {
        console.log("Error", error);
      }
    }
  };

  const recoverBtn = async (e, empID) => {
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Are you sure you want to recover this employee?",
      "confirmred"
    );
    if (isConfirmed) {
      try {
        await api.put(`/recoveremployee/${empID}`);
        alert("Employee has been successfully recovered.");
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

  const editBtn = async (e, empID) => {
    e.stopPropagation();
    setEditClicked(true);
    setSelectedEmployee(empID);
  };

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, "");
    setSearch(sanitizedText);
  };

  useEffect(() => {
    let filtered = employees;
    if (isActiveClicked) {
      filtered = employees.filter((emp) => emp.status === "Active");
    } else if (isArchivedClicked) {
      filtered = employees.filter((emp) => emp.status === "Archived");
    }
    if (search) {
      const searchParts = search.toLowerCase().split(" ").filter(Boolean);
      filtered = filtered.filter((emp) => {
        const first = emp.resID.firstname || "";
        const middle = emp.resID.middlename || "";
        const last = emp.resID.lastname || "";
        const position = emp.position || "";

        const fullName = `${first} ${middle} ${last}`.trim().toLowerCase();

        return searchParts.every(
          (part) =>
            fullName.includes(part) ||
            emp.resID.address.toLowerCase().includes(part)
        );
      });
    }
    setFilteredEmployees(filtered);
  }, [search, employees, isActiveClicked, isArchivedClicked]);

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
  const currentRows = filteredEmployees.slice(indexOfFirstRow, indexOfLastRow);
  const totalRows = filteredEmployees.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  const exportCSV = () => {
    const title = "Barangay Aniban 2 Employees";
    const now = new Date().toLocaleString();
    const headers = ["Name", "Age", "Sex", "Mobile No.", "Address", "Position"];
    const rows = filteredEmployees
      .sort((a, b) => {
        const nameA = `${a.lastname}`.toLowerCase();
        const nameB = `${b.lastname}`.toLowerCase();
        return nameA.localeCompare(nameB);
      })
      .map((emp) => {
        const fullname = emp.resID.middlename
          ? `${emp.resID.lastname} ${emp.resID.middlename} ${emp.resID.firstname}`
          : `${emp.resID.lastname} ${emp.resID.firstname}`;

        return [
          fullname,
          emp.resID.age,
          emp.resID.sex,
          `"${emp.resID.mobilenumber.replace(/"/g, '""')}"`,
          `"${emp.resID.address.replace(/"/g, '""')}"`,
          emp.position,
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
      `Barangay_Aniban_2_Employees_by_${user.name.replace(/ /g, "_")}.csv`
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
    doc.text("Barangay Aniban 2, Bacoor, Cavite", pageWidth / 2, 45, {
      align: "center",
    });

    //Title
    doc.setFontSize(12);
    doc.text("Employees Reports", pageWidth / 2, 55, { align: "center" });

    const rows = filteredEmployees
      .sort((a, b) => {
        const nameA = `${a.resID.lastname}`.toLowerCase();
        const nameB = `${b.resID.lastname}`.toLowerCase();
        return nameA.localeCompare(nameB);
      })
      .map((emp) => {
        const fullname = emp.resID.middlename
          ? `${emp.resID.lastname} ${emp.resID.middlename} ${emp.resID.firstname}`
          : `${emp.resID.lastname} ${emp.resID.firstname}`;

        return [
          fullname,
          emp.resID.age,
          emp.resID.sex,
          emp.resID.mobilenumber,
          emp.resID.address,
          emp.position,
        ];
      });

    autoTable(doc, {
      head: [["Name", "Age", "Sex", "Mobile No.", "Address", "Position"]],
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
        doc.text(pageText, pageWidth - 20, pageHeight - 10);
      },
    });

    const filename = `Barangay_Aniban_2_Employees_by_${user.name.replace(
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

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Employees</div>

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
                  <div className="absolute mt-2 w-36 bg-white shadow-md z-10 rounded-md">
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

              <div className="relative" ref={filterRef}>
                {/* Filter Button */}
                <div
                  className="relative flex items-center bg-[#fff] h-7 px-2 py-4 cursor-pointer appearance-none border rounded"
                  onClick={toggleFilterDropdown}
                >
                  <h1 className="text-sm font-medium mr-2 text-[#0E94D3]">
                    Filter
                  </h1>
                  <div className="pointer-events-none flex text-gray-600">
                    <MdArrowDropDown size={18} color={"#0E94D3"} />
                  </div>
                </div>

                {filterDropdown && (
                  <div className="absolute mt-2 bg-white shadow-md z-10 rounded-md">
                    <ul className="w-full">
                      <div className="navbar-dropdown-item">
                        <li className="px-4 text-sm cursor-pointer text-[#0E94D3]">
                          All
                        </li>
                      </div>
                      <div className="navbar-dropdown-item">
                        <li className="px-4 text-sm cursor-pointer text-[#0E94D3]">
                          Captain
                        </li>
                      </div>
                      <div className="navbar-dropdown-item">
                        <li className="px-4 text-sm cursor-pointer text-[#0E94D3]">
                          Secretary
                        </li>
                      </div>
                      <div className="navbar-dropdown-item">
                        <li className="px-4 text-sm cursor-pointer text-[#0E94D3]">
                          Clerk
                        </li>
                      </div>
                      <div className="navbar-dropdown-item">
                        <li className="px-4 text-sm cursor-pointer text-[#0E94D3]">
                          Kagawad
                        </li>
                      </div>
                      <div className="navbar-dropdown-item">
                        <li className="px-4 text-sm cursor-pointer text-[#0E94D3]">
                          Tanod
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
                  Add New Employee
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
              <th>Position</th>
              <th></th>
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredEmployees.length === 0 ? (
              <tr className="bg-white">
                <td colSpan={6}>No results found</td>
              </tr>
            ) : (
              currentRows
                .sort((a, b) => {
                  const nameA = `${a.resID.lastname}`.toLowerCase();
                  const nameB = `${b.resID.lastname}`.toLowerCase();
                  return nameA.localeCompare(nameB);
                })
                .map((emp) => (
                  <React.Fragment key={emp._id}>
                    <tr
                      onClick={() => handleRowClick(emp._id)}
                      className="border-t transition-colors duration-300 ease-in-out"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      {expandedRow === emp._id ? (
                        <td colSpan={7}>
                          {/* Additional Information for the resident */}
                          <div className="profile-container">
                            <img
                              src={emp.resID.picture}
                              className="profile-img"
                            />
                            <div className="ml-5 mr-28 text-xs">
                              <div className="flex flex-row gap-x-2">
                                <h1 className="font-bold">Name: </h1>
                                <p className="font-medium">
                                  {emp.resID.middlename
                                    ? `${emp.resID.firstname} ${emp.resID.middlename} ${emp.resID.lastname}`
                                    : `${emp.resID.firstname} ${emp.resID.lastname}`}
                                </p>
                              </div>
                              <div className="flex flex-row gap-x-2">
                                <h1 className="font-bold">Age: </h1>
                                <p className="font-medium">{emp.resID.age}</p>
                              </div>

                              <div className="flex flex-row gap-x-2">
                                <h1 className="font-bold">Sex: </h1>
                                <p className="font-medium">{emp.resID.sex}</p>
                              </div>

                              <div className="flex flex-row gap-x-2">
                                <h1 className="font-bold">Civil Status: </h1>
                                <p className="font-medium">
                                  {emp.resID.civilstatus}
                                </p>
                              </div>

                              <div className="flex flex-row gap-x-2">
                                <h1 className="font-bold">Mobile Number: </h1>
                                <p className="font-medium">
                                  {emp.resID.mobilenumber}
                                </p>
                              </div>

                              <div className="flex flex-row gap-x-2">
                                <h1 className="font-bold">Address: </h1>
                                <p className="font-medium">
                                  {emp.resID.address}
                                </p>
                              </div>

                              <div className="flex flex-row gap-x-2">
                                <h1 className="font-bold">Position: </h1>
                                <p className="font-medium">{emp.position}</p>
                              </div>
                              {emp.position === "Kagawad" && (
                                <div className="flex flex-row gap-x-2">
                                  <h1 className="font-bold">Chairmanship: </h1>
                                  <p className="font-medium">
                                    {emp.chairmanship}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="text-xs">
                              <div className="mb-2">
                                <h1 className="font-bold text-sm">
                                  EMERGENCY CONTACT{" "}
                                </h1>
                              </div>
                              <div className="flex flex-row gap-x-2">
                                <h1 className="font-bold">Name: </h1>
                                <p className="font-medium">
                                  {emp.resID.emergencyname}
                                </p>
                              </div>
                              <div className="flex flex-row gap-x-2">
                                <h1 className="font-bold">Mobile: </h1>
                                <p className="font-medium">
                                  {emp.resID.emergencymobilenumber}
                                </p>
                              </div>

                              <div className="flex flex-row gap-x-2">
                                <h1 className="font-bold">Address: </h1>
                                <p className="font-medium">
                                  {emp.resID.emergencyaddress}
                                </p>
                              </div>
                            </div>
                          </div>
                          {emp.status === "Active" ? (
                            <div className="btn-container">
                              <button
                                className="actions-btn bg-btn-color-red hover:bg-red-700"
                                type="submit"
                                onClick={(e) => archiveBtn(e, emp._id)}
                              >
                                ARCHIVE
                              </button>
                              <button
                                className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                                type="submit"
                                onClick={(e) => handleEmployeeID(e, emp._id)}
                              >
                                EMPLOYEE ID
                              </button>
                              <button
                                className="actions-btn bg-btn-color-blue"
                                type="submit"
                                onClick={(e) => editBtn(e, emp._id)}
                              >
                                EDIT POSITION
                              </button>
                            </div>
                          ) : (
                            <button
                              className="actions-btn bg-btn-color-blue"
                              type="submit"
                              onClick={(e) => recoverBtn(e, emp._id)}
                            >
                              RECOVER
                            </button>
                          )}
                        </td>
                      ) : (
                        <>
                          <td>
                            {emp.resID.middlename
                              ? `${emp.resID.lastname} ${emp.resID.middlename} ${emp.resID.firstname}`
                              : `${emp.resID.lastname} ${emp.resID.firstname}`}
                          </td>
                          <td>{emp.resID.age}</td>
                          <td>{emp.resID.sex}</td>
                          <td>{emp.resID.mobilenumber}</td>
                          <td>{emp.resID.address}</td>
                          <td>{emp.position}</td>

                          {/* Dropdown Arrow */}
                          <td className="text-center">
                            <span
                              className={`cursor-pointer transition-transform ${
                                expandedRow === emp.resID ? "rotate-180" : ""
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

        {isCreateClicked && (
          <CreateEmployee onClose={() => setCreateClicked(false)} />
        )}

        {isEditClicked && (
          <EditEmployee
            onClose={() => setEditClicked(false)}
            empID={selectedEmployee}
          />
        )}
      </main>
    </>
  );
}

export default Employees;
