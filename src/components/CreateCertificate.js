import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import "../App.css";
import { AuthContext } from "../context/AuthContext";
import { IoClose } from "react-icons/io5";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import IndigencyPrint from "./certificates/IndigencyPrint";
import BusinessClearancePrint from "./certificates/BusinessClearancePrint";
import ClearancePrint from "./certificates/ClearancePrint";
import api from "../api";

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
      const response = await api.post("/generatecertificate", {
        filteredData,
        resID,
      });
      const qrCode = await uploadToFirebase(response.data.qrCode);
      try {
        const response2 = await api.put(
          `/savecertificate/${response.data.certID}`,
          {
            qrCode,
          }
        );
      } catch (error) {
        console.log("Error saving barangay ID", error);
      }
      try {
        const response3 = await api.get(
          `/getcertificate/${response.data.certID}`
        );
        const response4 = await api.get(`/getcaptain/`);
        const response5 = await api.get(`/getprepared/${user.userID}`);

        if (response3.data.typeofcertificate === "Barangay Indigency") {
          IndigencyPrint({
            certData: response3.data,
            captainData: response4.data,
            preparedByData: response5.data,
            updatedAt: response3.data.updatedAt,
          });
        } else if (response3.data.typeofcertificate === "Barangay Clearance") {
          ClearancePrint({
            certData: response3.data,
            captainData: response4.data,
            preparedByData: response5.data,
            updatedAt: response3.data.updatedAt,
          });
        } else if (
          response3.data.typeofcertificate === "Barangay Business Clearance"
        ) {
          BusinessClearancePrint({
            certData: response3.data,
            captainData: response4.data,
            preparedByData: response5.data,
            updatedAt: response3.data.updatedAt,
          });
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

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };
  return (
    <>
      {setShowModal && (
        <div className="modal-container">
          <div className="modal-content w-[30rem] h-[15rem] ">
            <div className="modal-title-bar">
              <h1 className="modal-title">Create Certificate</h1>
              <button className="modal-btn-close">
                <IoClose
                  className="modal-btn-close-icon"
                  onClick={handleClose}
                />
              </button>
            </div>

            <form
              className="modal-form-container"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="modal-form">
                <div className="employee-form-group">
                  <label for="typeofcertificate" className="form-label">
                    Type of Certificate<label className="text-red-600">*</label>
                  </label>
                  <select
                    id="typeofcertificate"
                    name="typeofcertificate"
                    onChange={handleDropdownChange}
                    required
                    className="form-input h-[30px]"
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
                      className="form-input h-[30px]"
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
                            className="form-input h-[30px]"
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
                        className="form-input h-[30px]"
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
                        className="form-input h-[30px]"
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
                        className="form-input h-[30px]"
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
                    className="form-input h-[30px]"
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateCertificate;
