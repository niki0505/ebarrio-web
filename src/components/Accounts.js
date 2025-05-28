import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/CommonStyle.css";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import CreateAccount from "./CreateAccount";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import EditAccount from "./EditAccount";

//ICONS
import { FaArchive, FaEdit } from "react-icons/fa";
import { FaUserXmark } from "react-icons/fa6";
import { MdArrowDropDown } from "react-icons/md";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

function Accounts({ isCollapsed }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { fetchUsers, users } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [isEditClicked, setEditClicked] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUserID, setSelectedUserID] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState(null);

  const [isCurrentClicked, setCurrentClicked] = useState(true);
  const [isPendingClicked, setPendingClicked] = useState(false);
  const [isArchivedClicked, setArchivedClicked] = useState(false);

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);
  const totalRows = filteredUsers.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

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
            <button className="add-container" onClick={handleAdd}>
              <MdPersonAddAlt1 className="text-xl" />
              <span className="font-bold">Add new user</span>
            </button>
          )}
        </div>

        <hr className="mt-4 border border-gray-300" />
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>User Role</th>
              <th>Status</th>
              <th>Date Created</th>
              {(isPendingClicked || isCurrentClicked) && <th>Action</th>}
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={isArchivedClicked ? 5 : 6}>No results found</td>
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
                  <td>{user.status}</td>
                  <td></td>
                  {!isArchivedClicked && (
                    <td className="flex justify-between gap-x-3 px-5">
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
                            <FaUserXmark className="text-lg text-btn-color-red" />
                            <label className="text-xs font-semibold text-btn-color-red">
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
