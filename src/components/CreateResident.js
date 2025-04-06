import Webcam from "react-webcam";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import OpenCamera from "./OpenCamera";
import { removeBackground } from "@imgly/background-removal";

function CreateResident() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [id, setId] = useState(null);
  const [signature, setSignature] = useState(null);
  const hiddenInputRef1 = useRef(null);
  const hiddenInputRef2 = useRef(null);
  const [residentForm, setResidentForm] = useState({ fname: "", mname: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");
    const capitalizeFirstLetter = lettersOnly
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    setResidentForm((prev) => ({
      ...prev,
      [name]: capitalizeFirstLetter,
    }));
  };

  const toggleCamera = () => {
    setIsCameraOpen((prev) => !prev);
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

      <div
        style={{
          diplay: "flex",
          flexDirection: "row",
          gap: "50px",
          border: "1px solid black",
        }}
      >
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
          width: "200px",
          marginTop: "20px",
        }}
      >
        <input
          type="text"
          name="fname"
          value={residentForm.fname}
          onChange={handleInputChange}
          placeholder="Enter first name"
          required
        />
        <input
          name="mname"
          value={residentForm.mname}
          onChange={handleInputChange}
          placeholder="Enter middle name"
        />
        <input name="lname" placeholder="Enter last name" required />
        <button type="submit">Submit</button>
      </form>
      {isCameraOpen && <OpenCamera />}
    </div>
  );
}

export default CreateResident;
