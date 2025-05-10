import React from "react";
import ReactDOM from "react-dom/client";
import Sumbong from "../../assets/sumbong.png";
import Kasunduan from "../../assets/kasunduan.png";

const BlotterPrint = ({ blotterData }) => {
  const printContent = (
    <div id="printContent">
      {/* 1st Page (Sumbong) */}

      <div className="id-page">
        {/* MGA MAYSUMBONG */}
        <div
          style={{
            position: "absolute",
            top: "199px",
            left: "80px",
            width: "255px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "224px",
            left: "80px",
            width: "255px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        {/* MGA IPINAGSUSUMBONG */}
        <div
          style={{
            position: "absolute",
            top: "295px",
            left: "80px",
            width: "255px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "320px",
            left: "80px",
            width: "255px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        {/* USAPING BARANGAY BLG. */}
        <div
          style={{
            position: "absolute",
            top: "199px",
            left: "600px",
            width: "117px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        {/* UKOL SA */}
        <div
          style={{
            position: "absolute",
            top: "224px",
            left: "520px",
            width: "197px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "248px",
            left: "460px",
            width: "255px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "273px",
            left: "460px",
            width: "255px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        {/* SUMBONG */}
        <div
          style={{
            position: "absolute",
            top: "485px",
            left: "80px",
            width: "635px",
            height: "275px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        {/* GINAGAWA NGAYONG IKA */}
        <div
          style={{
            position: "absolute",
            top: "860px",
            left: "210px",
            width: "35px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "856px",
            left: "355px",
            width: "80px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "857px",
            left: "467px",
            width: "35px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>TEXT</p>
        </div>

        {/* MGA MAYSUMBONG */}
        <div
          style={{
            position: "absolute",
            top: "903px",
            left: "545px",
            width: "170px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        {/* TINANGGAP AT INIHAIN */}
        <div
          style={{
            position: "absolute",
            top: "977px",
            left: "275px",
            width: "35px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "977px",
            left: "420px",
            width: "80px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "977px",
            left: "535px",
            width: "35px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>TEXT</p>
        </div>

        {/* PUNONG BARANGAY */}
        <div
          style={{
            position: "absolute",
            top: "1025px",
            left: "545px",
            width: "170px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        <img className="id-img" src={Sumbong} />
      </div>

      <div className="id-page">
        {/* 2nd Page (Kasunduan ng Pag aayos) */}

        {/* MGA MAYSUMBONG */}
        <div
          style={{
            position: "absolute",
            top: "1322px",
            left: "80px",
            width: "255px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "1348px",
            left: "80px",
            width: "255px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        {/* MGA IPINAGSUSUMBONG */}
        <div
          style={{
            position: "absolute",
            top: "1419px",
            left: "80px",
            width: "255px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "1444px",
            left: "80px",
            width: "255px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        {/* USAPING BARANGAY BLG. */}
        <div
          style={{
            position: "absolute",
            top: "1322px",
            left: "600px",
            width: "117px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        {/* UKOL SA */}
        <div
          style={{
            position: "absolute",
            top: "1347px",
            left: "520px",
            width: "197px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "1371px",
            left: "460px",
            width: "255px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "1395px",
            left: "460px",
            width: "255px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        {/* KASUNDUAN NG PAG-AAYOS */}
        <div
          style={{
            position: "absolute",
            top: "1543px",
            left: "77px",
            width: "635px",
            height: "275px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        {/* PINAGKASUNDUAN NGAYONG IKA */}
        <div
          style={{
            position: "absolute",
            top: "1865px",
            left: "284px",
            width: "35px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "1862px",
            left: "430px",
            width: "80px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "1862px",
            left: "540px",
            width: "35px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>TEXT</p>
        </div>

        {/* MGA MAYSUMBONG */}
        <div
          style={{
            position: "absolute",
            top: "1934px",
            left: "110px",
            width: "167px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "1963px",
            left: "110px",
            width: "167px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        {/* MGA IPINAGSUSUMBONG */}
        <div
          style={{
            position: "absolute",
            top: "1934px",
            left: "510px",
            width: "167px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "1963px",
            left: "510px",
            width: "167px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        {/* WITNESS BY */}
        <div
          style={{
            position: "absolute",
            top: "2003px",
            left: "312px",
            width: "167px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>

        {/* PUNONG BARANGAY */}
        <div
          style={{
            position: "absolute",
            top: "2150px",
            left: "547px",
            width: "167px",
            height: "20px",
            border: "1px solid red",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
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
