import Webcam from "react-webcam";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import OpenCamera from "./OpenCamera";
import { removeBackground } from "@imgly/background-removal";
import { storage } from "../firebase";
import mongoose from "mongoose";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";

function CreateResident() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [id, setId] = useState(null);
  const [signature, setSignature] = useState(null);
  const hiddenInputRef1 = useRef(null);
  const hiddenInputRef2 = useRef(null);
  const [residents, setResidents] = useState([]);
  const [residentForm, setResidentForm] = useState({
    firstname: "",
    middlename: "",
    lastname: "",
    suffix: "",
    alias: "",
    salutation: "",
    sex: "",
    gender: "",
    birthdate: "",
    birthplace: "",
    civilstatus: "",
    bloodtype: "",
    religion: "",
    nationality: "",
    voter: "",
    deceased: "",
    email: "",
    mobilenumber: "",
    telephone: "",
    facebook: "",
    emergencyname: "",
    emergencymobilenumber: "",
    emergencyaddress: "",
    housenumber: "",
    street: "",
    HOAname: "",
    address: "",
    mother: "",
    father: "",
    spouse: "",
    siblings: [],
    children: [],
    numberofsiblings: "",
    numberofchildren: "",
    employmentstatus: "",
    employmentfield: "",
    occupation: "",
    monthlyincome: "",
    educationalattainment: "",
    typeofschool: "",
    course: "",
  });

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/getresidents"
        );
        console.log(response.data);
        setResidents(response.data);
      } catch (error) {
        console.log("Error fetching residents", error);
      }
    };
    fetchResidents();
  }, []);

  const renderSiblingsDropdown = () => {
    const numberOfSiblings = parseInt(residentForm.numberofsiblings, 10) || 0;

    const siblingsDropdowns = [];
    for (let i = 0; i < numberOfSiblings; i++) {
      siblingsDropdowns.push(
        <div
          style={{ display: "flex", flexDirection: "row", gap: "10px" }}
          key={i}
        >
          <label htmlFor={`sibling-${i}`}>Sibling</label>
          <select
            id={`sibling-${i}`}
            name={`sibling-${i}`}
            style={{ width: "150px" }}
            onChange={(e) => handleMultipleDropdownChange(e, i, "siblings")}
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {residents.map((element) => (
              <option key={element._id} value={element._id}>
                {element.middlename
                  ? `${element.firstname} ${element.middlename} ${element.lastname}`
                  : `${element.firstname} ${element.lastname}`}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return siblingsDropdowns;
  };

  const renderChildrenDropdown = () => {
    const numberOfChildren = parseInt(residentForm.numberofchildren, 10) || 0;

    const childrenDropdowns = [];
    for (let i = 0; i < numberOfChildren; i++) {
      childrenDropdowns.push(
        <div
          style={{ display: "flex", flexDirection: "row", gap: "10px" }}
          key={i}
        >
          <label htmlFor={`child-${i}`}>Child</label>
          <select
            id={`child-${i}`}
            name={`child-${i}`}
            style={{ width: "150px" }}
            onChange={(e) => handleMultipleDropdownChange(e, i, "children")}
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {residents.map((element) => (
              <option key={element._id} value={element._id}>
                {element.middlename
                  ? `${element.firstname} ${element.middlename} ${element.lastname}`
                  : `${element.firstname} ${element.lastname}`}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return childrenDropdowns;
  };

  useEffect(() => {
    console.log(residentForm);
  }, [residentForm]);

  // DROPDOWN VALUES
  const suffixList = ["Jr.", "Sr.", "I", "II", "III", "IV", "None"];
  const salutationList = [
    "Mr.",
    "Mrs.",
    "Mx.",
    "Dr.",
    "Prof.",
    "Rev.",
    "Hon.",
    "Capt.",
    "Col.",
    "Gen.",
    "Lt.",
    "Sgt.",
    "None",
  ];
  const sexList = ["Male", "Female"];
  const genderList = [
    "Male",
    "Female",
    "Non-binary",
    "Genderfluid",
    "Agender",
    "Other",
    "Prefer not to say",
  ];
  const civilstatusList = [
    "Single",
    "Married",
    "Divorced",
    "Widowed",
    "Separated",
    "Annulled",
    "Common-Law/Live-In",
  ];
  const bloodtypeList = [
    "A",
    "A-",
    "B",
    "B-",
    "AB",
    "AB-",
    "O",
    "O-",
    "Unknown",
  ];
  const religionList = [
    "Adventist",
    "Aglipayan (Philippine Independence Church)",
    "Baptist World Alliance",
    "Born Again Christian",
    "Church of Christ",
    "Church Jesus Christ and the Latter Day Saints",
    "Church of the Nazarene",
    "El Shaddai",
    "Evangelical",
    "Full Gospel",
    "Iglesia ni Cristo",
    "Islam",
    "Jehovah’s Witnesses",
    "Judaism",
    "MCGI (Dating Daan)",
    "Methodist",
    "Mormons",
    "Pentecost",
    "Protestants",
    "Roman Catholic",
    "Seventh Day Adventists (Central Phil. Union Conf.)",
    "Worldwide Church of God",
    "Other",
    "Prefer not to say",
  ];
  const nationalityList = [
    "Filipino",
    "American",
    "Chinese",
    "Indian",
    "Japanese",
    "Korean",
    "Australian",
    "British",
    "Canadian",
    "German",
    "French",
    "Spanish",
    "Italian",
    "Mexican",
    "Russian",
    "Other",
  ];

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
  ];

  const employmentstatusList = [
    "Employed",
    "Part-Time",
    "Student",
    "Unemployed",
    "Seasonal",
    "Contractual",
    "Compensation",
    "Self-Employed",
    "Retired",
    "Displaced Worker",
    "Homemaker",
    "Intern",
    "Working for Private Household",
    "Working for Private Business/Establishment/Farm",
    "Working for Government/Government Corporation",
    "Self-Employed with No Paid Employee",
    "Employer in Own Family-Oriented Farm/Business",
    "Working with Pay on Own-Family Operated Farm/Business",
    "Working without Pay on Own-Family Operated Farm/Business",
  ];

  const monthlyincomeList = [
    "0-1,000",
    "1,001-5,000",
    "5,001-10,000",
    "10,001-25,000",
    "25,001-50,000",
    "50,001-75,000",
    "75,001-100,000",
    "100,001-250,000",
    "250,001-500,000",
    "500,001-1,000,000",
    "1,000,001+",
  ];

  const educationalattainmentList = [
    "No Formal Education",
    "Day Care",
    "Kindergarten/Preparatory",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "1st Year PS/N-T/TV",
    "2nd Year PS/N-T/TV",
    "3rd Year PS/N-T/TV",
    "1st Year College",
    "2nd Year College",
    "3rd Year College",
    "4th Year College or Higher",
    "ALS Elementary",
    "ALS Secondary",
    "SPED Elementary",
    "SPED Secondary",
    "Grade School Graduate",
    "High School Graduate",
    "Post-Secondary Graduate",
    "Post-Grad with Units",
    "College Graduate",
    "Masters/PHD Graduate",
  ];

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setResidentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setResidentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultipleDropdownChange = (e, index, field) => {
    const selectedValue = e.target.value;
    const updatedArray = [...residentForm[field]];
    updatedArray[index] = selectedValue;
    setResidentForm({
      ...residentForm,
      [field]: updatedArray,
    });
  };

  const lettersAndSpaceOnly = (e) => {
    const { name, value } = e.target;
    const lettersOnly = value.replace(/[^a-zA-Z\s.]/g, "");
    const capitalizeFirstLetter = lettersOnly
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    setResidentForm((prev) => ({
      ...prev,
      [name]: capitalizeFirstLetter,
    }));
  };

  const numbersAndNoSpaceOnly = (e) => {
    const { name, value } = e.target;
    const numbersOnly = value.replace(/[^0-9]/g, "");
    setResidentForm((prev) => ({
      ...prev,
      [name]: numbersOnly,
    }));
  };

  const lettersNumbersAndSpaceOnly = (e) => {
    const { name, value } = e.target;
    const lettersAndNumbersOnly = value.replace(/[^a-zA-Z0-9\s.,]/g, "");
    const capitalizeFirstLetter = lettersAndNumbersOnly
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    setResidentForm((prev) => ({
      ...prev,
      [name]: capitalizeFirstLetter,
    }));
  };

  const stringsAndNoSpaceOnly = (e) => {
    const { name, value } = e.target;
    const stringsOnly = value.replace(/[^a-zA-Z0-9./:?&=]/g, "");
    setResidentForm((prev) => ({
      ...prev,
      [name]: stringsOnly,
    }));
  };

  const toggleCamera = () => {
    setIsCameraOpen(true);
  };

  const handleUploadID = (event) => {
    hiddenInputRef1.current.click();
  };

  const handleUploadSig = (event) => {
    hiddenInputRef2.current.click();
  };

  const handleChangeID = async (event) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      try {
        const blob = await removeBackground(fileUploaded);
        const url = URL.createObjectURL(blob);
        setId(url);
      } catch (error) {
        console.error("Error removing background:", error);
      }
    }
  };

  const handleDone = (url) => {
    setIsCameraOpen(false);
    setId(url);
  };

  const handleClose = () => {
    setIsCameraOpen(false);
  };
  async function uploadToFirebase(url) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `id_images/${Date.now()}_${randomString}.png`;
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  const handleSubmit = async () => {
    try {
      if (!id) {
        alert("Picture is required");
      } else if (!signature) {
        alert("Signature is required");
      } else {
        const fulladdress = `${residentForm.housenumber} ${residentForm.street} Aniban 2, Bacoor, Cavite`;
        const idPicture = await uploadToFirebase(id);
        const signaturePicture = await uploadToFirebase(signature);

        const updatedResidentForm = {
          ...residentForm,
          address: fulladdress,
        };

        const response = await axios.post(
          "http://localhost:5000/api/createresident",
          {
            picture: idPicture,
            signature: signaturePicture,
            ...updatedResidentForm,
          }
        );
        console.log(updatedResidentForm);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleChangeSig = async (event) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      try {
        const blob = await removeBackground(fileUploaded);
        const url = URL.createObjectURL(blob);
        setSignature(url);
      } catch (error) {
        console.error("Error removing background:", error);
      }
    }
  };

  return (
    <div>
      <h1>Create Resident</h1>

      {/* Personal Information */}
      <h3>Personal Information</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "50px",
        }}
      >
        <div style={{ border: "1px solid black", width: "400px" }}>
          <h3>
            Picture<label style={{ color: "red" }}>*</label>
          </h3>
          <input
            onChange={handleChangeID}
            type="file"
            style={{ display: "none" }}
            ref={hiddenInputRef1}
          />
          <div>
            <div>
              {id ? <img src={id} width={150} /> : <p>No Picture Attached</p>}
              <button onClick={toggleCamera}>Open Camera</button>
              <button onClick={handleUploadID}>Upload a Photo</button>
            </div>
          </div>
        </div>

        <div style={{ border: "1px solid black", width: "400px" }}>
          <h3>
            Signature<label style={{ color: "red" }}>*</label>
          </h3>
          <input
            onChange={handleChangeSig}
            type="file"
            style={{ display: "none" }}
            ref={hiddenInputRef2}
          />
          {signature ? (
            <img src={signature} width={150} />
          ) : (
            <p>No Picture Attached</p>
          )}
          <div>
            <button onClick={handleUploadSig}>Upload a Signature</button>
          </div>
        </div>
      </div>

      <form
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          width: "400px",
          marginTop: "20px",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>
            First Name<label style={{ color: "red" }}>*</label>
          </label>
          <input
            type="text"
            name="firstname"
            value={residentForm.firstname}
            onChange={lettersAndSpaceOnly}
            placeholder="Enter first name"
            required
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>Middle Name</label>
          <input
            name="middlename"
            value={residentForm.middlename}
            onChange={lettersAndSpaceOnly}
            placeholder="Enter middle name"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>
            Last Name<label style={{ color: "red" }}>*</label>
          </label>
          <input
            name="lastname"
            value={residentForm.lastname}
            onChange={lettersAndSpaceOnly}
            placeholder="Enter last name"
            required
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="suffix">Suffix</label>
          <select
            id="suffix"
            name="suffix"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
          >
            <option value="Select" disabled selected hidden>
              Select
            </option>
            {suffixList.map((element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>Alias</label>
          <input
            name="alias"
            value={residentForm.alias}
            onChange={lettersAndSpaceOnly}
            placeholder="Enter alias"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="salutation">Salutation:</label>
          <select
            id="salutation"
            name="salutation"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
          >
            <option value="Select" disabled selected hidden>
              Select
            </option>
            {salutationList.map((element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="sex">
            Sex:<label style={{ color: "red" }}>*</label>
          </label>
          <select
            id="sex"
            name="sex"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
            required
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {sexList.map((element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {genderList.map((element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>
            Birthdate<label style={{ color: "red" }}>*</label>
          </label>
          <input
            type="date"
            name="birthdate"
            onChange={(e) => {
              const { name, value } = e.target;
              setResidentForm((prev) => ({
                ...prev,
                [name]: value,
              }));
            }}
            value={residentForm.birthdate}
            placeholder="Enter birthdate"
            min="1900-01-01"
            required
          />
        </div>

        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>Birthplace</label>
          <input
            name="birthplace"
            value={residentForm.birthplace}
            onChange={lettersAndSpaceOnly}
            placeholder="Enter birthplace"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="civilstatus">
            Civil Status<label style={{ color: "red" }}>*</label>
          </label>
          <select
            id="civilstatus"
            name="civilstatus"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
            required
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {civilstatusList.map((element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="bloodtype">Blood Type</label>
          <select
            id="bloodtype"
            name="bloodtype"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {bloodtypeList.map((element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="religion">Religion</label>
          <select
            id="religion"
            name="religion"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {religionList.map((element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="nationality">
            Nationality<label style={{ color: "red" }}>*</label>
          </label>
          <select
            id="nationality"
            name="nationality"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
            required
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {nationalityList.map((element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Registered Voter:</label>
          <label>
            <input
              type="radio"
              name="voter"
              onChange={handleRadioChange}
              value="Yes"
              checked={residentForm.voter === "Yes"}
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="voter"
              onChange={handleRadioChange}
              value="No"
              checked={residentForm.voter === "No"}
            />
            No
          </label>
        </div>

        <div>
          <label>Deceased:</label>
          <label>
            <input
              type="radio"
              name="deceased"
              onChange={handleRadioChange}
              value="Yes"
              checked={residentForm.deceased === "Yes"}
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="deceased"
              onChange={handleRadioChange}
              value="No"
              checked={residentForm.deceased === "No"}
            />
            No
          </label>
        </div>

        {/* Contact Information */}
        <h3>Contact Information</h3>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>Email</label>
          <input
            name="email"
            value={residentForm.email}
            onChange={stringsAndNoSpaceOnly}
            placeholder="Enter email"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>
            Mobile Number<label style={{ color: "red" }}>*</label>
          </label>
          <input
            name="mobilenumber"
            value={residentForm.mobilenumber}
            onChange={numbersAndNoSpaceOnly}
            placeholder="Enter mobile number"
            required
            maxLength={11}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>Telephone</label>
          <input
            name="telephone"
            value={residentForm.telephone}
            onChange={numbersAndNoSpaceOnly}
            placeholder="Enter telephone"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>Facebook</label>
          <input
            name="facebook"
            value={residentForm.facebook}
            onChange={stringsAndNoSpaceOnly}
            placeholder="Enter facebook"
          />
        </div>
        {/* In Case Of Emergency Situation */}
        <h3>In Case Of Emergency Situation</h3>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>
            Name<label style={{ color: "red" }}>*</label>
          </label>
          <input
            name="emergencyname"
            value={residentForm.emergencyname}
            onChange={lettersAndSpaceOnly}
            placeholder="Enter name"
            required
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>
            Mobile Number<label style={{ color: "red" }}>*</label>
          </label>
          <input
            name="emergencymobilenumber"
            value={residentForm.emergencymobilenumber}
            onChange={numbersAndNoSpaceOnly}
            placeholder="Enter mobile number"
            required
            maxLength={11}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>
            Address<label style={{ color: "red" }}>*</label>
          </label>
          <input
            name="emergencyaddress"
            value={residentForm.emergencyaddress}
            onChange={lettersNumbersAndSpaceOnly}
            placeholder="Enter address"
            required
          />
        </div>

        {/* Family Information */}
        <h3>Family Information</h3>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="mother">Mother</label>
          <select
            id="mother"
            name="mother"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {residents.map((element) => (
              <option value={element._id}>
                {element.middlename
                  ? `${element.firstname} ${element.middlename} ${element.lastname}`
                  : `${element.firstname} ${element.lastname}`}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="father">Father</label>
          <select
            id="father"
            name="father"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {residents.map((element) => (
              <option value={element._id}>
                {element.middlename
                  ? `${element.firstname} ${element.middlename} ${element.lastname}`
                  : `${element.firstname} ${element.lastname}`}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="spouse">Spouse</label>
          <select
            id="spouse"
            name="spouse"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {residents.map((element) => (
              <option value={element._id}>
                {element.middlename
                  ? `${element.firstname} ${element.middlename} ${element.lastname}`
                  : `${element.firstname} ${element.lastname}`}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>Siblings</label>
          <input
            name="numberofsiblings"
            value={residentForm.numberofsiblings}
            onChange={numbersAndNoSpaceOnly}
            placeholder="Enter number of siblings"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>Children</label>
          <input
            name="numberofchildren"
            value={residentForm.numberofchildren}
            onChange={numbersAndNoSpaceOnly}
            placeholder="Enter number of siblings"
          />
        </div>
        {renderSiblingsDropdown()}
        {renderChildrenDropdown()}
        {/* Address Information */}
        <h3>Address Information</h3>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>House Number</label>
          <input
            name="housenumber"
            value={residentForm.housenumber}
            onChange={numbersAndNoSpaceOnly}
            placeholder="Enter house number"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="street">
            Street<label style={{ color: "red" }}>*</label>
          </label>
          <select
            id="street"
            name="street"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
            required
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {streetList.map((element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="HOAname">HOA Name</label>
          <select
            id="HOAname"
            name="HOAname"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
          >
            <option value="Select" disabled selected hidden>
              Select
            </option>
            <option value="Bermuda Town Homes">Bermuda Town Homes</option>
            <option value="None">None</option>
          </select>
        </div>
        {/* Employment Information */}
        <h3>Employment Information</h3>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="employmentstatus">Employment Status</label>
          <select
            id="employmentstatus"
            name="employmentstatus"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
          >
            <option value="Select" disabled selected hidden>
              Select
            </option>
            {employmentstatusList.map((element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>Occupation</label>
          <input
            name="occupation"
            value={residentForm.occupation}
            onChange={lettersAndSpaceOnly}
            placeholder="Enter occupation"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="monthlyincome">Monthly Income</label>
          <select
            id="monthlyincome"
            name="monthlyincome"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
          >
            <option value="Select" disabled selected hidden>
              Select
            </option>
            {monthlyincomeList.map((element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </div>
        {/* Educational Information */}
        <h3>Educational Information</h3>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="educationalattainment">
            Highest Educational Attainment
          </label>
          <select
            id="educationalattainment"
            name="educationalattainment"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
          >
            <option value="Select" disabled selected hidden>
              Select
            </option>
            {educationalattainmentList.map((element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label for="typeofschool">Type of School</label>
          <select
            id="typeofschool"
            name="typeofschool"
            style={{ width: "150px" }}
            onChange={handleDropdownChange}
          >
            <option value="Select" disabled selected hidden>
              Select
            </option>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
          <label>Course</label>
          <input
            name="course"
            value={residentForm.course}
            onChange={lettersAndSpaceOnly}
            placeholder="Enter course"
          />
        </div>

        <button type="submit">Submit</button>
      </form>
      {isCameraOpen && <OpenCamera onDone={handleDone} onClose={handleClose} />}
    </div>
  );
}

export default CreateResident;
