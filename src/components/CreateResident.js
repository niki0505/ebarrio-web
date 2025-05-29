import { useContext, useEffect, useRef, useState } from "react";
import OpenCamera from "./OpenCamera";
import { removeBackground } from "@imgly/background-removal";
import { storage } from "../firebase";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { FiCamera, FiUpload } from "react-icons/fi";
import { useConfirm } from "../context/ConfirmContext";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { BiSolidImageAlt } from "react-icons/bi";
import { GrNext } from "react-icons/gr";

function CreateResident({ isCollapsed }) {
  const navigation = useNavigate();
  const confirm = useConfirm();
  const { fetchResidents, residents } = useContext(InfoContext);
  const [isIDProcessing, setIsIDProcessing] = useState(false);
  const [isSignProcessing, setIsSignProcessing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const hiddenInputRef1 = useRef(null);
  const hiddenInputRef2 = useRef(null);
  const initialForm = {
    id: "",
    signature: "",
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
    precinct: "",
    deceased: "",
    email: "",
    mobilenumber: "+63",
    telephone: "+63",
    facebook: "",
    emergencyname: "",
    emergencymobilenumber: "+63",
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
  };
  const { residentForm, setResidentForm } = useContext(InfoContext);
  useEffect(() => {
    fetchResidents();
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
            className="form-input"
            value={residentForm.siblings}
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
            value={residentForm.children}
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

  // DROPDOWN VALUES
  const suffixList = ["Jr.", "Sr.", "I", "II", "III", "IV"];
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
  ];
  const sexList = ["Male", "Female"];
  const genderList = [
    "Male",
    "Female",
    "Non-binary",
    "Genderfluid",
    "Agender",
    "Other",
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
  const bloodtypeList = ["A", "A-", "B", "B-", "AB", "AB-", "O", "O-"];
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
    const stringsOnly = value.replace(/[^a-zA-Z0-9@_./:?&=]/g, "");
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
        setResidentForm((prev) => ({ ...prev, id: url }));
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
      setResidentForm((prev) => ({ ...prev, id: url }));
      setIsIDProcessing(false);
    }, 500);
  };

  const handleClose = () => {
    setIsCameraOpen(false);
  };
  const handleReset = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to clear all the fields?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    setResidentForm(initialForm);
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
      if (!residentForm.id) {
        alert("Picture is required");
      } else if (!residentForm.signature) {
        alert("Signature is required");
      } else {
        const isConfirmed = await confirm(
          "Are you sure you want to create a resident profile?",
          "confirm"
        );
        if (!isConfirmed) {
          return;
        }
        const fulladdress = `${residentForm.housenumber} ${residentForm.street} Aniban 2, Bacoor, Cavite`;
        const idPicture = await uploadToFirebase(residentForm.id);
        const signaturePicture = await uploadToFirebase(residentForm.signature);

        let formattedMobileNumber = residentForm.mobilenumber;
        formattedMobileNumber = "0" + residentForm.mobilenumber.slice(3);

        let formattedEmergencyMobileNumber = residentForm.emergencymobilenumber;
        formattedEmergencyMobileNumber =
          "0" + residentForm.emergencymobilenumber.slice(3);

        let formattedTelephone = residentForm.telephone;
        if (residentForm.telephone) {
          formattedTelephone = "0" + residentForm.telephone.slice(3);
          delete residentForm.telephone;
        }

        delete residentForm.mobilenumber;
        delete residentForm.emergencymobilenumber;
        delete residentForm.id;
        delete residentForm.signature;

        const updatedResidentForm = {
          ...residentForm,
          address: fulladdress,
          mobilenumber: formattedMobileNumber,
          emergencymobilenumber: formattedEmergencyMobileNumber,
          telephone: formattedTelephone,
        };

        const response = await api.post("/createresident", {
          picture: idPicture,
          signature: signaturePicture,
          ...updatedResidentForm,
        });
        try {
          const response2 = await api.post(
            `/generatebrgyID/${response.data.resID}`
          );
          console.log(response2.data);
          const qrCode = await uploadToFirebase(response2.data.qrCode);
          try {
            const response3 = await api.put(
              `/savebrgyID/${response.data.resID}`,
              {
                idNumber: response2.data.idNumber,
                expirationDate: response2.data.expirationDate,
                qrCode,
                qrToken: response2.data.qrToken,
              }
            );
          } catch (error) {
            console.log("Error saving barangay ID", error);
          }
        } catch (error) {
          console.log("Error generating barangay ID", error);
        }
        alert("Resident successfully created!");
        navigation("/residents");
      }
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
        setResidentForm((prev) => ({ ...prev, signature: url }));
      } catch (error) {
        console.error("Error removing background:", error);
      } finally {
        setIsSignProcessing(false);
      }
    }
  };

  const mobileInputChange = (e) => {
    let { name, value } = e.target;
    value = value.replace(/\D/g, "");

    if (!value.startsWith("+63")) {
      value = "+63" + value.replace(/^0+/, "").slice(2);
    }
    if (value.length > 13) {
      value = value.slice(0, 13);
    }
    if (value.length >= 4 && value[3] === "0") {
      return;
    }

    setResidentForm((prev) => ({ ...prev, [name]: value }));
  };

  const telephoneInputChange = (e) => {
    let { name, value } = e.target;
    value = value.replace(/\D/g, "");

    if (!value.startsWith("+63")) {
      value = "+63" + value.replace(/^0+/, "").slice(2);
    }
    if (value.length > 11) {
      value = value.slice(0, 13);
    }
    if (value.length >= 4 && value[3] === "0") {
      return;
    }

    setResidentForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
      <div className="flex flex-col md:flex-row lg:flex-row gap-x-3 items-center">
        <h1
          onClick={() => navigation("/residents")}
          className="text-[30px] font-bold font-title text-[#7D7979] cursor-pointer"
        >
          Residents
        </h1>
        <GrNext className="text-[#7D7979] text-lg font-bold" />
        <h1 className="header-text">Create Resident</h1>
      </div>

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
                <div className="preview-container">
                  {isIDProcessing ? (
                    <p>Processing...</p>
                  ) : residentForm.id ? (
                    <img src={residentForm.id} className="upload-img" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <BiSolidImageAlt className="w-16 h-16" />
                      <p>Attach Image</p>
                    </div>
                  )}
                </div>

                <div className="upload-picture-btn ">
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
                  ) : residentForm.signature ? (
                    <img
                      src={residentForm.signature}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <BiSolidImageAlt className="w-16 h-16" />
                      <p>Attach Image</p>
                    </div>
                  )}
                </div>

                <div className="upload-signature-btn">
                  <button onClick={handleUploadSig} className="upload-btn">
                    <FiUpload />
                  </button>
                </div>
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
                className="form-input"
                value={residentForm.suffix}
              >
                <option value="Select" selected>
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
                <option value="Select" selected>
                  Select
                </option>
                {salutationList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label for="sex" className="form-label">
                Sex<label className="text-red-600">*</label>
              </label>
              <select
                id="sex"
                name="sex"
                onChange={handleDropdownChange}
                value={residentForm.sex}
                required
                className="form-input"
              >
                <option value="" selected>
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
                <option value="" selected>
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
                className="form-input p-2"
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
                value={residentForm.civilstatus}
                required
                className="form-input"
              >
                <option value="" selected>
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
                <option value="" selected>
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
                <option value="" selected>
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
                value={residentForm.nationality}
                required
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                {nationalityList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Registered Voter</label>
              <div className="flex flex-row space-x-10">
                <div className="flex flex-row justify-center gap-1">
                  <input
                    type="radio"
                    name="voter"
                    onChange={handleRadioChange}
                    value="Yes"
                    checked={residentForm.voter === "Yes"}
                  />
                  <h1>Yes</h1>
                </div>
                <div className="flex flex-row justify-center gap-1">
                  <input
                    type="radio"
                    name="voter"
                    onChange={handleRadioChange}
                    value="No"
                    checked={residentForm.voter === "No"}
                  />
                  <h1>No</h1>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Precinct</label>
              <input
                name="precinct"
                onChange={lettersNumbersAndSpaceOnly}
                value={residentForm.precinct}
                placeholder="Enter precinct"
                className="form-input"
              />
            </div>

            <div className="form-group space-x-5">
              <label className="form-label">Deceased</label>
              <div className="flex flex-row space-x-10">
                <div className="flex flex-row justify-center gap-1">
                  <input
                    type="radio"
                    name="deceased"
                    onChange={handleRadioChange}
                    value="Yes"
                    checked={residentForm.deceased === "Yes"}
                  />
                  <h1>Yes</h1>
                </div>
                <div className="flex flex-row justify-center gap-1">
                  <input
                    type="radio"
                    name="deceased"
                    onChange={handleRadioChange}
                    value="No"
                    checked={residentForm.deceased === "No"}
                  />
                  <h1>No</h1>
                </div>
              </div>
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
                type="email"
                value={residentForm.email}
                onChange={stringsAndNoSpaceOnly}
                placeholder="Enter email"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Mobile Number<label className="text-red-600">*</label>
              </label>
              <input
                name="mobilenumber"
                value={residentForm.mobilenumber}
                onChange={mobileInputChange}
                placeholder="Enter mobile number"
                required
                maxLength={13}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Telephone</label>
              <input
                name="telephone"
                value={residentForm.telephone}
                onChange={telephoneInputChange}
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
                onChange={mobileInputChange}
                placeholder="Enter mobile number"
                required
                maxLength={13}
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
                value={residentForm.mother}
                onChange={handleDropdownChange}
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                {residents
                  .filter((element) => element.sex === "Female")
                  .map((element) => (
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
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                {residents
                  .filter((element) => element.sex === "Male")
                  .map((element) => (
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
                className="form-input"
              >
                <option value="" selected>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="form-group">
              <label className="form-label mt-4">Siblings</label>
              <input
                name="numberofsiblings"
                value={residentForm.numberofsiblings}
                onChange={numbersAndNoSpaceOnly}
                placeholder="Enter number of siblings"
                className="form-input"
              />
            </div>
          </div>
          {parseInt(residentForm.numberofsiblings, 10) > 0 && (
            <div className="form-grid mt-4">{renderSiblingsDropdown()}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="form-group">
              <label className="form-label mt-4 ">Children</label>
              <input
                name="numberofchildren"
                value={residentForm.numberofchildren}
                onChange={numbersAndNoSpaceOnly}
                placeholder="Enter number of children"
                className="form-input"
              />
            </div>
          </div>
          {parseInt(residentForm.numberofchildren, 10) > 0 && (
            <div className="form-grid mt-4">{renderChildrenDropdown()}</div>
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
                <option value="" selected>
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
                value={residentForm.HOAname}
                onChange={handleDropdownChange}
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                <option value="Bermuda Town Homes">Bermuda Town Homes</option>
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
                value={residentForm.employmentstatus}
                onChange={handleDropdownChange}
                className="form-input"
              >
                <option value="" selected>
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
                value={residentForm.monthlyincome}
                onChange={handleDropdownChange}
                className="form-input"
              >
                <option value="" selected>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div className="form-group">
              <label for="educationalattainment" className="form-label">
                Highest Educational Attainment
              </label>
              <select
                id="educationalattainment"
                name="educationalattainment"
                value={residentForm.educationalattainment}
                onChange={handleDropdownChange}
                className="form-input"
              >
                <option value="" selected>
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
                value={residentForm.typeofschool}
                onChange={handleDropdownChange}
                className="form-input"
              >
                <option value="" selected>
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
              type="button"
              onClick={handleReset}
              className="actions-btn bg-btn-color-gray hover:bg-gray-400"
            >
              Clear
            </button>
            <button
              type="submit"
              className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
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

export default CreateResident;
