import Webcam from "react-webcam";
import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import OpenCamera from "./OpenCamera";
import { removeBackground } from "@imgly/background-removal";
import { storage } from "../firebase";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { InfoContext } from "../context/InfoContext";
import { useLocation } from "react-router-dom";
import { FiCamera, FiUpload } from "react-icons/fi";

function EditResident({ isCollapsed }) {
  const [isIDProcessing, setIsIDProcessing] = useState(false);
  const [isSignProcessing, setIsSignProcessing] = useState(false);
  const location = useLocation();
  const { resID } = location.state;
  const [residentInfo, setResidentInfo] = useState([]);
  const { residents, setResidents } = useContext(InfoContext);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [id, setId] = useState();
  const [signature, setSignature] = useState(null);
  const hiddenInputRef1 = useRef(null);
  const hiddenInputRef2 = useRef(null);
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
    numberofsiblings: 0,
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
    console.log(residentForm);
  }, [residentForm, residentInfo]);

  useEffect(() => {
    if (residentInfo) {
      let houseNumber = "";
      let streetName = "";
      const siblingsLength = residentForm.siblings.length;
      const childrenLength = residentForm.children.length;

      const firstWord = residentForm.address.trim().split(" ")[0];
      const isNumber = !isNaN(firstWord);

      if (isNumber) {
        houseNumber = firstWord;
        const preStreetName = residentForm.address.split("Aniban")[0].trim();
        const streetWords = preStreetName.split(" ");
        streetWords.shift();
        streetName = streetWords.join(" ");
      } else {
        streetName = residentForm.address.split("Aniban")[0].trim();
        houseNumber = "";
      }

      setResidentForm((prevForm) => ({
        ...prevForm,
        ...residentInfo,
        numberofsiblings: siblingsLength,
        numberofchildren: childrenLength,
        street: streetName,
        housenumber: houseNumber,
      }));
      if (residentInfo.picture) setId(residentInfo.picture);
      if (residentInfo.signature) setSignature(residentInfo.signature);
    }
  }, [residentInfo]);

  useEffect(() => {
    console.log(`Resident ID: ${resID}`);
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
  }, []);

  const renderSiblingsDropdown = () => {
    const numberOfSiblings = parseInt(residentForm.numberofsiblings, 10) || 0;

    const siblingsDropdowns = [];
    for (let i = 0; i < numberOfSiblings; i++) {
      siblingsDropdowns.push(
        <div key={i} className="form-group">
          <label htmlFor={`sibling-${i}`} className="form-label">
            Sibling
          </label>
          <select
            id={`sibling-${i}`}
            name={`sibling-${i}`}
            onChange={(e) => handleMultipleDropdownChange(e, i, "siblings")}
            value={residentForm.siblings[i]}
            className="form-input"
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
        <div key={i} className="form-group">
          <label htmlFor={`child-${i}`} className="form-label">
            Child
          </label>
          <select
            id={`child-${i}`}
            name={`child-${i}`}
            onChange={(e) => handleMultipleDropdownChange(e, i, "children")}
            value={residentForm.children[i]}
            className="form-input"
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
      setIsIDProcessing(true);
      try {
        const blob = await removeBackground(fileUploaded);
        const url = URL.createObjectURL(blob);
        setId(url);
      } catch (error) {
        console.error("Error removing background:", error);
      } finally {
        setIsIDProcessing(false);
      }
    }
  };

  const handleDone = (url) => {
    setIsIDProcessing(true);
    setTimeout(() => {
      setIsCameraOpen(false);
      setId(url);
      setIsIDProcessing(false);
    }, 500);
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
      let idPicture;
      let signaturePicture;
      if (!id) {
        alert("Picture is required");
        return;
      }
      if (!signature) {
        alert("Signature is required");
        return;
      }
      if (residentForm.numberofsiblings == 0) {
        residentForm.siblings = [];
      } else {
        residentForm.siblings = residentForm.siblings.slice(
          0,
          residentForm.numberofsiblings
        );
      }

      if (residentForm.numberofchildren == 0) {
        residentForm.children = [];
      } else {
        residentForm.children = residentForm.children.slice(
          0,
          residentForm.numberofchildren
        );
      }
      const fulladdress = `${residentForm.housenumber} ${residentForm.street} Aniban 2, Bacoor, Cavite`;
      if (id !== residentInfo.picture) {
        console.log("Uploading new picture...");
        idPicture = await uploadToFirebase(id);
      } else {
        idPicture = residentInfo.picture;
      }

      if (signature !== residentInfo.signature) {
        signaturePicture = await uploadToFirebase(signature);
      } else {
        signaturePicture = residentInfo.signature;
      }
      const updatedResidentForm = {
        ...residentForm,
        picture: idPicture,
        signature: signaturePicture,
        address: fulladdress,
      };

      console.log("New picture", idPicture);
      const response = await axios.put(
        `http://localhost:5000/api/updateresident/${resID}`,
        updatedResidentForm
      );
      console.log("PUT payload", {
        picture: idPicture,
        signature: signaturePicture,
        ...updatedResidentForm,
      });
      alert("Resident successfully updated!");
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleChangeSig = async (event) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      setIsSignProcessing(true);
      try {
        const blob = await removeBackground(fileUploaded);
        const url = URL.createObjectURL(blob);
        setSignature(url);
      } catch (error) {
        console.error("Error removing background:", error);
      } finally {
        setIsSignProcessing(false);
      }
    }
  };

  return (
    <div className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
      <h1 className="header-text">Edit Resident</h1>

      {/* Personal Information */}
      <div className="white-bg-container">
        <h3 className="section-title">Personal Information</h3>
        <hr class="section-divider" />
        <div className="upload-container">
          <div className="picture-upload-wrapper">
            <h3 className="form-label">
              Picture<label className="text-red-600">*</label>
            </h3>
            <div className="upload-box">
              <input
                onChange={handleChangeID}
                type="file"
                style={{ display: "none" }}
                ref={hiddenInputRef1}
              />
              <div className="upload-content">
                <div className="preview-container ">
                  {isIDProcessing ? (
                    <p>Processing...</p>
                  ) : id ? (
                    <img
                      src={id}
                      className="w-full h-full object-contain bg-white"
                    />
                  ) : (
                    <p>No Picture Attached</p>
                  )}
                </div>

                <div className="upload-picture-btn">
                  <button onClick={toggleCamera} className="upload-btn">
                    <FiCamera />
                  </button>
                  <button onClick={handleUploadID} className="upload-btn">
                    <FiUpload />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="picture-upload-wrapper">
            <h3 className="form-label">
              Signature<label className="text-red-600">*</label>
            </h3>
            <div className="upload-box">
              <input
                onChange={handleChangeSig}
                type="file"
                style={{ display: "none" }}
                ref={hiddenInputRef2}
              />
              <div className="upload-content">
                <div className="preview-container">
                  {isSignProcessing ? (
                    <p>Processing...</p>
                  ) : signature ? (
                    <img
                      src={signature}
                      className="w-full h-full object-contain bg-white"
                    />
                  ) : (
                    <p>No Picture Attached</p>
                  )}
                </div>
              </div>

              <div className="upload-signature-btn">
                <button onClick={handleUploadSig} className="upload-btn">
                  <FiUpload className="upload-btn-img" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                First Name<label className="text-red-600">*</label>
              </label>
              <input
                type="text"
                name="firstname"
                value={residentForm.firstname}
                onChange={lettersAndSpaceOnly}
                placeholder="Enter first name"
                required
                className="form-input input-box"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Middle Name</label>
              <input
                name="middlename"
                value={residentForm.middlename}
                onChange={lettersAndSpaceOnly}
                placeholder="Enter middle name"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Last Name<label className="text-red-600">*</label>
              </label>
              <input
                name="lastname"
                value={residentForm.lastname}
                onChange={lettersAndSpaceOnly}
                placeholder="Enter last name"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label for="suffix" className="form-label">
                Suffix
              </label>
              <select
                id="suffix"
                name="suffix"
                onChange={handleDropdownChange}
                value={residentForm.suffix}
                className="form-input"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                {suffixList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Alias</label>
              <input
                name="alias"
                value={residentForm.alias}
                onChange={lettersAndSpaceOnly}
                placeholder="Enter alias"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label for="salutation" className="form-label">
                Salutation
              </label>
              <select
                id="salutation"
                name="salutation"
                onChange={handleDropdownChange}
                value={residentForm.salutation}
                className="form-input"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>

                {salutationList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label for="sex" className="form-label">
                Sex:<label className="text-red-600">*</label>
              </label>
              <select
                id="sex"
                name="sex"
                onChange={handleDropdownChange}
                required
                value={residentForm.sex}
                className="form-input"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                {sexList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label for="gender" className="form-label">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                onChange={handleDropdownChange}
                value={residentForm.gender}
                className="form-input"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                {genderList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                Birthdate<label className="text-red-600">*</label>
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
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Birthplace</label>
              <input
                name="birthplace"
                value={residentForm.birthplace}
                onChange={lettersAndSpaceOnly}
                placeholder="Enter birthplace"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label for="civilstatus" className="form-label">
                Civil Status<label className="text-red-600">*</label>
              </label>
              <select
                id="civilstatus"
                name="civilstatus"
                onChange={handleDropdownChange}
                required
                value={residentForm.civilstatus}
                className="form-input"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                {civilstatusList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label for="bloodtype" className="form-label">
                Blood Type
              </label>
              <select
                id="bloodtype"
                name="bloodtype"
                onChange={handleDropdownChange}
                value={residentForm.bloodtype}
                className="form-input"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                {bloodtypeList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label for="religion" className="form-label">
                Religion
              </label>
              <select
                id="religion"
                name="religion"
                onChange={handleDropdownChange}
                value={residentForm.religion}
                className="form-input"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                {religionList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label for="nationality" className="form-label">
                Nationality<label className="text-red-600">*</label>
              </label>
              <select
                id="nationality"
                name="nationality"
                onChange={handleDropdownChange}
                required
                value={residentForm.nationality}
                className="form-input"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                {nationalityList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            <div className="form-group space-x-5">
              <label className="form-label ">Registered Voter</label>
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

            <div className="form-group space-x-5">
              <label className="form-label">Deceased:</label>
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
          </div>

          {/* Contact Information */}
          <h3 className="section-title mt-8">Contact Information</h3>
          <hr class="section-divider" />

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                name="email"
                value={residentForm.email}
                onChange={stringsAndNoSpaceOnly}
                placeholder="Enter email"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label lassName="form-label">
                Mobile Number<label className="text-red-600">*</label>
              </label>
              <input
                name="mobilenumber"
                value={residentForm.mobilenumber}
                onChange={numbersAndNoSpaceOnly}
                placeholder="Enter mobile number"
                required
                maxLength={11}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Telephone</label>
              <input
                name="telephone"
                value={residentForm.telephone}
                onChange={numbersAndNoSpaceOnly}
                placeholder="Enter telephone"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Facebook</label>
              <input
                name="facebook"
                value={residentForm.facebook}
                onChange={stringsAndNoSpaceOnly}
                placeholder="Enter facebook"
                className="form-input"
              />
            </div>
          </div>

          {/* In Case Of Emergency Situation */}
          <h3 className="section-title mt-8">In Case Of Emergency Situation</h3>
          <hr class="section-divider" />
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Name<label className="text-red-600">*</label>
              </label>
              <input
                name="emergencyname"
                value={residentForm.emergencyname}
                onChange={lettersAndSpaceOnly}
                placeholder="Enter name"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Mobile Number<label className="text-red-600">*</label>
              </label>
              <input
                name="emergencymobilenumber"
                value={residentForm.emergencymobilenumber}
                onChange={numbersAndNoSpaceOnly}
                placeholder="Enter mobile number"
                required
                maxLength={11}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Address<label className="text-red-600">*</label>
              </label>
              <input
                name="emergencyaddress"
                value={residentForm.emergencyaddress}
                onChange={lettersNumbersAndSpaceOnly}
                placeholder="Enter address"
                required
                className="form-input"
              />
            </div>
          </div>

          {/* Family Information */}
          <h3 className="section-title mt-8">Family Information</h3>
          <hr class="section-divider" />

          <div className="form-grid">
            <div className="form-group">
              <label for="mother" className="form-label">
                Mother
              </label>
              <select
                id="mother"
                name="mother"
                onChange={handleDropdownChange}
                value={residentForm.mother}
                className="form-input"
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
            <div className="form-group">
              <label for="father" className="form-label">
                Father
              </label>
              <select
                id="father"
                name="father"
                onChange={handleDropdownChange}
                value={residentInfo.father}
                className="form-input"
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
            <div className="form-group">
              <label for="spouse" className="form-label">
                Spouse
              </label>
              <select
                id="spouse"
                name="spouse"
                onChange={handleDropdownChange}
                value={residentInfo.spouse}
                className="form-input"
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
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label mt-4">Siblings</label>
              <input
                name="numberofsiblings"
                value={residentForm.numberofsiblings}
                onChange={numbersAndNoSpaceOnly}
                placeholder="Enter number of siblings"
                className="form-input "
              />
            </div>
          </div>
          {parseInt(residentForm.numberofsiblings, 10) > 0 && (
            <div className="form-grid mt-4">{renderSiblingsDropdown()}</div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label mt-4 ">Children</label>
              <input
                name="numberofchildren"
                value={residentForm.numberofchildren}
                onChange={numbersAndNoSpaceOnly}
                placeholder="Enter number of siblings"
                className="form-input"
              />
            </div>
          </div>

          {parseInt(residentForm.numberofchildren, 10) > 0 && (
            <div className="form-grid mt-4 ">{renderChildrenDropdown()}</div>
          )}

          {/* Address Information */}
          <h3 className="section-title mt-8">Address Information</h3>
          <hr class="section-divider" />

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">House Number</label>
              <input
                name="housenumber"
                value={residentForm.housenumber}
                onChange={numbersAndNoSpaceOnly}
                placeholder="Enter house number"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label for="street" className="form-label">
                Street<label className="text-red-600">*</label>
              </label>
              <select
                id="street"
                name="street"
                onChange={handleDropdownChange}
                required
                value={residentForm.street}
                className="form-input"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                {streetList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label for="HOAname" className="form-label">
                HOA Name
              </label>
              <select
                id="HOAname"
                name="HOAname"
                onChange={handleDropdownChange}
                value={residentForm.HOAname}
                className="form-input"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                <option value="Bermuda Town Homes">Bermuda Town Homes</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>

          {/* Employment Information */}
          <h3 className="section-title mt-8">Employment Information</h3>
          <hr class="section-divider" />

          <div className="form-grid">
            <div className="form-group">
              <label for="employmentstatus" className="form-label">
                Employment Status
              </label>
              <select
                id="employmentstatus"
                name="employmentstatus"
                onChange={handleDropdownChange}
                value={residentForm.employmentstatus}
                className="form-input"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                {employmentstatusList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Occupation</label>
              <input
                name="occupation"
                value={residentForm.occupation}
                onChange={lettersAndSpaceOnly}
                placeholder="Enter occupation"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label for="monthlyincome" className="form-label">
                Monthly Income
              </label>
              <select
                id="monthlyincome"
                name="monthlyincome"
                onChange={handleDropdownChange}
                value={residentForm.monthlyincome}
                className="form-input"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                {monthlyincomeList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Educational Information */}
          <h3 className="section-title mt-8">Educational Information</h3>
          <hr class="section-divider" />

          <div className="form-grid">
            <div className="form-group ">
              <label for="educationalattainment" className="form-label">
                Highest Educational Attainment
              </label>
              <select
                id="educationalattainment"
                name="educationalattainment"
                onChange={handleDropdownChange}
                value={residentForm.educationalattainment}
                className="form-input"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                {educationalattainmentList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label for="typeofschool" className="form-label">
                Type of School
              </label>
              <select
                id="typeofschool"
                name="typeofschool"
                onChange={handleDropdownChange}
                value={residentForm.typeofschool}
                className="form-input"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Course</label>
              <input
                name="course"
                value={residentForm.course}
                onChange={lettersAndSpaceOnly}
                placeholder="Enter course"
                className="form-input"
              />
            </div>
          </div>

          <div className="function-btn-container">
            <button
              type="submit"
              className="actions-btn bg-btn-color-blue mt-4"
            >
              Submit
            </button>
          </div>
        </form>
        {isCameraOpen && (
          <OpenCamera onDone={handleDone} onClose={handleClose} />
        )}
      </div>
    </div>
  );
}

export default EditResident;
