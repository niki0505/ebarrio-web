import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";
import { useContext, useEffect, useState } from "react";
import { InfoContext } from "../context/InfoContext";
import ViewHousehold from "./ViewHousehold";

function Household({ isCollapsed }) {
  const { fetchHouseholds, household } = useContext(InfoContext);
  const [isHouseholdClicked, setHouseholdClicked] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const handleRowClick = (householdID) => {
    setHouseholdClicked(true);
    setSelectedHousehold(householdID);
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Households</div>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Household Name</th>
              <th>Head of the Household</th>
              <th>Address</th>
              <th>Household Size</th>
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
