import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";
import { useContext, useEffect, useState, useRef } from "react";
import { InfoContext } from "../context/InfoContext";
import ViewHousehold from "./ViewHousehold";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MdArrowDropDown } from "react-icons/md";
import { AuthContext } from "../context/AuthContext";
import SearchBar from "./SearchBar";

function Household({ isCollapsed }) {
  const { fetchHouseholds, household } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [isHouseholdClicked, setHouseholdClicked] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [exportDropdown, setexportDropdown] = useState(false);
  const [isActiveClicked, setActiveClicked] = useState(true);
  const [isPendingClicked, setPendingClicked] = useState(false);
  const [isChangeClicked, setChangedClicked] = useState(false);
  const [filteredHousehold, setFilteredHousehold] = useState([]);
  const [search, setSearch] = useState("");
  const exportRef = useRef(null);

  const toggleExportDropdown = () => {
    setexportDropdown(!exportDropdown);
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const handleRowClick = (householdID) => {
    setHouseholdClicked(true);
    setSelectedHousehold(householdID);
  };

  const exportPDF = async () => {
    const now = new Date().toLocaleString();
    const doc = new jsPDF("landscape", "mm", "a4");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Footer
    doc.setFontSize(10);
    doc.text(`Exported by: ${user.name}`, 10, pageHeight - 15);
    doc.text(`Exported on: ${now}`, 10, pageHeight - 10);
    doc.text(`Page 1 of 1`, pageWidth - 30, pageHeight - 10);

    doc.save("Household_Profile.pdf");
  };

  const handleMenu1 = () => {
    setActiveClicked(true);
    setPendingClicked(false);
    setChangedClicked(false);
  };
  const handleMenu2 = () => {
    setPendingClicked(true);
    setActiveClicked(false);
    setChangedClicked(false);
  };
  const handleMenu3 = () => {
    setChangedClicked(true);
    setPendingClicked(false);
    setActiveClicked(false);
  };

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, "");
    setSearch(sanitizedText);
  };

  useEffect(() => {
    let filtered = household;
    if (isActiveClicked) {
      filtered = household.filter((res) => res.status === "Active");
    } else if (isPendingClicked) {
      filtered = household.filter((res) => res.status === "Pending");
    } else if (isChangeClicked) {
      filtered = household.filter((res) => res.status === "Change Requested");
    }

    if (search) {
      const searchParts = search.toLowerCase().split(" ").filter(Boolean);
      filtered = filtered.filter((resident) => {
        const first = resident.firstname || "";
        const middle = resident.middlename || "";
        const last = resident.lastname || "";

        const fullName = `${first} ${middle} ${last}`.trim().toLowerCase();

        return searchParts.every(
          (part) =>
            fullName.includes(part) ||
            resident.address.toLowerCase().includes(part)
        );
      });
    }
    setFilteredHousehold(filtered);
  }, [search, household, isActiveClicked, isPendingClicked]);

  console.log(household);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Households</div>
        <SearchBar handleSearch={handleSearch} searchValue={search} />

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
              isPendingClicked ? "status-line" : "text-[#808080]"
            }`}
          >
            Pending
          </p>
          <p
            onClick={handleMenu3}
            className={`status-text ${
              isChangeClicked ? "status-line" : "text-[#808080]"
            }`}
          >
            Change Requested
          </p>
        </div>
        {isActiveClicked && (
          <div className="flex flex-row gap-x-2 mt-4">
            <div className="relative" ref={exportRef}>
              {/* Export Button */}
              <div
                className="relative flex items-center bg-[#fff] border-[#0E94D3] h-7 px-2 py-4 cursor-pointer appearance-none border rounded"
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
                      <li className="px-4 text-sm cursor-pointer text-[#0E94D3]">
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
        )}

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Household Name</th>
              <th>Head of the Household</th>
              <th>Address</th>
              <th>Household Size</th>
              <th>Number of Vehicles</th>
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {filteredHousehold.length === 0 ? (
              <tr className="bg-white">
                <td colSpan={6}>No results found</td>
              </tr>
            ) : (
              filteredHousehold.map((house, index) => {
                const headMember = house.members.find(
                  (member) => member.position === "Head"
                );
                const headName = `${headMember.resID.lastname} ${headMember.resID.firstname}`;
                const householdName = `${headMember.resID.lastname}'s Residence`;
                return (
                  <tr
                    key={index}
                    onClick={() => handleRowClick(house._id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f0f0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                    }}
                  >
                    <td>N/A</td>
                    <td>{householdName}</td>
                    <td>{headName}</td>
                    <td>{headMember.resID.address}</td>
                    <td>{house.members.length}</td>
                    <td>{house.vehicles.length}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {isHouseholdClicked && (
          <ViewHousehold
            onClose={() => setHouseholdClicked(false)}
            householdID={selectedHousehold}
          />
        )}
      </main>
    </>
  );
}

export default Household;
