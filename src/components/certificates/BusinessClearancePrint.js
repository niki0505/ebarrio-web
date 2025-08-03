import React from "react";
import ReactDOM from "react-dom/client";
import BusinessClearance from "../../assets/businessclearance.png";

const BusinessClearancePrint = ({
  certData,
  captainData,
  preparedByData,
  updatedAt,
}) => {
  const printContent = (
    <div id="printContent">
      <div className="id-page">
        <div className="id-page">
          <div
            style={{
              position: "absolute",
              top: "342px",
              left: "470px",
              width: "300px",
              height: "130px",
            }}
          >
            <p style={{ fontSize: "12px", paddingBottom: "4px" }}>
              {certData.resID.middlename
                ? `${certData.resID.firstname.toUpperCase()} ${certData.resID.middlename.substring(
                    0,
                    1
                  )}. ${certData.resID.lastname.toUpperCase()}`
                : `${certData.resID.firstname.toUpperCase()} ${certData.resID.lastname.toUpperCase()}`}
            </p>
            <p style={{ fontSize: "12px", paddingBottom: "6px" }}>
              {certData.businessname.toUpperCase()}
            </p>
            <p style={{ fontSize: "12px", paddingBottom: "7px" }}>
              {certData.lineofbusiness}
            </p>
            <p style={{ fontSize: "12px", paddingBottom: "7px" }}>
              {certData.locationofbusiness === "Resident's Address"
                ? `${certData.resID.address}`
                : `${certData.locationofbusiness}`}
            </p>
            <p style={{ fontSize: "12px" }}>
              {certData.locationofbusiness === "Resident's Address"
                ? "same as above"
                : `${certData.resID.address}`}
            </p>
          </div>

          <div
            style={{
              position: "absolute",
              top: "607px",
              left: "345px",
              width: "30px",
              height: "20px",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                fontStyle: "italic",
                textDecoration: "underline",
              }}
            >
              {(() => {
                const fullDate = updatedAt.substring(
                  0,
                  updatedAt.indexOf(" at")
                );
                const [, date] = fullDate.split(" ");
                const numericDate = parseInt(date.replace(",", ""));

                const getOrdinalSuffix = (n) => {
                  const s = ["th", "st", "nd", "rd"];
                  const v = n % 100;
                  return n + (s[(v - 20) % 10] || s[v] || s[0]);
                };

                return getOrdinalSuffix(numericDate);
              })()}
            </p>
          </div>

          <div
            style={{
              position: "absolute",
              top: "607px",
              left: "405px",
              width: "65px",
              height: "20px",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                fontStyle: "italic",
              }}
            >
              {(() => {
                const fullDate = updatedAt.substring(
                  0,
                  updatedAt.indexOf(" at")
                );
                const [month, , year] = fullDate.split(" ");
                return `${month} ${year}`;
              })()}
            </p>
          </div>

          <div
            style={{
              position: "absolute",
              top: "700px",
              left: "565px",
              width: "200px",
              height: "65px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexDirection: "column",
              fontWeight: "bold",
            }}
          >
            <img
              style={{ width: "75px", height: "75px" }}
              src={preparedByData.signature}
            />
            <p style={{ fontSize: "12px" }}>
              {preparedByData.name.toUpperCase()}
            </p>
          </div>

          <div
            style={{
              position: "absolute",
              top: "833px",
              left: "565px",
              width: "200px",
              height: "65px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexDirection: "column",
              fontWeight: "bold",
            }}
          >
            <img
              style={{ width: "75px", height: "75px" }}
              src={captainData.resID.signature}
            />
            <p style={{ fontSize: "12px" }}>
              {captainData.resID.middlename
                ? `${captainData.resID.firstname.toUpperCase()} ${captainData.resID.middlename.substring(
                    0,
                    1
                  )}. ${captainData.resID.lastname.toUpperCase()}`
                : `${captainData.resID.firstname.toUpperCase()} ${captainData.resID.lastname.toUpperCase()}`}
            </p>
          </div>

          <div
            style={{
              position: "absolute",
              top: "983px",
              left: "655px",
              width: "105px",
              height: "93px",
            }}
          >
            <img
              style={{ width: "100%", height: "100%" }}
              src={certData.certID.qrCode}
              alt="QR Code"
            />
          </div>

          <div
            style={{
              position: "absolute",
              top: "1010px",
              left: "110px",
              width: "100px",
              height: "70px",
            }}
          >
            <p style={{ fontSize: "11px", paddingBottom: "4px" }}>
              {certData.certID.controlNumber}
            </p>
            <p style={{ fontSize: "11px", paddingBottom: "5px" }}>
              {updatedAt.substring(0, updatedAt.indexOf(" at"))}
            </p>
            <p style={{ fontSize: "11px" }}>
              {updatedAt.substring(updatedAt.indexOf("at") + 3).trim()}
            </p>
          </div>
          <img className="id-img" src={BusinessClearance} />
        </div>
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

  window.onbeforeprint = () => {
    console.log("Barangay Indigency is generated.");
  };
  window.onafterprint = () => {
    console.log("Barangay Indigency is issued.");
    document.body.removeChild(printDiv);
    document.head.removeChild(printStyle);
  };

  setTimeout(() => {
    window.print();
  }, 3000);

  return null;
};

export default BusinessClearancePrint;
