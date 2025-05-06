import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import { useConfirm } from "../context/ConfirmContext";
import { AuthContext } from "../context/AuthContext";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { FiCamera, FiUpload } from "react-icons/fi";
import { removeBackground } from "@imgly/background-removal";
import api from "../api";
import "../Stylesheets/CommonStyle.css";

function CreateBlotter({ isCollapsed }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { fetchResidents, residents } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [search, setSearch] = useState("");
  const hiddenInputRef1 = useRef(null);
  const [complainantSuggestions, setComplainantSuggestions] = useState([]);
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [isSignProcessing, setIsSignProcessing] = useState(false);
  const [blotterForm, setBlotterForm] = useState({
    complainantID: "",
    complainantname: "",
    complainantaddress: "",
    complainantcontactno: "",
    complainantsignature: "",
    subjectID: "",
    subjectname: "",
    subjectaddress: "",
    type: "",
    details: "",
  });

  useEffect(() => {
    fetchResidents();
  }, []);

  const typeList = ["Theft", "Sexual Harassment", "Physical Injury"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlotterForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleComplainantChange = (e) => {
    const { name, value } = e.target;

    if (name === "complainantname") {
      const matches = residents.filter((res) => {
        const fullName = `${res.firstname} ${
          res.middlename ? res.middlename + " " : ""
        }${res.lastname}`.toLowerCase();
        return fullName.includes(value.toLowerCase());
      });

      setComplainantSuggestions(matches);
      setBlotterForm((prevForm) => ({
        ...prevForm,
        complainantID: "",
        complainantname: value,
        complainantaddress: "",
        complainantcontactno: "",
      }));
    } else {
      setBlotterForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    }
  };

  const handleComplainantSuggestionClick = (res) => {
    const fullName = `${res.firstname} ${
      res.middlename ? res.middlename + " " : ""
    }${res.lastname}`;

    setBlotterForm((prevForm) => ({
      ...prevForm,
      complainantID: res._id,
      complainantname: fullName,
      complainantaddress: res.address,
      complainantcontactno: res.mobilenumber,
    }));

    setComplainantSuggestions([]);
  };

  const handleSubjectChange = (e) => {
    const { name, value } = e.target;

    if (name === "subjectname") {
      const matches = residents.filter((res) => {
        const fullName = `${res.firstname} ${
          res.middlename ? res.middlename + " " : ""
        }${res.lastname}`.toLowerCase();
        return fullName.includes(value.toLowerCase());
      });

      setSubjectSuggestions(matches);
      setBlotterForm((prevForm) => ({
        ...prevForm,
        subjectname: value,
        subjectID: "",
        subjectaddress: "",
      }));
    } else {
      setBlotterForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    }
  };

  const handleSubjectSuggestionClick = (res) => {
    const fullName = `${res.firstname} ${
      res.middlename ? res.middlename + " " : ""
    }${res.lastname}`;

    setBlotterForm((prevForm) => ({
      ...prevForm,
      subjectID: res._id,
      subjectname: fullName,
      subjectaddress: res.address,
    }));

    setSubjectSuggestions([]);
  };

  const handleUploadSig = (event) => {
    hiddenInputRef1.current.click();
  };

  const handleChangeSig = async (event) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      setIsSignProcessing(true);
      try {
        const blob = await removeBackground(fileUploaded);
        const url = URL.createObjectURL(blob);
        setBlotterForm((prevForm) => ({
          ...prevForm,
          complainantsignature: url,
        }));
      } catch (error) {
        console.error("Error removing background:", error);
      } finally {
        setIsSignProcessing(false);
      }
    }
  };

  async function uploadToFirebase(url) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `id_blotter/${Date.now()}_${randomString}.png`;
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to file a blotter report?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    let updatedForm = { ...blotterForm };

    if (updatedForm.complainantID) {
      delete updatedForm.complainantname;
      delete updatedForm.complainantaddress;
      delete updatedForm.complainantcontactno;
      delete updatedForm.complainantsignature;
    } else {
      delete updatedForm.complainantID;
      const signaturePicture = await uploadToFirebase(
        updatedForm.complainantsignature
      );
      updatedForm = {
        ...updatedForm,
        complainantsignature: signaturePicture,
      };
    }

    if (updatedForm.subjectID) {
      delete updatedForm.subjectname;
      delete updatedForm.subjectaddress;
    } else {
      delete updatedForm.subjectID;
    }
    try {
      await api.post("/createblotter", { updatedForm });
      alert("Blotter report successfully submitted!");
      navigation("/blotter-reports");
    } catch (error) {
      console.log("Error creating blotter report", error);
    }
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Blotter Form</div>

        <div className="white-bg-container">
          {/*Complainant Information*/}
          <h3 className="section-title">Complainant Information</h3>
          <hr className="section-divider" />

          <div className="form-grid">
            <div>
              <label className="form-label">Name</label>
              <input
                name="complainantname"
                value={blotterForm.complainantname}
                onChange={handleComplainantChange}
                placeholder="Enter name"
                className="form-input h-[30px] w-full"
                autoComplete="off"
              />
              {blotterForm.complainantname?.length > 0 &&
                complainantSuggestions?.length > 0 && (
                  <ul className="absolute left-0 top-full w-full bg-white border rounded shadow z-[9999] max-h-[150px] overflow-y-auto text-black">
                    {complainantSuggestions.map((res) => {
                      const fullName = `${res.firstname} ${
                        res.middlename ? res.middlename + " " : ""
                      }${res.lastname}`;
                      return (
                        <li
                          key={res.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleComplainantSuggestionClick(res)}
                        >
                          {fullName}
                        </li>
                      );
                    })}
                  </ul>
                )}
            </div>

            <div>
              <label className="form-label">Address</label>
              <input
                name="complainantaddress"
                onChange={handleComplainantChange}
                value={blotterForm.complainantaddress}
                placeholder="Enter address"
                className="form-input h-[30px]"
              />
            </div>

            <div>
              <label className="form-label">Contact No.</label>
              <input
                name="complainantcontactno"
                onChange={handleComplainantChange}
                value={blotterForm.complainantcontactno}
                placeholder="Enter contact no"
                className="form-input h-[30px]"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="col-span-2">
              {!blotterForm.complainantID && (
                <div className="picture-upload-wrapper">
                  <h3 className="form-label">
                    Signature<label className="text-red-600">*</label>
                  </h3>
                  <div className="upload-box">
                    <input
                      onChange={handleChangeSig}
                      type="file"
                      style={{ display: "none" }}
                      ref={hiddenInputRef1}
                    />
                    <div className="upload-content">
                      <div className="preview-container">
                        {isSignProcessing ? (
                          <p>Processing...</p>
                        ) : blotterForm.complainantsignature ? (
                          <img
                            src={blotterForm.complainantsignature}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <p>No Picture Attached</p>
                        )}
                      </div>

                      <div className="upload-signature-btn">
                        <button
                          onClick={handleUploadSig}
                          className="upload-btn"
                        >
                          <FiUpload />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/*Subject of the Complaint Information*/}
          <h3 className="section-title mt-8">
            Subject of the Complaint Information
          </h3>
          <hr className="section-divider" />
          <div className="form-grid">
            <div className="form-group relative">
              <label className="form-label">Name</label>
              <input
                name="subjectname"
                value={blotterForm.subjectname}
                onChange={handleSubjectChange}
                placeholder="Enter name"
                className="form-input h-[30px] w-full"
                autoComplete="off"
              />
              {blotterForm.subjectname?.length > 0 &&
                subjectSuggestions?.length > 0 && (
                  <ul className="absolute left-0 top-full w-full bg-white border rounded shadow z-[9999] max-h-[150px] overflow-y-auto text-black">
                    {subjectSuggestions.map((res) => {
                      const fullName = `${res.firstname} ${
                        res.middlename ? res.middlename + " " : ""
                      }${res.lastname}`;
                      return (
                        <li
                          key={res.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSubjectSuggestionClick(res)}
                        >
                          {fullName}
                        </li>
                      );
                    })}
                  </ul>
                )}
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                name="subjectaddress"
                onChange={handleSubjectChange}
                value={blotterForm.subjectaddress}
                placeholder="Enter address"
                className="form-input h-[30px]"
              />
            </div>
          </div>

          {/*Blotter Information*/}
          <h3 className="section-title mt-8">Blotter Information</h3>
          <hr className="section-divider" />
          <div className="form-grid">
            <div className="form-group">
              <label for="type" className="form-label">
                Type of the Incident
              </label>
              <select
                id="type"
                name="type"
                onChange={handleInputChange}
                value={blotterForm.type}
                className="form-input h-[30px]"
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                {typeList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            <div className="col-span-4">
              <label for="details" className="form-label">
                Details of the Incident
              </label>
              <textarea
                placeholder="Enter details"
                maxLength={1000}
                id="details"
                name="details"
                value={blotterForm.details}
                onChange={handleInputChange}
                className="form-input h-[10rem]"
              />
              <h3 className="text-end">{blotterForm.details.length}/1000</h3>
            </div>
          </div>

          <div className="flex justify-end rounded-md mt-4">
            <button
              onClick={handleSubmit}
              className="actions-btn bg-btn-color-blue"
              type="submit"
            >
              Submit
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default CreateBlotter;
