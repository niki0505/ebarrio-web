import React from "react";
import { IoSearch } from "react-icons/io5";
import "../Stylesheets/SearchBar.css";

const Searchbar = ({ handleSearch, searchValue }) => {
  return (
    <>
      <div className="search-container">
        <div className="search-items">
          <IoSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="search-input "
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default Searchbar;
