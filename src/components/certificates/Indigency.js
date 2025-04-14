import React from "react";
import "../../App.css";
import indigencyimg from "../../resources/indigency.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import { useState, useEffect } from "react";

function Indigency({ resID }) {
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
  });

  const handlePrint = () => {
    // Capture the div containing the certificate
    const input = document.getElementById("certificate");

    html2canvas(input, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", [216, 279]);
      const imgWidth = 216;
      const imgHeight = 279;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      pdf.save(
        `${residentInfo.firstname}${residentInfo.lastname}_brgyindigency.pdf`
      ); // Download the PDF
    });
  };
  return (
    <div>
      <div className="floating-document-container" id="certificate">
        <img
          src={indigencyimg}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      </div>
      <button
        onClick={handlePrint}
        style={{
          position: "absolute",
          bottom: "50px",
          right: "530px",
          backgroundColor: "lightblue",
          color: "black",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        PRINT
      </button>
    </div>
  );
}

export default Indigency;
