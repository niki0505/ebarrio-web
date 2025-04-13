// components/Main.js
import React from "react";
import "../Stylesheets/Residents.css";

import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Residents = ({ isCollapsed }) => {
  const navigate = useNavigate();

  const handleAdd = () => {
    navigate("/create-resident");
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Residents</div>

        <SearchBar />

        <btn className="resident-add-btn" onClick={handleAdd}>
          <MdPersonAddAlt1 className=" text-xl" />
          <span className="font-bold">Add new resident</span>
        </btn>
      </main>
    </>
  );
};
export default Residents;
