import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import "../App.css";
import { AuthContext } from "../context/AuthContext";
import { IoClose } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import BrgyIndigency from "../assets/brgyindigency.png";
import BusinessClearance from "../assets/businessclearance.png";
import BrgyClearance from "../assets/brgyclearance.png";
import ReactDOM from "react-dom/client";

function CreateCertificate({ resID, onClose }) {
  const { user } = useContext(AuthContext);
  const [certificateForm, setCertificateForm] = useState({
    typeofcertificate: "",
    amount: "",
    purpose: "",
    businessname: "",
    lineofbusiness: "",
    addressnumber: "",
    street: "",
    locationofbusiness: "",
    ornumber: "",
  });
  const [showModal, setShowModal] = useState(true);

  console.log(certificateForm);

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    if (name === "typeofcertificate") {
      const selectedCert = certificates.find((cert) => cert.name === value);
      setCertificateForm((prev) => ({
        ...prev,
        [name]: value,
        amount: selectedCert ? selectedCert.price : "",
      }));
    } else {
      setCertificateForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCertificateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function uploadToFirebase(url) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `id_qrcode/${Date.now()}_${randomString}.png`;
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  const handleSubmit = async () => {
    const requiredFields =
      certificateFields[certificateForm.typeofcertificate] || [];

    const filteredData = requiredFields.reduce((obj, key) => {
      if (certificateForm[key] !== undefined) {
        obj[key] = certificateForm[key];
      }
      return obj;
    }, {});

    if (
      certificateForm.typeofcertificate === "Barangay Business Clearance" &&
      certificateForm.street
    ) {
      const fullAddress = certificateForm.addressnumber
        ? `${certificateForm.addressnumber} ${certificateForm.street} Aniban 2, Bacoor, Cavite`
        : `${certificateForm.street} Aniban 2, Bacoor, Cavite`;

      filteredData.locationofbusiness = fullAddress;
      delete filteredData.addressnumber;
      delete filteredData.street;
    }

    if (
      certificateForm.typeofcertificate === "Barangay Business Clearance" &&
      certificateForm.street === "Resident's Address"
    ) {
      filteredData.locationofbusiness = certificateForm.street;
      delete filteredData.addressnumber;
      delete filteredData.street;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/generatecertificate",
        { filteredData, resID }
      );
      const qrCode = await uploadToFirebase(response.data.qrCode);
      try {
        const response2 = await axios.put(
          `http://localhost:5000/api/savecertificate/${response.data.certID}`,
          {
            qrCode,
          }
        );
      } catch (error) {
        console.log("Error saving barangay ID", error);
      }
      try {
        const response3 = await axios.get(
          `http://localhost:5000/api/getcertificate/${response.data.certID}`
        );
        const response4 = await axios.get(
          `http://localhost:5000/api/getcaptain/`
        );
        console.log("Captain", response4.data);
        const response5 = await axios.get(
          `http://localhost:5000/api/getprepared/${user.userID}`
        );
        console.log("Get Prepared", response5.data);

        if (response3.data.typeofcertificate === "Barangay Indigency") {
          const printContent = (
            <div id="printContent">
              <div className="id-page">
                <div
                  style={{
                    position: "absolute",
                    top: "295px",
                    left: "294px",
                    width: "126px",
                    height: "120px",
                  }}
                >
                  <img
                    style={{ width: "100%", height: "100%" }}
                    src={response3.data.resID.picture}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "290px",
                    left: "540px",
                    width: "200px",
                    height: "150px",
                  }}
                >
                  <p style={{ fontSize: "12px", paddingBottom: "3px" }}>
                    {response3.data.resID.middlename
                      ? `${response3.data.resID.firstname.toUpperCase()} ${response3.data.resID.middlename.substring(
                          0,
                          1
                        )}. ${response3.data.resID.lastname.toUpperCase()}`
                      : `${response3.data.resID.firstname.toUpperCase()} ${response3.data.resID.lastname.toUpperCase()}`}
                  </p>
                  <p style={{ fontSize: "12px", paddingBottom: "3.5px" }}>
                    {response3.data.resID.birthdate}
                  </p>
                  <p style={{ fontSize: "12px", paddingBottom: "4px" }}>
                    {response3.data.resID.sex}
                  </p>
                  <p style={{ fontSize: "12px", paddingBottom: "5px" }}>
                    {response3.data.resID.civilstatus}
                  </p>
                  <p style={{ fontSize: "12px", paddingBottom: "5px" }}>
                    {response3.data.resID.nationality}
                  </p>
                  <p style={{ fontSize: "12px" }}>PRECINCT</p>
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "426px",
                    left: "360px",
                    width: "250px",
                    height: "20px",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>
                    {response3.data.resID.address}
                  </p>
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "630px",
                    left: "296px",
                    width: "250px",
                    height: "20px",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>{response3.data.purpose}</p>
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "673px",
                    left: "385px",
                    width: "250px",
                    height: "20px",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>
                    {response.data.createdAt.substring(
                      0,
                      response.data.createdAt.indexOf(" at")
                    )}
                  </p>
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "700px",
                    left: "335px",
                    width: "160px",
                    height: "65px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    flexDirection: "column",
                  }}
                >
                  <img
                    style={{ width: "100%", height: "100%" }}
                    src={response3.data.resID.signature}
                  />
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
                    src={response5.data.signature}
                  />
                  <p style={{ fontSize: "12px" }}>
                    {response5.data.name.toUpperCase()}
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
                    src={response4.data.resID.signature}
                  />
                  <p style={{ fontSize: "12px" }}>
                    {response4.data.resID.middlename
                      ? `${response4.data.resID.firstname.toUpperCase()} ${response4.data.resID.middlename.substring(
                          0,
                          1
                        )}. ${response4.data.resID.lastname.toUpperCase()}`
                      : `${response4.data.resID.firstname.toUpperCase()} ${response4.data.resID.lastname.toUpperCase()}`}
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
                    src={response3.data.certID.qrCode}
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
                    {response3.data.certID.controlNumber}
                  </p>
                  <p style={{ fontSize: "11px", paddingBottom: "5px" }}>
                    {response.data.createdAt.substring(
                      0,
                      response.data.createdAt.indexOf(" at")
                    )}
                  </p>
                  <p style={{ fontSize: "11px" }}>
                    {response.data.createdAt
                      .substring(response.data.createdAt.indexOf("at") + 3)
                      .trim()}
                  </p>
                </div>
                <img className="id-img" src={BrgyIndigency} />
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
          }, 2000);
        } else if (response3.data.typeofcertificate === "Barangay Clearance") {
          const printContent = (
            <div id="printContent">
              <div className="id-page">
                <div
                  style={{
                    position: "absolute",
                    top: "295px",
                    left: "294px",
                    width: "126px",
                    height: "120px",
                  }}
                >
                  <img
                    style={{ width: "100%", height: "100%" }}
                    src={response3.data.resID.picture}
                  />
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: "290px",
                    left: "540px",
                    width: "200px",
                    height: "150px",
                  }}
                >
                  <p style={{ fontSize: "12px", paddingBottom: "3px" }}>
                    {response3.data.resID.middlename
                      ? `${response3.data.resID.firstname.toUpperCase()} ${response3.data.resID.middlename.substring(
                          0,
                          1
                        )}. ${response3.data.resID.lastname.toUpperCase()}`
                      : `${response3.data.resID.firstname.toUpperCase()} ${response3.data.resID.lastname.toUpperCase()}`}
                  </p>
                  <p style={{ fontSize: "12px", paddingBottom: "3.5px" }}>
                    {response3.data.resID.birthdate}
                  </p>
                  <p style={{ fontSize: "12px", paddingBottom: "4px" }}>
                    {response3.data.resID.sex}
                  </p>
                  <p style={{ fontSize: "12px", paddingBottom: "5px" }}>
                    {response3.data.resID.civilstatus}
                  </p>
                  <p style={{ fontSize: "12px", paddingBottom: "5px" }}>
                    {response3.data.resID.nationality}
                  </p>
                  <p style={{ fontSize: "12px" }}>PRECINCT</p>
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "426px",
                    left: "360px",
                    width: "250px",
                    height: "20px",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>
                    {response3.data.resID.address}
                  </p>
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "630px",
                    left: "296px",
                    width: "250px",
                    height: "20px",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>{response3.data.purpose}</p>
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "673px",
                    left: "385px",
                    width: "250px",
                    height: "20px",
                    fontWeight: "bold",
                  }}
                >
                  <p style={{ fontSize: "12px" }}>
                    {response.data.createdAt.substring(
                      0,
                      response.data.createdAt.indexOf(" at")
                    )}
                  </p>
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "700px",
                    left: "335px",
                    width: "160px",
                    height: "65px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    flexDirection: "column",
                  }}
                >
                  <img
                    style={{ width: "100%", height: "100%" }}
                    src={response3.data.resID.signature}
                  />
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
                    src={response5.data.signature}
                  />
                  <p style={{ fontSize: "12px" }}>
                    {response5.data.name.toUpperCase()}
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
                    src={response4.data.resID.signature}
                  />
                  <p style={{ fontSize: "12px" }}>
                    {response4.data.resID.middlename
                      ? `${response4.data.resID.firstname.toUpperCase()} ${response4.data.resID.middlename.substring(
                          0,
                          1
                        )}. ${response4.data.resID.lastname.toUpperCase()}`
                      : `${response4.data.resID.firstname.toUpperCase()} ${response4.data.resID.lastname.toUpperCase()}`}
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
                    src={response3.data.certID.qrCode}
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
                    {response3.data.certID.controlNumber}
                  </p>
                  <p style={{ fontSize: "11px", paddingBottom: "5px" }}>
                    {response.data.createdAt.substring(
                      0,
                      response.data.createdAt.indexOf(" at")
                    )}
                  </p>
                  <p style={{ fontSize: "11px" }}>
                    {response.data.createdAt
                      .substring(response.data.createdAt.indexOf("at") + 3)
                      .trim()}
                  </p>
                </div>
                <img className="id-img" src={BrgyClearance} />
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
            console.log("Barangay Clearance is generated.");
          };
          window.onafterprint = () => {
            console.log("Barangay Clearance is issued.");
            document.body.removeChild(printDiv);
            document.head.removeChild(printStyle);
          };

          setTimeout(() => {
            window.print();
          }, 2000);
        } else if (
          response3.data.typeofcertificate === "Barangay Business Clearance"
        ) {
          const printContent = (
            <div id="printContent">
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
                    {response3.data.resID.middlename
                      ? `${response3.data.resID.firstname.toUpperCase()} ${response3.data.resID.middlename.substring(
                          0,
                          1
                        )}. ${response3.data.resID.lastname.toUpperCase()}`
                      : `${response3.data.resID.firstname.toUpperCase()} ${response3.data.resID.lastname.toUpperCase()}`}
                  </p>
                  <p style={{ fontSize: "12px", paddingBottom: "6px" }}>
                    {response3.data.businessname.toUpperCase()}
                  </p>
                  <p style={{ fontSize: "12px", paddingBottom: "7px" }}>
                    {response3.data.lineofbusiness}
                  </p>
                  <p style={{ fontSize: "12px", paddingBottom: "7px" }}>
                    {response3.data.locationofbusiness === "Resident's Address"
                      ? `${response3.data.resID.address}`
                      : `${response3.data.locationofbusiness}`}
                  </p>
                  <p style={{ fontSize: "12px" }}>
                    {response3.data.locationofbusiness === "Resident's Address"
                      ? "same as above"
                      : `${response3.data.resID.address}`}
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
                      const fullDate = response.data.createdAt.substring(
                        0,
                        response.data.createdAt.indexOf(" at")
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
                      const fullDate = response.data.createdAt.substring(
                        0,
                        response.data.createdAt.indexOf(" at")
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
                    src={response5.data.signature}
                  />
                  <p style={{ fontSize: "12px" }}>
                    {response5.data.name.toUpperCase()}
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
                    src={response4.data.resID.signature}
                  />
                  <p style={{ fontSize: "12px" }}>
                    {response4.data.resID.middlename
                      ? `${response4.data.resID.firstname.toUpperCase()} ${response4.data.resID.middlename.substring(
                          0,
                          1
                        )}. ${response4.data.resID.lastname.toUpperCase()}`
                      : `${response4.data.resID.firstname.toUpperCase()} ${response4.data.resID.lastname.toUpperCase()}`}
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
                    src={response3.data.certID.qrCode}
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
                    {response3.data.certID.controlNumber}
                  </p>
                  <p style={{ fontSize: "11px", paddingBottom: "5px" }}>
                    {response.data.createdAt.substring(
                      0,
                      response.data.createdAt.indexOf(" at")
                    )}
                  </p>
                  <p style={{ fontSize: "11px" }}>
                    {response.data.createdAt
                      .substring(response.data.createdAt.indexOf("at") + 3)
                      .trim()}
                  </p>
                </div>
                <img className="id-img" src={BusinessClearance} />
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
            console.log("Barangay Clearance is generated.");
          };
          window.onafterprint = () => {
            console.log("Barangay Clearance is issued.");
            document.body.removeChild(printDiv);
            document.head.removeChild(printStyle);
          };

          setTimeout(() => {
            window.print();
          }, 2000);
        }
        setTimeout(() => {
          handleClose();
        }, 3000);
      } catch (error) {
        console.log("Error generating barangay certificate", error);
      }
    } catch (error) {
      console.log("Error generating barangay certificate", error);
    }
  };

  const certificates = [
    { name: "Barangay Indigency", price: "₱10.00" },
    { name: "Barangay Clearance", price: "₱10.00" },
    { name: "Barangay Business Clearance", price: "₱30.00" },
  ];

  const certificateFields = {
    "Barangay Indigency": ["typeofcertificate", "purpose", "amount"],
    "Barangay Clearance": ["typeofcertificate", "purpose", "amount"],
    "Barangay Business Clearance": [
      "typeofcertificate",
      "addressnumber",
      "street",
      "businessname",
      "lineofbusiness",
      "amount",
    ],
  };

  const streetList = [
    "Zapote-Molino Road",
    "1st Street",
    "2nd Street",
    "3rd Street",
    "4th Street",
    "5th Street",
    "6th Street",
    "8th Street",
    "8th Street Exnt",
    "5th Street Exnt",
    "Dominga Rivera Street",
    "Tabing-Ilog Street",
    "Arko",
    "9th Street",
    "10th Street",
    "11th Street",
    "Resident's Address",
  ];

  const purpose = ["ALS Requirement", "Financial Assistance"];
  const handleClose = () => {
    setShowModal(false);
    onClose();
  };
  return (
    <>
      {setShowModal && (
        <div className="modal-container">
          <div className="modal-content w-[20rem] h-[30rem] ">
            <div className="modal-title-bar">
              <h1 className="modal-title">Create Certificate</h1>
              <button className="modal-btn-close">
                <IoClose className="btn-close-icon" onClick={handleClose} />
              </button>
            </div>

            <form
              className="employee-form-container"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="employee-form-group">
                <label for="typeofcertificate" className="form-label">
                  Type of Certificate<label className="text-red-600">*</label>
                </label>
                <select
                  id="typeofcertificate"
                  name="typeofcertificate"
                  onChange={handleDropdownChange}
                  required
                  className="form-input"
                >
                  <option value="" disabled selected hidden>
                    Select
                  </option>
                  {certificates.map((element) => (
                    <option value={element.name}>{element.name}</option>
                  ))}
                </select>
              </div>

              {["Barangay Indigency", "Barangay Clearance"].includes(
                certificateForm.typeofcertificate
              ) && (
                <div className="employee-form-group">
                  <label htmlFor="purpose" className="form-label">
                    Purpose<span className="text-red-600">*</span>
                  </label>
                  <select
                    id="purpose"
                    name="purpose"
                    onChange={handleDropdownChange}
                    required
                    className="form-input"
                  >
                    <option value="" disabled selected hidden>
                      Select
                    </option>
                    {purpose.map((element, index) => (
                      <option key={index} value={element}>
                        {element}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {certificateForm.typeofcertificate ===
                "Barangay Business Clearance" && (
                <>
                  {certificateForm.street &&
                    certificateForm.street !== "Resident's Address" && (
                      <div className="employee-form-group">
                        <label className="form-label">Address Number</label>
                        <input
                          type="text"
                          id="addressnumber"
                          name="addressnumber"
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>
                    )}

                  <div className="employee-form-group">
                    <label htmlFor="street" className="form-label">
                      Street <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="street"
                      name="street"
                      onChange={handleDropdownChange}
                      required
                      className="form-input"
                    >
                      <option value="" disabled selected hidden>
                        Select
                      </option>
                      {streetList.map((element, index) => (
                        <option key={index} value={element}>
                          {element}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="employee-form-group">
                    <label className="form-label">
                      Business Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="businessname"
                      name="businessname"
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="employee-form-group">
                    <label className="form-label">
                      Line of Business <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="lineofbusiness"
                      name="lineofbusiness"
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </>
              )}

              <div className="employee-form-group">
                <label className="form-label">
                  Amount <label className="text-red-600"></label>
                </label>

                <input
                  type="text"
                  id="amount"
                  name="amount"
                  value={certificateForm.amount}
                  readOnly
                  className="form-input"
                />
              </div>
              <button type="submit" className="actions-btn bg-btn-color-blue">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateCertificate;
