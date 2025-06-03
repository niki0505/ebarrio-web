import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";
import { useContext, useEffect, useState, useRef } from "react";
import { InfoContext } from "../context/InfoContext";
import { MdArrowDropDown } from "react-icons/md";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import Aniban2logo from "../assets/aniban2logo.jpg";
import AppLogo from "../assets/applogo-lightbg.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ActivityLogs({ isCollapsed }) {
  const { fetchActivityLogs, activitylogs } = useContext(InfoContext);
  const { fetchUsers, users } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const exportRef = useRef(null);
  const filterRef = useRef(null);

  const [exportDropdown, setexportDropdown] = useState(false);
  const [filterDropdown, setfilterDropdown] = useState(false);

  const toggleExportDropdown = () => {
    setexportDropdown(!exportDropdown);
  };

  const toggleFilterDropdown = () => {
    setfilterDropdown(!filterDropdown);
  };

  useEffect(() => {
    fetchActivityLogs();
    fetchUsers();
  }, []);

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setSelectedUser("");
    setFilteredLogs(activitylogs);
    setCurrentPage(1);
  };

  useEffect(() => {
    setFilteredLogs(activitylogs);
    setCurrentPage(1);
  }, [activitylogs]);

  const handleSubmit = () => {
    if (fromDate && toDate && toDate < fromDate) {
      alert(
        "Invalid date range. Please ensure the 'To' date is not earlier than the 'From' date."
      );
      return;
    }

    const filtered = activitylogs.filter((log) => {
      const rawDate = log.createdAt.replace(" at ", " ");
      const logDate = new Date(rawDate).toISOString().split("T")[0];

      const isUserMatch = selectedUser
        ? log.userID?.username === selectedUser
        : true;
      const isFromDateMatch = fromDate ? logDate >= fromDate : true;
      const isToDateMatch = toDate ? logDate <= toDate : true;

      return isUserMatch && isFromDateMatch && isToDateMatch;
    });

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const getFullName = (userID) => {
    const resID = userID?.empID?.resID || userID?.resID;
    if (!resID) return "No name available";

    const { lastname = "", middlename = "", firstname = "" } = resID;
    return middlename
      ? `${lastname} ${middlename} ${firstname}`
      : `${lastname} ${firstname}`;
  };

  const exportCSV = async () => {
    const title = "Activity Logs";
    const now = new Date().toLocaleString();
    const headers = [
      "No",
      "Name",
      "Username",
      "Action",
      "Description",
      "Timestamp",
    ];
    const rows = filteredLogs
      .sort(
        (a, b) =>
          new Date(a.createdAt.split(" at")[0]) -
          new Date(b.createdAt.split(" at")[0])
      )
      .map((log, index) => {
        const fullname = getFullName(log.userID);
        const createdDate = log.createdAt.substring(
          0,
          log.createdAt.indexOf(" at")
        );

        return [
          log.logno,
          fullname,
          log.userID.username,
          log.action,
          `${log.description.replace(",", "")}`,
          `${createdDate.replace(",", "")}`,
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
      `Barangay_Aniban_2_Activity_Logs_by_${user.name.replace(/ /g, "_")}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setexportDropdown(false);

    const action = "Activity Logs";
    const description = `User exported activity logs to CSV.`;
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
    doc.setFontSize(14);
    doc.text("Barangay Aniban 2, Bacoor, Cavite", pageWidth / 2, 45, {
      align: "center",
    });

    //Title
    doc.setFontSize(12);
    doc.text("Activity Logs", pageWidth / 2, 55, {
      align: "center",
    });

    // Table
    const rows = filteredLogs
      .sort(
        (a, b) =>
          new Date(a.createdAt.split(" at")[0]) -
          new Date(b.createdAt.split(" at")[0])
      )
      .map((log, index) => {
        const fullname = getFullName(log.userID);
        const createdDate = log.createdAt.substring(
          0,
          log.createdAt.indexOf(" at")
        );

        return [
          log.logno,
          fullname,
          log.userID.username,
          log.action,
          `${log.description.replace(",", "")}`,
          `${createdDate.replace(",", "")}`,
        ];
      });

    autoTable(doc, {
      head: [["No.", "Name", "Username", "Action", "Description", "Timestamp"]],
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

    const filename = `Barangay_Aniban_2_Activity_Logs_by_${user.name.replace(
      / /g,
      "_"
    )}.pdf`;
    doc.save(filename);
    setexportDropdown(false);

    const action = "Activity Logs";
    const description = `User exported accounts to PDF.`;
    try {
      await api.post("/logexport", { action, description });
    } catch (error) {
      console.log("Error in logging export", error);
    }
  };

  const displayedLogs = filteredLogs;

  const totalRows = displayedLogs.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const sortedLogs = [...displayedLogs].sort((a, b) => b.logno - a.logno);
  const currentRows = sortedLogs.slice(indexOfFirstRow, indexOfLastRow);

  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Activity Logs</div>

        <hr className="mt-4 border border-gray-300" />

        <div className="flex flex-row justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="flex flex-col items-start justify-center mt-8">
              <label className="mr-2 font-title font-semibold text-base">
                User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="border px-2 py-1 rounded bg-white border border-gray-400 appearance-none font-subTitle font-semibold text-sm"
              >
                <option value="">All Users</option>
                {users
                  .sort((a, b) => a.username.localeCompare(b.username))
                  .map((user, index) => (
                    <option key={index} value={user.username}>
                      {user.username}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex flex-col items-start justify-center mt-8">
              <label className="mr-2 font-title font-semibold text-base">
                From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border px-2 py-1 rounded bg-white border border-gray-400 appearance-none font-subTitle font-semibold text-sm"
              />
            </div>

            <div className="flex flex-col items-start justify-center mt-8">
              <label className="mr-2 font-title font-semibold text-base">
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border px-2 py-1 rounded bg-white border border-gray-400 appearance-none font-subTitle font-semibold text-sm"
              />
            </div>

            <button
              onClick={handleReset}
              className="hover:bg-gray-400 mt-12 bg-btn-color-gray h-7 px-4 py-4 cursor-pointer flex items-center justify-center rounded border font-medium text-sm text-[#fff] m-0"
            >
              Reset
            </button>

            <button
              onClick={handleSubmit}
              className="hover:bg-[#0A7A9D] mt-12 bg-[#0E94D3] h-7 px-4 py-4 cursor-pointer flex items-center justify-center rounded border font-medium text-sm text-[#fff] m-0"
            >
              Submit
            </button>
          </div>

          <div className="relative" ref={exportRef}>
            {/* Export Button */}
            <div
              className="mt-12 relative flex items-center bg-[#fff] border-[#0E94D3] h-7 px-2 py-4 cursor-pointer appearance-none border rounded"
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
        </div>

        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>User</th>
              <th>Action</th>
              <th>Description</th>
              <th>Timestamp</th>
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {displayedLogs.length === 0 ? (
              <tr>
                <td colSpan={5}>No results found</td>
              </tr>
            ) : (
              currentRows.map((log) => (
                <tr
                  key={log._id}
                  className="border-t transition-colors duration-300 ease-in-out"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                  }}
                >
                  <td>{log.logno}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        textAlign: "left",
                      }}
                    >
                      <img
                        width={40}
                        style={{
                          borderRadius: "50%",
                          height: 40,
                          width: 40,
                          objectFit: "cover",
                          marginLeft: 10,
                        }}
                        alt="User"
                        src={
                          log.userID?.empID?.resID?.picture ||
                          log.userID?.resID?.picture ||
                          null
                        }
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div>
                          {log.userID?.empID?.resID
                            ? log.userID.empID.resID.middlename
                              ? `${log.userID.empID.resID.lastname} ${log.userID.empID.resID.middlename} ${log.userID.empID.resID.firstname}`
                              : `${log.userID.empID.resID.lastname} ${log.userID.empID.resID.firstname}`
                            : log.userID?.resID
                            ? log.userID.resID.middlename
                              ? `${log.userID.resID.lastname} ${log.userID.resID.middlename} ${log.userID.resID.firstname}`
                              : `${log.userID.resID.lastname} ${log.userID.resID.firstname}`
                            : "No name available"}
                        </div>
                        <div style={{ color: "gray" }}>
                          {log.userID?.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{log.action}</td>
                  <td>{log.description}</td>
                  <td>{log.createdAt}</td>
                </tr>
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
                className="border-[#0E94D3] appearance-none w-full border px-1 py-1 pr-5 rounded bg-white text-center text-[#0E94D3]"
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
      </main>
    </>
  );
}

export default ActivityLogs;
