import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/CommonStyle.css";
import { InfoContext } from "../context/InfoContext";
import CreateAccount from "./CreateAccount";
import SearchBar from "./SearchBar";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import EditAccount from "./EditAccount";
import Aniban2logo from "../assets/aniban2logo.jpg";
import AppLogo from "../assets/applogo-lightbg.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

//ICONS
import { FaEdit } from "react-icons/fa";
import { FaUserXmark, FaUserCheck } from "react-icons/fa6";
import { MdArrowDropDown } from "react-icons/md";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

function Accounts({ isCollapsed }) {
  const confirm = useConfirm();
  const { fetchUsers, users } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [isEditClicked, setEditClicked] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUserID, setSelectedUserID] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState(null);
  const [sortOption, setSortOption] = useState("Newest");

  const [isCurrentClicked, setCurrentClicked] = useState(true);
  const [isPendingClicked, setPendingClicked] = useState(false);
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

  const handleAdd = () => {
    setCreateClicked(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (userID, username) => {
    setEditClicked(true);
    setSelectedUserID(userID);
    setSelectedUsername(username);
  };

  useEffect(() => {
    let otherUsers = users.filter((u) => u._id !== user.userID);
    if (isCurrentClicked) {
      otherUsers = users.filter(
        (emp) =>
          emp.status === "Active" ||
          emp.status === "Inactive" ||
          emp.status === "Deactivated"
      );
    } else if (isPendingClicked) {
      otherUsers = users.filter((emp) => emp.status === "Password Not Set");
    } else if (isArchivedClicked) {
      otherUsers = users.filter((emp) => emp.status === "Archived");
    }
    if (search) {
      otherUsers = otherUsers.filter((user) => {
        const resFirst = user.resID?.firstname || "";
        const resMiddle = user.resID?.middlename || "";
        const resLast = user.resID?.lastname || "";
        const username = user.username || "";

        const empFirst = user.empID?.resID.firstname || "";
        const empMiddle = user.empID?.resID.middlename || "";
        const empLast = user.empID?.resID.lastname || "";

        const resFullName = `${resFirst} ${resMiddle} ${resLast}`.trim();
        const empFullName = `${empFirst} ${empMiddle} ${empLast}`.trim();

        const lowerSearch = search.toLowerCase();

        return (
          resFullName.toLowerCase().includes(lowerSearch) ||
          empFullName.toLowerCase().includes(lowerSearch) ||
          username.toLowerCase().includes(lowerSearch)
        );
      });
    }
    setFilteredUsers(otherUsers);
  }, [search, users, isCurrentClicked, isPendingClicked, isArchivedClicked]);

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z\s.]/g, "");
    const formattedText = sanitizedText
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    setSearch(formattedText);
  };

  const handleDeactivate = async (userID) => {
    const isConfirmed = await confirm(
      "Are you sure you want to deactivate this user?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.put(`/deactivateuser/${userID}`);
      alert("User deactivated successfully!");
    } catch (error) {
      console.log("Error in deactivating user", error);
    }
  };

  const handleActivate = async (userID) => {
    const isConfirmed = await confirm(
      "Are you sure you want to activate this user?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.put(`/activateuser/${userID}`);
      alert("User activated successfully!");
    } catch (error) {
      console.log("Error in activating user", error);
    }
  };

  const handleMenu1 = () => {
    setCurrentClicked(true);
    setPendingClicked(false);
    setArchivedClicked(false);
  };
  const handleMenu2 = () => {
    setPendingClicked(true);
    setCurrentClicked(false);
    setArchivedClicked(false);
  };

  const handleMenu3 = () => {
    setArchivedClicked(true);
    setCurrentClicked(false);
    setPendingClicked(false);
  };

  //For Pagination

  const parseDate = (dateStr) => new Date(dateStr.replace(" at ", " "));

  const sortedFilteredUsers = [...filteredUsers].sort((a, b) => {
    if (sortOption === "Oldest") {
      return parseDate(a.createdAt) - parseDate(b.createdAt);
    } else {
      return parseDate(b.createdAt) - parseDate(a.createdAt);
    }
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedFilteredUsers.slice(
    indexOfFirstRow,
    indexOfLastRow
  );
  const totalRows = filteredUsers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  const exportCSV = async () => {
    const title = "Barangay Aniban 2 Accounts Reports";
    const now = new Date().toLocaleString();
    const headers = ["No", "Name", "Username", "User Role", "Date Created"];
    const rows = filteredUsers
      .sort(
        (a, b) =>
          new Date(a.createdAt.split(" at")[0]) -
          new Date(b.createdAt.split(" at")[0])
      )
      .map((user, index) => {
        const fullname = user.empID
          ? user.empID.resID.middlename
            ? `${user.empID.resID.lastname} ${user.empID.resID.middlename} ${user.empID.resID.firstname}`
            : `${user.empID.resID.lastname} ${user.empID.resID.firstname}`
          : user.resID
          ? user.resID.middlename
            ? `${user.resID.lastname} ${user.resID.middlename} ${user.resID.firstname}`
            : `${user.resID.lastname} ${user.resID.firstname}`
          : "";
        const createdDate = user.createdAt.substring(
          0,
          user.createdAt.indexOf(" at")
        );

        return [
          index + 1,
          fullname,
          user.username,
          user.role,
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
      `Barangay_Aniban_2_Accounts_by_${user.name.replace(/ /g, "_")}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setexportDropdown(false);

    const action = "Accounts";
    const description = `User exported accounts to CSV.`;
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
    doc.text("Accounts Reports", pageWidth / 2, 55, {
      align: "center",
    });

    // Table
    const rows = filteredUsers
      .sort(
        (a, b) =>
          new Date(a.createdAt.split(" at")[0]) -
          new Date(b.createdAt.split(" at")[0])
      )
      .map((user, index) => {
        const fullname = user.empID
          ? user.empID.resID.middlename
            ? `${user.empID.resID.lastname} ${user.empID.resID.middlename} ${user.empID.resID.firstname}`
            : `${user.empID.resID.lastname} ${user.empID.resID.firstname}`
          : user.resID
          ? user.resID.middlename
            ? `${user.resID.lastname} ${user.resID.middlename} ${user.resID.firstname}`
            : `${user.resID.lastname} ${user.resID.firstname}`
          : "";
        const createdDate = user.createdAt.substring(
          0,
          user.createdAt.indexOf(" at")
        );

        return [
          index + 1,
          fullname,
          user.username,
          user.role,
          `${createdDate.replace(",", "")}`,
        ];
      });

    autoTable(doc, {
      head: [["No.", "Name", "Username", "User Role", "Date Created"]],
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

    const filename = `Barangay_Aniban_2_Accounts_by_${user.name.replace(
      / /g,
      "_"
    )}.pdf`;
    doc.save(filename);
    setexportDropdown(false);

    const action = "Accounts";
    const description = `User exported accounts to PDF.`;
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

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Accounts</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />

        <div className="status-add-container">
          <div className="status-container">
            <p
              onClick={handleMenu1}
              className={`status-text ${
                isCurrentClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Current
            </p>
            <p
              onClick={handleMenu2}
              className={`status-text ${
                isPendingClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Pending
            </p>
            <p
              onClick={handleMenu3}
              className={`status-text ${
                isArchivedClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Archived
            </p>
          </div>
          {isCurrentClicked && (
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
                    Sort
                  </h1>
                  <div className="pointer-events-none flex text-gray-600">
                    <MdArrowDropDown size={18} color={"#0E94D3"} />
                  </div>
                </div>

                {filterDropdown && (
                  <div className="absolute mt-2 bg-white shadow-md z-10 rounded-md">
                    <ul className="w-full">
                      <div className="navbar-dropdown-item">
                        <li
                          className="px-4 text-sm cursor-pointer text-[#0E94D3]"
                          onClick={() => {
                            setSortOption("Newest");
                            setfilterDropdown(false);
                          }}
                        >
                          Newest
                        </li>
                      </div>
                      <div className="navbar-dropdown-item">
                        <li
                          className="px-4 text-sm cursor-pointer text-[#0E94D3]"
                          onClick={() => {
                            setSortOption("Oldest");
                            setfilterDropdown(false);
                          }}
                        >
                          Oldest
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
                  Add New User
                </h1>
              </div>
            </div>
          )}
        </div>

        <hr className="mt-4 border border-gray-300" />
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>User Role</th>
              {isCurrentClicked && <th>Status</th>}
              {isArchivedClicked && <th>Date Archived</th>}
              {(isPendingClicked || isCurrentClicked) && <th>Date Created</th>}
              {(isPendingClicked || isCurrentClicked) && <th>Action</th>}
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={isArchivedClicked ? 4 : 6}>No results found</td>
              </tr>
            ) : (
              currentRows.map((user) => (
                <tr
                  key={user._id}
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
                  <td className="text-center text-xs font-bold p-2 font-subTitle">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        paddingLeft: "40px",
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
                        src={user.empID?.resID?.picture || user.resID?.picture}
                      />
                      {user.empID
                        ? user.empID.resID.middlename
                          ? `${user.empID.resID.lastname} ${user.empID.resID.middlename} ${user.empID.resID.firstname}`
                          : `${user.empID.resID.lastname} ${user.empID.resID.firstname}`
                        : user.resID
                        ? user.resID.middlename
                          ? `${user.resID.lastname} ${user.resID.middlename} ${user.resID.firstname}`
                          : `${user.resID.lastname} ${user.resID.firstname}`
                        : "No name available"}
                    </div>
                  </td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  {isCurrentClicked && (
                    <td>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full
                      ${
                        user.status === "Inactive"
                          ? "bg-red-100 text-red-800"
                          : user.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : user.status === "Deactivated"
                          ? "bg-yellow-100 text-yellow-800"
                          : ""
                      }`}
                      >
                        {user.status}
                      </span>
                    </td>
                  )}

                  {isArchivedClicked && (
                    <td>
                      {user.updatedAt.substring(
                        0,
                        user.updatedAt.indexOf(" at")
                      )}
                    </td>
                  )}
                  {(isPendingClicked || isCurrentClicked) && (
                    <td>
                      {user.createdAt.substring(
                        0,
                        user.createdAt.indexOf(" at")
                      )}
                    </td>
                  )}

                  {!isArchivedClicked && (
                    <td className="flex justify-center gap-x-8">
                      {(user.status === "Inactive" ||
                        user.status === "Active" ||
                        user.status === "Password Not Set") && (
                        <div className="table-actions-container">
                          <button
                            type="button"
                            className="table-actions-btn"
                            onClick={() => handleEdit(user._id, user.username)}
                          >
                            <FaEdit className="text-lg text-[#06D001]" />
                            <label className="text-xs font-semibold text-[#06D001]">
                              Edit
                            </label>
                          </button>
                        </div>
                      )}

                      {(user.status === "Inactive" ||
                        user.status === "Active") && (
                        <div className="table-actions-container">
                          <button
                            type="button"
                            className="table-actions-btn"
                            onClick={() => handleDeactivate(user._id)}
                          >
                            <FaUserXmark className="text-lg text-btn-color-red" />
                            <label className="text-xs font-semibold text-btn-color-red">
                              Deactivate
                            </label>
                          </button>
                        </div>
                      )}

                      {user.status === "Deactivated" && (
                        <div className="table-actions-container">
                          <button
                            type="button"
                            className="table-actions-btn"
                            onClick={() => handleActivate(user._id)}
                          >
                            <FaUserCheck className="text-lg text-[#06D001]" />
                            <label className="text-xs font-semibold text-[#06D001]">
                              Activate
                            </label>
                          </button>
                        </div>
                      )}
                    </td>
                  )}
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
          <CreateAccount onClose={() => setCreateClicked(false)} />
        )}
        {isEditClicked && (
          <EditAccount
            onClose={() => setEditClicked(false)}
            userID={selectedUserID}
            userUsername={selectedUsername}
          />
        )}
      </main>
    </>
  );
}

export default Accounts;
