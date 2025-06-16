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
    const doc = new jsPDF("landscape", "mm", [722.54, 472.44]);
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    const title = "HOUSEHOLD PROFILING FORM";
    const titleWidth =
      (doc.getStringUnitWidth(title) * doc.internal.getFontSize()) /
      doc.internal.scaleFactor;
    doc.text(title, (pageWidth - titleWidth) / 2, margin + 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);

    doc.text(`Municipality/City/District:`, margin, 40);
    doc.line(margin + 58, 40, margin + 150, 40);
    doc.text(`Province:`, margin, 48);
    doc.line(margin + 28, 48, margin + 150, 48);
    doc.text(`Interviewed by:`, margin + 170, 40);
    doc.line(margin + 205, 40, margin + 300, 40);
    doc.text(`Reviewed by:`, margin + 170, 48);
    doc.line(margin + 205, 48, margin + 300, 48);
    const dateBoxX = pageWidth - margin - 80;
    const dateBoxY = margin + 10;
    doc.setLineWidth(0.5);
    doc.rect(dateBoxX, dateBoxY, 80, 35);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Date of Visit (mm/dd/yy)", dateBoxX + 40, dateBoxY + 7, {
      align: "center",
    });
    doc.line(dateBoxX, dateBoxY + 10, dateBoxX + 80, dateBoxY + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("First Quarter:", dateBoxX + 2, dateBoxY + 15);
    doc.text("Second Quarter:", dateBoxX + 2, dateBoxY + 21);
    doc.text("Third Quarter:", dateBoxX + 2, dateBoxY + 27);
    doc.text("Fourth Quarter:", dateBoxX + 2, dateBoxY + 33);

    const members = [
      {
        sitio: "Sample Sitio",
        lastname: "Doe",
        firstname: "John",
        middlename: "A.",
        barangay: "Sample Barangay",
        hhNumber: "HH001",
        relationshipToHHHead: "Self",
        ethnicity: "Non-IP Household",
        tribe: "",
        sociostatus: "NHTS 4Ps",
        nhtsNo: "12345",
        waterSource: "LEVEL III - Individual Connection",
        toiletfacility: "A - Pour/flush type connected to septic tank",
        memberName: "Doe, John A.",
        relationship: "1 - Head",
        sex: "M",
        dateOfBirth: "01/15/1990",
        civilStatus: "M - Married",
        philhealthId: "PH1234567890",
        membershipType: "M - Member",
        philhealthCategory: "FEG - Formal Economy Government",
        medicalHistory: "HPN - Hypertension",
        lmp: "N/A",
        fpMethodUsed: "Y - Yes",
        familyPlanningMethod: "IUD",
        fpStatus: "CU",
        ageQ1: "35",
        classQ1: "AD",
        ageQ2: "",
        classQ2: "",
        ageQ3: "",
        classQ3: "",
        ageQ4: "",
        classQ4: "",
        educationalAttainment: "CG - College Graduate",
        religion: "Roman Catholic",
        remarks: "Employed as Teacher",
      },
    ];

    autoTable(doc, {
      startY: 60,
      margin: { left: margin, right: margin },
      head: [
        [
          { content: "Household Information", colSpan: 3 },
          { content: "Name of Respondent", colSpan: 3 },
          { content: "Ethnicity (Please Tick)", colSpan: 3 },
          { content: "Socioeconomic Status (Please Tick)", colSpan: 3 },
          { content: "Environmental Health Data", colSpan: 14 },
        ],
      ],
      body: [
        [
          {
            content: `Sitio/Purok: ${members[0]?.sitio || ""}`,
            colSpan: 3,
            styles: {
              fontSize: 11,
            },
          },
          {
            content: `Lastname: ${members[0]?.lastname || ""}`,
            colSpan: 3,
            styles: {
              fontSize: 11,
            },
          },
          {
            content:
              `${
                members[0]?.ethnicity === "IP Household" ? "[x]" : "[ ]"
              } IP Household\n` +
              `If IP Household, indicate tribe: ${members[0]?.tribe || ""}`,
            rowSpan: 2,
            colSpan: 3,
            styles: { valign: "top", fontSize: 11 },
          },
          {
            content:
              `${
                members[0]?.sociostatus === "NHTS 4Ps" ? "[x]" : "[ ]"
              } NHTS 4Ps\n` +
              `${
                members[0]?.sociostatus === "NHTS Non-4Ps" ? "[x]" : "[ ]"
              } NHTS Non-4Ps\n` +
              `${
                members[0]?.sociostatus === "Non-NHTS" ? "[x]" : "[ ]"
              } Non-NHTS\n\n` +
              `If NHTS, please indicate the NHTS No.: ${
                members[0]?.nhtsNo || ""
              }`,
            rowSpan: 3,
            colSpan: 3,
            styles: { valign: "top", fontSize: 11 },
          },
          {
            content: `Type of Water Source: ${members[0]?.waterSource || ""}`,
            colSpan: 3,
            styles: { fontSize: 11 },
          },
          {
            content: `Type of Toilet Facility: ${
              members[0]?.toiletfacility || ""
            }`,
            colSpan: 9,
            styles: { fontSize: 11 },
          },
          { content: "", colSpan: 2 },
        ],
        [
          {
            content: `Barangay: ${members[0]?.barangay || "N/A"}`,
            colSpan: 3,
            styles: { fontSize: 11 },
          },
          {
            content: `First Name: ${members[0]?.firstname || "N/A"}`,
            colSpan: 3,
            styles: { fontSize: 11 },
          },
          {
            content: `select from the following:\n\nLEVEL I - Point Source\nLEVEL II - Communal Faucet\nLEVEL III - Individual Connection\nOthers - For doubtful sources, open dug well etc.\n\n*write the type of toilet facility in the box provided`,
            rowSpan: 3,
            colSpan: 3,
            styles: { fontSize: 10, valign: "top" },
          },
          {
            content:
              `select from the following:\n\n` +
              `A - Poor/flush type connected to septic tank           E - Overhung latrine\n` +
              `B - Pour/flush toilet connected to septic tank AND to sewerage system           F - Open pit latrine\n` +
              `C - Ventilated Pit latrine                                        G - Without toilet\n` +
              `D - Water-sealed toilet\n\n` +
              `*write the type of toilet facility in the box provided`,
            rowSpan: 3,
            colSpan: 11,
            styles: { fontSize: 10, valign: "top" },
          },
        ],
        [
          {
            content: `Household (HH) Number: ${members[0]?.hhNumber || "N/A"}`,
            colSpan: 3,
            styles: { fontSize: 11 },
          },
          {
            content: `Middle Name: ${members[0]?.middlename || "N/A"}`,
            colSpan: 3,
            styles: { fontSize: 11 },
          },

          { content: "", colSpan: 3 },
        ],
        [
          { content: "", colSpan: 3 },
          {
            content: `Relationship to HH Head: ${
              members[0]?.relationshipToHHHead || "N/A"
            }`,
            colSpan: 3,
            styles: { fontSize: 11 },
          },
          {
            content: `${
              members[0]?.ethnicity === "Non-IP Household" ? "[x]" : "[ ]"
            } Non-IP Household\n`,
            rowSpan: 1,
            colSpan: 3,
            styles: { valign: "top", fontSize: 11 },
          },
          { content: "", colSpan: 3 },
          { content: "", colSpan: 3 },
        ],

        [
          {
            content: `Name of Household Members`,
            colSpan: 3,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            content: `Relationship of members to HH Head`,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            content: `Sex`,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            content: `Date of Birth`,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            content: `Civil Status`,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            content: `Philheath ID Number`,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            content: `Membership Type`,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            content: `Philhealth Category`,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            content: `Medical History`,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            content: `Last Menstrual Period (LMP)`,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            content: `Women of Reproductive Age`,
            colSpan: 3,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            content: `Classification by Age/Health Risk Group`,
            colSpan: 8,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            content: `Educational Attainment`,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            content: `Religion`,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            content: `Remarks`,
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
        ],
        [
          {
            colSpan: 3,
            content:
              "(Please provide the names of the members of the household starting from the household head followed by the spouse, son/daughter (oldest to youngest), and other members)",
            style: {
              fontSize: 10,
              halign: "center",
              valign: "center",
            },
          },
          {
            colSpan: 1,
            rowSpan: 2,
            content:
              "1 - Head\n2-Spouse\n3 - Son\n4 - Daughter\n5 - Others, specify relation",
            styles: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            rowSpan: 2,
            content: "M - Male\nF - Female",
            styles: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            rowSpan: 2,
            content: "Write the birthday in this date format:mm/dd/yyyy",
            styles: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            rowSpan: 2,
            content:
              "M - Married\nS - Single\nW - Widow-er\nSP - Separated\nC - Cohabitation",
            styles: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            rowSpan: 2,
            content: "",
          },
          {
            colSpan: 1,
            rowSpan: 2,
            content: "M - Member\nD - Dependent",
            styles: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            rowSpan: 2,
            content:
              "FEP - Formal Economy Private\nFEG - Formal Economy Government\nIE - Informal Economy\nN - NHTS\nSC - Senior Citizen\nIP - Indigenous People\nU - Unknown",
            styles: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            rowSpan: 2,
            content:
              "HPN - Hypertension\nDB - Diabetes\nTB - Tuberculosis\nS - Surgery",
            styles: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            rowSpan: 2,
            content: "Write the LMP in this date format:mm/dd/yyyy",
            styles: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            content: "Using any FP method?",
            styles: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            content: "Family Planning Method Used",
            styles: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            content: "FP Status",
            styles: {
              fontSize: 11,
            },
          },
          {
            colSpan: 8,
            content: `N  - Newborn                    AB - Adult > 25 y.o
P  - Pregnant                   AP - Adolescent Pregnant
SC - Senior Citizen             PP - Postpartum
WRA - Women with Rep. Age       I  - Infant
S  - School of Age (0-5 y.o)    U  - Under 5 y.o
A  - Adolescent (10-19 y.o)     PWD - Person with Disability`,
            styles: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            rowSpan: 2,
            content:
              "N - None\nK - Kinder\nES - Elem Student\nEU - Elem Undergrad\nEG - Elem Graduate\nHS - HS Student\nHU - HS Undergrad\nHG - HS Graduate\nV - Vocational Course\nCS - College Student\nCU - College Undergrad\nCG - College Graduate\nPG - Postgraduate",
            styles: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            rowSpan: 2,
            content:
              "Example:\nRoman Catholic, Christian, INC, Catholic, Islam, Baptist, Born Again, Christian, Buddhism, Church of God, Jehovah's Witness, Protestant, Seventh Day Adventist, LDS-Mormons, Evangelical, Pentecostal, Unknown, Other",
            styles: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            rowSpan: 2,
            content:
              "Write additional notes such as occupation, nutritional status, or any other detail related to each member of the household",
            styles: {
              fontSize: 11,
            },
          },
        ],
        [
          {
            colSpan: 1,
            content: "Last Name",
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            colSpan: 1,
            content: "First Name",
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },
          {
            colSpan: 1,
            content: "Middle Name",
            styles: {
              halign: "center",
              valign: "middle",
              fontStyle: "bold",
              fontSize: 13,
            },
          },

          {
            colSpan: 1,
            content: "Y - Yes\nN - No",
            style: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            content:
              "Choose from the following:COC, POP, Injectables, IUD, Condom, LAM, BTL, Implant, SDM, DPT, Withdrawal, Others",
            style: {
              fontSize: 11,
            },
          },
          {
            colSpan: 1,
            content:
              "NA - New Acceptor\nCU - Current User\nCM - Changing Method\nCC - Changing Clinic\nDO - Dropout\nR - Restarter",
            style: {
              fontSize: 11,
            },
          },
          {
            colSpan: 2,
            content: "1st Quarter",
            style: {
              fontSize: 11,
            },
          },
          {
            colSpan: 2,
            content: "2nd Quarter",
            style: {
              fontSize: 11,
            },
          },
          {
            colSpan: 2,
            content: "3rd Quarter",
            style: {
              fontSize: 11,
            },
          },
          {
            colSpan: 2,
            content: "4th Quarter",
            style: {
              fontSize: 11,
            },
          },
        ],
        [
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          {
            colSpan: 1,
            content: "Age",
            style: {
              fontSize: 10,
            },
          },
          {
            colSpan: 1,
            content: "Class",
            style: {
              fontSize: 10,
            },
          },
          {
            colSpan: 1,
            content: "Age",
            style: {
              fontSize: 10,
            },
          },
          {
            colSpan: 1,
            content: "Class",
            style: {
              fontSize: 10,
            },
          },
          {
            colSpan: 1,
            content: "Age",
            style: {
              fontSize: 10,
            },
          },
          {
            colSpan: 1,
            content: "Class",
            style: {
              fontSize: 10,
            },
          },
          {
            colSpan: 1,
            content: "Age",
            style: {
              fontSize: 10,
            },
          },
          {
            colSpan: 1,
            content: "Class",
            style: {
              fontSize: 10,
            },
          },
          null,
          null,
          null,
        ],

        ...members.map((member) => [
          member.lastname || "",
          member.firstname || "",
          member.middlename || "",
          member.relationship || "",
          member.sex || "",
          member.dateOfBirth || "",
          member.civilStatus || "",
          member.philhealthId || "",
          member.membershipType || "",
          member.philhealthCategory || "",
          member.medicalHistory || "",
          member.lmp || "",
          member.fpMethodUsed || "",
          member.familyPlanningMethod || "",
          member.fpStatus || "",
          member.ageQ1 || "",
          member.classQ1 || "",
          member.ageQ2 || "",
          member.classQ2 || "",
          member.ageQ3 || "",
          member.classQ3 || "",
          member.ageQ4 || "",
          member.classQ4 || "",
          member.educationalAttainment || "",
          member.religion || "",
          member.remarks || "",
        ]),

        ...Array(14 - members.length > 0 ? 14 - members.length : 0).fill([
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ]),
      ],
      columnStyles: {
        0: { cellWidth: 35 }, // Last Name
        1: { cellWidth: 35 }, // First Name
        2: { cellWidth: 35 }, // Middle Name
        3: { cellWidth: 35 }, // Relationship of members
        4: { cellWidth: 18 }, // Sex
        5: { cellWidth: 34 }, // Date of Birth
        6: { cellWidth: 35 }, // Civil Status
        7: { cellWidth: 40 }, // Philhealth ID Number
        8: { cellWidth: 35 }, // Membership Type
        9: { cellWidth: 36 }, // Philhealth Category
        10: { cellWidth: 35 }, // Medical History
        11: { cellWidth: 34 }, // Last Menstrual Period (LMP)
        12: { cellWidth: 20 }, // WRA - Using any FP Method?
        13: { cellWidth: 35 }, // WRA - Family Planning Method Used
        14: { cellWidth: 30 }, // WRA - FP Status
        15: { cellWidth: 14 }, // Classification - Age Q1
        16: { cellWidth: 14 }, // Classification - Class Q1
        17: { cellWidth: 14 }, // Classification - Age Q2
        18: { cellWidth: 14 }, // Classification - Class Q2
        19: { cellWidth: 14 }, // Classification - Age Q3
        20: { cellWidth: 14 }, // Classification - Class Q3
        21: { cellWidth: 14 }, // Classification - Age Q4
        22: { cellWidth: 14 }, // Classification - Class Q4
        23: { cellWidth: 35 }, // Educational Attainment
        24: { cellWidth: 35 }, // Religion
        25: { cellWidth: 28 }, // Remarks
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        fontStyle: "bold",
        fontSize: 14,
        halign: "center",
        valign: "middle",
        lineWidth: 0.5,
        lineColor: 0,
        cellPadding: 1.5,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        halign: "left",
        valign: "top",
        lineWidth: 0.5,
        lineColor: 0,
        cellPadding: 2,
        minCellHeight: 13,
      },
      didParseCell: function (data) {},
      theme: "grid",
    });
    // Footer
    doc.setFontSize(14);
    doc.text(`Exported by: ${user.name}`, margin, pageHeight - margin);
    doc.text(`Exported on: ${now}`, margin, pageHeight - margin + 5);
    doc.text(`Page 1 of 1`, pageWidth - margin - 20, pageHeight - margin);

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
