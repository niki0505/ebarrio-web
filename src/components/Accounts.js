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

//ICONS
import { FaArchive, FaEdit } from "react-icons/fa";
import { FaUserXmark } from "react-icons/fa6";

function Accounts({ isCollapsed }) {
  const navigation = useNavigate();
  const { fetchUsers, users } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [search, setSearch] = useState("");

  const handleAdd = () => {
    setCreateClicked(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  console.log(user);
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

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Users</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />
        <button className="add-btn" onClick={handleAdd}>
          <MdPersonAddAlt1 className=" text-xl" />
          <span className="font-bold">Add new user</span>
        </button>
        <hr className="mt-4 border border-gray-300" />
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5}>No results found</td>
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
                  <td>
                    {user.empID
                      ? user.empID.resID.middlename
                        ? `${user.empID.resID.lastname} ${user.empID.resID.middlename} ${user.empID.resID.firstname}`
                        : `${user.empID.resID.lastname} ${user.empID.resID.firstname}`
                      : user.resID
                      ? user.resID.middlename
                        ? `${user.resID.lastname} ${user.resID.middlename} ${user.resID.firstname}`
                        : `${user.resID.lastname} ${user.resID.firstname}`
                      : "No name available"}
                  </td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>{user.status}</td>
                  <td className="flex justify-center gap-x-8">
                    <div className="table-actions-container">
                      <button type="button" className="table-actions-btn">
                        <FaEdit className="text-xl text-[#06D001]" />
                        <label className="text-xs font-semibold text-[#06D001]">
                          Edit
                        </label>
                      </button>
                    </div>

                    <div className="table-actions-container">
                      <button type="button" className="table-actions-btn">
                        <FaUserXmark className="text-xl text-btn-color-red" />
                        <label className="text-xs font-semibold text-btn-color-red">
                          Deactivate
                        </label>
                      </button>
                    </div>

                    <div className="table-actions-container">
                      <button type="button" className="table-actions-btn">
                        <FaArchive className="text-xl text-btn-color-blue" />
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
      </main>
    </>
  );
}

export default Accounts;
