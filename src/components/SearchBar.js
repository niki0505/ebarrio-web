import React from "react";
import { IoSearch } from "react-icons/io5";
import "../Stylesheets/SearchBar.css";

const Searchbar = () => {
  return (
    <>
      <div className="search-container">
        <div className="search-items">
          <IoSearch className="text-gray-500" />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
      </div>
    </>
  );
};

export default Searchbar;
