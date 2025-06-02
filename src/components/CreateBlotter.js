import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../context/ConfirmContext";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { FiUpload } from "react-icons/fi";
import { removeBackground } from "@imgly/background-removal";
import api from "../api";
import "../Stylesheets/CommonStyle.css";
import { GrNext } from "react-icons/gr";

function CreateBlotter({ isCollapsed }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { fetchResidents, residents } = useContext(InfoContext);
  const { blotterreports, fetchBlotterReports } = useContext(InfoContext);
  const hiddenInputRef1 = useRef(null);
  const [complainantSuggestions, setComplainantSuggestions] = useState([]);
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [isSignProcessing, setIsSignProcessing] = useState(false);
  const initialForm = {
    complainantID: "",
    complainantname: "",
    complainantaddress: "",
    complainantcontactno: "",
    complainantsignature: "",
    subjectID: "",
    subjectname: "",
    subjectaddress: "",
    typeofthecomplaint: "",
    details: "",
    date: "",
    starttime: "",
    endtime: "",
  };

  const { blotterForm, setBlotterForm } = useContext(InfoContext);

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
      setBlotterForm(initialForm);
      navigation("/blotter-reports");
    } catch (error) {
      console.log("Error creating blotter report", error);
    }
  };

  const handleDateChange = (e) => {
    const newDateStr = e.target.value;

    setBlotterForm((prev) => {
      return {
        ...prev,
        date: newDateStr,
        starttime: "",
        endtime: "",
      };
    });
  };

  const checkIfTimeSlotIsAvailable = (startTime, endTime) => {
    const selectedStartTime = new Date(startTime);
    const selectedEndTime = new Date(endTime);

    const parseCustomDate = (dateStr) => {
      const [datePart, timePart] = dateStr.split(" at ");
      return new Date(`${datePart} ${timePart}`);
    };

    if (
      isNaN(selectedStartTime.getTime()) ||
      isNaN(selectedEndTime.getTime())
    ) {
      console.warn("Invalid selected time range");
      return { isAvailable: false, conflict: null };
    }

    const conflict = blotterreports
      .filter((blot) => blot.status === "Scheduled")
      .find((blot) => {
        const reservedStart = parseCustomDate(blot.starttime);
        const reservedEnd = parseCustomDate(blot.endtime);

        if (isNaN(reservedStart.getTime()) || isNaN(reservedEnd.getTime())) {
          return false; // skip invalid records
        }

        return (
          selectedStartTime < reservedEnd && selectedEndTime > reservedStart
        );
      });

    if (conflict) {
      return {
        isAvailable: false,
        conflict: {
          start: parseCustomDate(conflict.starttime),
          end: parseCustomDate(conflict.endtime),
        },
      };
    }

    return { isAvailable: true, conflict: null };
  };

  const handleReset = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to clear all the fields?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    setBlotterForm(initialForm);
  };

  const handleStartTimeChange = (e) => {
    const time = e.target.value;
    const newStartTime = new Date(`${blotterForm.date}T${time}:00`);

    if (!blotterForm.date) {
      alert("Please select a date first.");
      return;
    }

    setBlotterForm((prev) => ({
      ...prev,
      starttime: newStartTime.toISOString(),
      endtime: "",
    }));
  };

  const handleEndTimeChange = (e) => {
    const time = e.target.value;
    const newEndTime = new Date(`${blotterForm.date}T${time}:00`);
    const startTime = new Date(blotterForm.starttime);
    if (!blotterForm.date) {
      alert("Please select a date first.");
      return;
    }
    if (!blotterForm.starttime) {
      alert("Please select a start time first.");
      return;
    }

    if (newEndTime <= startTime) {
      alert("End time must be after the start time.");
      return;
    }

    const { isAvailable, conflict } = checkIfTimeSlotIsAvailable(
      startTime,
      newEndTime
    );

    if (!isAvailable) {
      const conflictInfo = conflict
        ? `This time slot overlaps with an existing schedule of ${conflict.start.toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )} - ${conflict.end.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}.`
        : "This time slot overlaps with another schedule.";
      alert(conflictInfo);
      setBlotterForm((prev) => ({ ...prev, endtime: "" }));
      return;
    }

    setBlotterForm((prev) => ({
      ...prev,
      endtime: newEndTime.toISOString(),
    }));
  };

  const formatTimeToHHMM = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="flex flex-col md:flex-row lg:flex-row gap-x-3 items-center">
          <h1
            onClick={() => navigation("/blotter-reports")}
            className="text-[30px] font-bold font-title text-[#7D7979] cursor-pointer"
          >
            Blotter Reports
          </h1>
          <GrNext className="text-[#7D7979] text-lg font-bold" />
          <h1 className="header-text">Blotter Form</h1>
        </div>

        <form
          className="bg-[#fff] w-full h-full rounded-bl-xl rounded-br-xl p-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/*Complainant Information*/}
          <h3 className="section-title">Complainant Information</h3>
          <hr className="section-divider" />

          <div className="form-grid">
            <div className="form-group relative">
              <div>
                <label className="form-label">
                  Name<label className="text-red-600">*</label>
                </label>
                <input
                  name="complainantname"
                  value={blotterForm.complainantname}
                  onChange={handleComplainantChange}
                  placeholder="Enter name"
                  className="form-input h-[30px] w-full"
                  autoComplete="off"
                  required
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
                            onClick={() =>
                              handleComplainantSuggestionClick(res)
                            }
                          >
                            {fullName}
                          </li>
                        );
                      })}
                    </ul>
                  )}
              </div>
            </div>

            <div>
              <label className="form-label">
                Address<label className="text-red-600">*</label>
              </label>
              <input
                name="complainantaddress"
                onChange={handleComplainantChange}
                value={blotterForm.complainantaddress}
                placeholder="Enter address"
                className="form-input h-[30px]"
                required
              />
            </div>

            <div>
              <label className="form-label">
                Contact No.<label className="text-red-600">*</label>
              </label>
              <input
                name="complainantcontactno"
                onChange={handleComplainantChange}
                value={blotterForm.complainantcontactno}
                placeholder="Enter contact no"
                className="form-input h-[30px]"
                required
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
              <label className="form-label">
                Name<label className="text-red-600">*</label>
              </label>
              <input
                name="subjectname"
                value={blotterForm.subjectname}
                onChange={handleSubjectChange}
                placeholder="Enter name"
                className="form-input h-[30px] w-full"
                autoComplete="off"
                required
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
                Type of the Incident<label className="text-red-600">*</label>
              </label>
              <select
                id="typeofthecomplaint"
                name="typeofthecomplaint"
                onChange={handleInputChange}
                value={blotterForm.typeofthecomplaint}
                className="form-input h-[30px]"
                required
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
                Details of the Incident<label className="text-red-600">*</label>
              </label>
              <textarea
                placeholder="Enter details"
                maxLength={1000}
                id="details"
                name="details"
                value={blotterForm.details}
                onChange={handleInputChange}
                className="w-full h-[15rem] resize-none border border-btn-color-gray rounded-md text-justify font-subTitle font-semibold p-2"
                required
              />
              <h3 className="text-end">{blotterForm.details.length}/1000</h3>
            </div>
          </div>

          {/*Settlement Proceedings*/}
          <label className="section-title text-start">
            Schedule Information
          </label>
          <hr class="section-divider" />
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3 mt-4">
            <div>
              <label className="form-label">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={blotterForm.date ? blotterForm.date : ""}
                onChange={handleDateChange}
                className="form-input h-[30px] pr-2"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="form-label">Start Time</label>
              <input
                type="time"
                id="starttime"
                name="starttime"
                className="form-input h-[30px] pr-2"
                onChange={handleStartTimeChange}
                value={formatTimeToHHMM(blotterForm.starttime)}
              />
            </div>
            <div>
              <label className="form-label">End Time </label>
              <input
                type="time"
                id="endtime"
                name="endtime"
                className="form-input h-[30px] pr-2"
                onChange={handleEndTimeChange}
                value={formatTimeToHHMM(blotterForm.endtime)}
              />
            </div>
          </div>

          <div className="flex justify-end rounded-md mt-4">
            <button
              type="button"
              onClick={handleReset}
              className="actions-btn bg-btn-color-gray hover:bg-gray-400"
            >
              Clear
            </button>
            <button className="actions-btn bg-btn-color-blue" type="submit">
              Submit
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

export default CreateBlotter;
