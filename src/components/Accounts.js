import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/CommonStyle.css";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import CreateAccount from "./CreateAccount";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";

function Accounts({ isCollapsed }) {
  const navigation = useNavigate();
  const { fetchUsers, users } = useContext(InfoContext);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [selectedResID, setSelectedResID] = useState(null);
  const [search, setSearch] = useState("");

  const handleAdd = () => {
    setCreateClicked(true);
  };

  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  //   const buttonClick = (e, resID) => {
  //     e.stopPropagation();
  //     alert(`Clicked ${resID}`);
  //   };

  //   const editBtn = (resID) => {
  //     navigation("/editresident", { state: { resID } });
  //   };

  //   const certBtn = (e, resID) => {
  //     e.stopPropagation();
  //     setSelectedResID(resID);
  //     setCertClicked(true);
  //   };

  //   const archiveBtn = async (e, resID) => {
  //     try {
  //       const response = await axios.delete(
  //         `http://localhost:5000/api/archiveresident/${resID}`
  //       );
  //       alert("Resident successfully archived");
  //       window.location.reload();
  //     } catch (error) {
  //       console.log("Error", error);
  //     }
  //   };

  //   const handleSearch = (text) => {
  //     const lettersOnly = text.replace(/[^a-zA-Z\s.]/g, "");
  //     const capitalizeFirstLetter = lettersOnly
  //       .split(" ")
  //       .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  //       .join(" ");
  //     setSearch(capitalizeFirstLetter);
  //     if (capitalizeFirstLetter) {
  //       const filtered = residents.filter((resident) => {
  //         const first = resident.firstname || "";
  //         const middle = resident.middlename || "";
  //         const last = resident.lastname || "";

  //         return (
  //           first.includes(capitalizeFirstLetter) ||
  //           middle.includes(capitalizeFirstLetter) ||
  //           last.includes(capitalizeFirstLetter) ||
  //           `${first} ${last}`.includes(capitalizeFirstLetter) ||
  //           `${first} ${middle} ${last}`.includes(capitalizeFirstLetter)
  //         );
  //       });
  //       setFilteredResidents(filtered);
  //     } else {
  //       setFilteredResidents(residents);
  //     }
  //   };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Users</div>

        <SearchBar />
        <button className="add-btn" onClick={handleAdd}>
          <MdPersonAddAlt1 className=" text-xl" />
          <span className="font-bold">Add new user</span>
        </button>
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
                  <td className="flex justify-between">
                    <button className="text-btn-color-blue font-bold">
                      ARCHIVE
                    </button>
                    <button className="text-red-600 font-bold">
                      DEACTIVATE
                    </button>
                    <button className="text-green-600 font-bold">EDIT</button>
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
