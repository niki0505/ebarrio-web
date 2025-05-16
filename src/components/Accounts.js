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
    const otherUsers = users.filter((u) => u._id !== user.userID);
    if (search) {
      const filtered = otherUsers.filter((user) => {
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
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(otherUsers);
    }
  }, [search, users]);

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

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Users</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />
        <button
          className="flex items-center w-auto space-x-2 mt-10 cursor-pointer text-btn-color-blue ml-0 sm:ml-auto"
          onClick={handleAdd}
        >
          <MdPersonAddAlt1 className="text-xl" />
          <span className="font-bold">Add new user</span>
        </button>

        <hr className="mt-4 border border-gray-300" />
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>User Role</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6}>No results found</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
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
                  <td className="flex justify-between gap-x-8">
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

                    <div className="table-actions-container">
                      <button type="button" className="table-actions-btn">
                        <FaArchive className="text-lg text-btn-color-blue" />
                        <label className="text-xs font-semibold text-btn-color-blue">
                          Archive
                        </label>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

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
