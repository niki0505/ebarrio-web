import React from "react";
import "../../App.css";
import indigencyimg from "../../resources/indigency.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import { useState, useEffect } from "react";

function BrgyID({ resID }) {
  const [residentInfo, setResidentInfo] = useState([]);

  useEffect(() => {
    const fetchResident = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/getresident/${resID}`
        );
        console.log("Resident Data", response.data);
        setResidentInfo(response.data);
      } catch (error) {
        console.log("Error fetching resident", error);
      }
    };
    fetchResident();
  }, [resID]);

  //   const handlePrint = () => {
  //     // Capture the div containing the certificate
  //     const input = document.getElementById("certificate");

  //     html2canvas(input, { scale: 3 }).then((canvas) => {
  //       const imgData = canvas.toDataURL("image/png");
  //       const pdf = new jsPDF("p", "mm", [216, 279]);
  //       const imgWidth = 216;
  //       const imgHeight = 279;

  //       // Add first page
  //       pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

  //       pdf.save(
  //         `${residentInfo.firstname}${residentInfo.lastname}_brgyindigency.pdf`
  //       ); // Download the PDF
  //     });
  //   };
  return (
    <div className="id-page">
      <h2>Barangay ID Preview</h2>
      <div className="print-area">
        <div className="cr80-card" id="front">
          <p>
            <strong>FRONT</strong>
          </p>
          <p>
            {residentInfo.firstname} {residentInfo.lastname}
          </p>
        </div>
        <div className="cr80-card" id="back">
          <p>
            <strong>BACK</strong>
          </p>
          <p>{residentInfo.address}</p>
        </div>
      </div>
      {/* Optional: If you still want a print button */}
      {/* <button onClick={handlePrint} className="print-btn">
        Print
      </button> */}
    </div>
  );
}

export default BrgyID;
