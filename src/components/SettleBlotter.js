import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import { useConfirm } from "../context/ConfirmContext";
import { AuthContext } from "../context/AuthContext";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { FiCamera, FiUpload } from "react-icons/fi";
import { removeBackground } from "@imgly/background-removal";
import api from "../api";

function SettleBlotter({ isCollapsed }) {
  const location = useLocation();
  const { blotterID } = location.state || {};
  const confirm = useConfirm();
  const navigation = useNavigate();
  const [blotter, setBlotter] = useState([]);
  const { fetchResidents, residents } = useContext(InfoContext);
  const hiddenInputRef1 = useRef(null);
  const hiddenInputRef2 = useRef(null);
  const [witnessSuggestions, setWitnessSuggestions] = useState([]);
  const [isSignProcessing, setIsSignProcessing] = useState(false);
  const [isSignProcessing2, setIsSignProcessing2] = useState(false);
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

  const [settleForm, setSettleForm] = useState({
    subjectsignature: "",
    witnessID: "",
    witnessname: "",
    witnesssignature: "",
    agreementdetails: "",
  });

  const typeList = ["Theft", "Sexual Harassment", "Physical Injury"];

  useEffect(() => {
    fetchResidents();
  }, []);

  console.log(blotter);

  useEffect(() => {
    const fetchBlotter = async () => {
      try {
        const response = await api.get(`/getblotter/${blotterID}`);
        setBlotter(response.data);

        setBlotterForm((prev) => ({
          ...prev,
          complainantname: response.data.complainantID
            ? `${response.data.complainantID.firstname} ${
                response.data.complainantID.middlename || ""
              } ${response.data.complainantID.lastname}`
            : response.data.complainantname,
          complainantaddress: response.data.complainantID
            ? response.data.complainantID.address
            : response.data.complainantaddress,
          complainantcontactno: response.data.complainantID
            ? response.data.complainantID.mobilenumber
            : response.data.complainantcontactno,
          subjectname: response.data.subjectID
            ? `${response.data.subjectID.firstname} ${
                response.data.subjectID.middlename || ""
              } ${response.data.subjectID.lastname}`
            : response.data.subjectname,
          subjectaddress: response.data.subjectID
            ? response.data.subjectID.address
            : response.data.subjectaddress,
          type: response.data.type,
          details: response.data.details,
        }));
      } catch (error) {
        console.log("Error fetching blotter", error);
      }
    };
    fetchBlotter();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettleForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleWitnessChange = (e) => {
    const { name, value } = e.target;

    if (name === "witnessname") {
      const matches = residents.filter((res) => {
        const fullName = `${res.firstname} ${
          res.middlename ? res.middlename + " " : ""
        }${res.lastname}`.toLowerCase();
        return fullName.includes(value.toLowerCase());
      });

      setWitnessSuggestions(matches);
      setSettleForm((prevForm) => ({
        ...prevForm,
        witnessID: "",
        witnessname: value,
      }));
    } else {
      setSettleForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    }
  };

  const handleWitnessSuggestionClick = (res) => {
    const fullName = `${res.firstname} ${
      res.middlename ? res.middlename + " " : ""
    }${res.lastname}`;

    setSettleForm((prevForm) => ({
      ...prevForm,
      witnessID: res._id,
      witnessname: fullName,
    }));

    setWitnessSuggestions([]);
  };

  const handleUploadSig = (event) => {
    hiddenInputRef1.current.click();
  };
  const handleUploadSig2 = (event) => {
    hiddenInputRef2.current.click();
  };

  const handleChangeSig = async (event) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      setIsSignProcessing(true);
      try {
        const blob = await removeBackground(fileUploaded);
        const url = URL.createObjectURL(blob);
        setSettleForm((prevForm) => ({
          ...prevForm,
          subjectsignature: url,
        }));
      } catch (error) {
        console.error("Error removing background:", error);
      } finally {
        setIsSignProcessing(false);
      }
    }
  };

  const handleChangeSig2 = async (event) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      setIsSignProcessing2(true);
      try {
        const blob = await removeBackground(fileUploaded);
        const url = URL.createObjectURL(blob);
        setSettleForm((prevForm) => ({
          ...prevForm,
          witnesssignature: url,
        }));
      } catch (error) {
        console.error("Error removing background:", error);
      } finally {
        setIsSignProcessing2(false);
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
      "Are you sure you want to settle this blotter report?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    let updatedForm = { ...settleForm };

    if (updatedForm.witnessID) {
      delete updatedForm.witnessname;
    } else {
      delete updatedForm.witnessID;
      const signaturePicture = await uploadToFirebase(
        updatedForm.witnesssignature
      );
      updatedForm = {
        ...updatedForm,
        witnesssignature: signaturePicture,
      };
    }

    if (blotter.subjectID) {
      delete updatedForm.subjectsignature;
    } else {
      const signaturePicture = await uploadToFirebase(
        updatedForm.subjectsignature
      );
      updatedForm = {
        ...updatedForm,
        subjectsignature: signaturePicture,
      };
    }

    try {
      await api.put(`/settleblotter/${blotterID}`, { updatedForm });
      alert("Blotter successfully settled!");
      navigation("/blotter-reports");
    } catch (error) {
      console.log("Error settling blotter", error);
    }
  };

  console.log(settleForm);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Settle Agreement Form</div>

        {/*Complainant Information*/}
        <label>Complainant Information</label>
        <div className="form-group relative">
          <label className="form-label">Name</label>
          <input
            name="complainantname"
            value={blotterForm.complainantname}
            placeholder="Enter name"
            className="form-input h-[30px] w-full"
            readOnly
          />
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            name="complainantaddress"
            value={blotterForm.complainantaddress}
            placeholder="Enter name"
            className="form-input h-[30px]"
            readOnly
          />
        </div>

        <div className="form-group">
          <label className="form-label">Contact No.</label>
          <input
            name="complainantcontactno"
            value={blotterForm.complainantcontactno}
            placeholder="Enter name"
            className="form-input h-[30px]"
            readOnly
          />
        </div>

        {/*Subject of the Complaint Information*/}
        <label>Subject of the Complaint Information</label>

        <div className="form-group relative">
          <label className="form-label">Name</label>
          <input
            name="subjectname"
            value={blotterForm.subjectname}
            placeholder="Enter name"
            className="form-input h-[30px] w-full"
            readOnly
          />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input
            name="subjectaddress"
            value={blotterForm.subjectaddress}
            placeholder="Enter name"
            className="form-input h-[30px]"
            readOnly
          />
        </div>

        {!blotter.complainantID && (
          <div className="picture-upload-wrapper">
            <h3 className="form-label">
              Signature<label className="text-red-600">*</label>
            </h3>
            <div className="upload-box">
              <input
                onChange={handleChangeSig}
                type="file"
                name="subjectsignature"
                style={{ display: "none" }}
                ref={hiddenInputRef1}
              />
              <div className="upload-content">
                <div className="preview-container">
                  {isSignProcessing ? (
                    <p>Processing...</p>
                  ) : settleForm.subjectsignature ? (
                    <img
                      src={settleForm.subjectsignature}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <p>No Picture Attached</p>
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
        )}

        {/*Blotter Information*/}
        <label>Blotter Information</label>
        <div className="form-group">
          <label for="type" className="form-label">
            Type of the Incident
          </label>
          <select
            id="type"
            name="type"
            value={blotterForm.type}
            className="form-input h-[30px]"
            readOnly
          >
            <option value="" disabled selected hidden>
              Select
            </option>
            {typeList.map((element) => (
              <option value={element}>{element}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label for="details" className="form-label">
            Details
          </label>
          <textarea
            maxLength={1000}
            id="details"
            name="details"
            value={blotterForm.details}
            readOnly
          />
          <label>{blotterForm.details.length}/1000</label>
        </div>

        {/*Agreement Information*/}
        <label>Agreement Information</label>
        <div className="form-group">
          <label for="details" className="form-label">
            Details
          </label>
          <textarea
            maxLength={1000}
            onChange={handleInputChange}
            id="agreementdetails"
            name="agreementdetails"
            value={settleForm.agreementdetails}
          />
          <label>{settleForm.agreementdetails.length}/1000</label>
        </div>

        {/*Witness Information*/}
        <label>Witness Information</label>
        <div className="form-group relative">
          <div className="form-group">
            <label for="type" className="form-label">
              Name
            </label>
            <input
              name="witnessname"
              value={settleForm.witnessname}
              onChange={handleWitnessChange}
              placeholder="Enter name"
              className="form-input h-[30px] w-full"
              autoComplete="off"
            />
            {settleForm.witnessname?.length > 0 &&
              witnessSuggestions?.length > 0 && (
                <ul className="absolute left-0 top-full w-full bg-white border rounded shadow z-[9999] max-h-[150px] overflow-y-auto text-black">
                  {witnessSuggestions.map((res) => {
                    const fullName = `${res.firstname} ${
                      res.middlename ? res.middlename + " " : ""
                    }${res.lastname}`;
                    return (
                      <li
                        key={res.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleWitnessSuggestionClick(res)}
                      >
                        {fullName}
                      </li>
                    );
                  })}
                </ul>
              )}
          </div>
        </div>

        {!settleForm.witnessID && (
          <div className="form-group">
            <label for="type" className="form-label">
              Signature
            </label>
            <div className="upload-box">
              <input
                onChange={handleChangeSig2}
                type="file"
                name="witnesssignature"
                style={{ display: "none" }}
                ref={hiddenInputRef2}
              />
              <div className="upload-content">
                <div className="preview-container">
                  {isSignProcessing2 ? (
                    <p>Processing...</p>
                  ) : settleForm.witnesssignature ? (
                    <img
                      src={settleForm.witnesssignature}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <p>No Picture Attached</p>
                  )}
                </div>

                <div className="upload-signature-btn">
                  <button onClick={handleUploadSig2} className="upload-btn">
                    <FiUpload />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="actions-btn bg-btn-color-blue"
          type="submit"
        >
          Submit
        </button>
      </main>
    </>
  );
}

export default SettleBlotter;
