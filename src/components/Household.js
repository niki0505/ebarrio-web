import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";
import { useContext, useEffect, useState, useRef } from "react";
import { InfoContext } from "../context/InfoContext";
import ViewHousehold from "./ViewHousehold";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MdArrowDropDown } from "react-icons/md";
import { AuthContext } from "../context/AuthContext";

function Household({ isCollapsed }) {
  const { fetchHouseholds, household } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [isHouseholdClicked, setHouseholdClicked] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [exportDropdown, setexportDropdown] = useState(false);
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

  console.log(household);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Households</div>

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
            {household.map((house, index) => {
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
            })}
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
