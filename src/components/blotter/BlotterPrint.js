import React from "react";
import ReactDOM from "react-dom/client";
import Sumbong from "../../assets/sumbong.png";
import Kasunduan from "../../assets/kasunduan.png";

const BlotterPrint = ({ blotterData }) => {
  const printContent = (
    <div id="printContent">
      {/* 1st Page (Sumbong) */}

      {/* Sample box */}
      <div className="id-page">
        <div
          style={{
            position: "absolute",
            top: "342px",
            left: "470px",
            width: "300px",
            height: "130px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 10 }}>Sample text</p>
        </div>
        <img className="id-img" src={Sumbong} />
      </div>
      <div className="id-page">
        {/* 2nd Page (Kasunduan ng Pag aayos) */}

        {/* Sample box */}
        <div
          style={{
            position: "absolute",
            top: "1200px",
            left: "470px",
            width: "300px",
            height: "130px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 10 }}>Sample text</p>
        </div>
        <img className="id-img" src={Kasunduan} />
      </div>
    </div>
  );

  const printDiv = document.createElement("div");
  document.body.appendChild(printDiv);

  const root = ReactDOM.createRoot(printDiv);
  root.render(printContent);

  const printStyle = document.createElement("style");
  printStyle.innerHTML = `
    @page {
      size: A4;
      margin: 0;
    }
    @media screen {
      #printContent, #printContent * {
        display: none;
      }
    }
    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 210mm !important;
        height: 297mm !important;
        overflow: hidden !important;
      }
      body * {
        visibility: hidden;
      }
      #printContent, #printContent * {
        visibility: visible;
      }
      #printContent {
        position: absolute;
        top: 0;
        left: 0;
        width: 210mm;
        height: 297mm;
      }
      .id-page {
        width: 210mm;
        height: 297mm;
        overflow: hidden;
        margin: 0;
        padding: 0;
        page-break-after: avoid;
      }
      .id-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    }
  `;
  document.head.appendChild(printStyle);

  window.onafterprint = () => {
    document.body.removeChild(printDiv);
    document.head.removeChild(printStyle);
  };

  setTimeout(() => {
    window.print();
  }, 2000);

  return null;
};

export default BlotterPrint;
