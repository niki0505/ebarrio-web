import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import "../App.css";
import { InfoContext } from "../context/InfoContext";
import { IoClose } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";
import { AuthContext } from "../context/AuthContext";
import { FaCalendarAlt } from "react-icons/fa";
import { FiCalendar, FiUpload } from "react-icons/fi";
import { storage } from "../firebase";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";

function CreateAnnouncement({ onClose }) {
  const confirm = useConfirm();
  const [name, setName] = useState("");

  const [havePicture, setHavePicture] = useState(false);
  const { user } = useContext(AuthContext);
  const hiddenInputRef1 = useRef(null);
  const [showDateTimeInputs, setShowDateTimeInputs] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    category: "",
    title: "",
    content: "",
    picture: "",
    eventStart: "",
    eventEnd: "",
    eventStartTime: "",
    eventEndTime: "",
    eventDate: "",
    uploadedby: user.empID,
  });
  const [showModal, setShowModal] = useState(true);

  async function uploadToFirebase(url) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `id_announcements/${Date.now()}_${randomString}.png`;
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
      "Are you sure you want to create an announcement?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    onClose();
    try {
      const pictureUrl = await uploadToFirebase(announcementForm.picture);
      const response = await api.post("/createannouncement", {
        announcementForm: { ...announcementForm, picture: pictureUrl },
      });
      alert("Announcement successfully created!");
    } catch (error) {
      console.log("Error creating announcement", error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const categoryList = [
    "General",
    "Public Safety & Emergency",
    "Health & Sanitation",
    "Social Services",
    "Infrastructure",
    "Education & Youth",
  ];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "picture") {
      if (files && files[0]) {
        setHavePicture(true);
      } else {
        setHavePicture(false);
      }
      const pictureUrl = URL.createObjectURL(files[0]);
      setAnnouncementForm((prev) => ({
        ...prev,
        picture: pictureUrl,
      }));
    } else {
      setAnnouncementForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEvent = () => {
    setShowDateTimeInputs((prev) => !prev);
  };

  const handleUploadPicture = (event) => {
    hiddenInputRef1.current.click();
  };

  const handleOK = () => {
    if (
      announcementForm.eventDate &&
      announcementForm.eventStartTime &&
      announcementForm.eventEndTime
    ) {
      const dateParts = announcementForm.eventDate.split("-");
      const timeParts = announcementForm.eventStartTime.split(":");
      const timeParts2 = announcementForm.eventEndTime.split(":");
      const combinedDateTime = new Date(
        `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}T${timeParts[0]}:${timeParts[1]}:00`
      );
      const combinedDateTime2 = new Date(
        `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}T${timeParts2[0]}:${timeParts2[1]}:00`
      );
      const formattedDate = combinedDateTime.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const formattedTime = combinedDateTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const formattedTime2 = combinedDateTime2.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const cleanedContent = announcementForm.content
        .split("\n")
        .filter((line) => !line.startsWith("📅") && !line.startsWith("🕒"))
        .join("\n");
      setAnnouncementForm((prev) => ({
        ...prev,
        event: combinedDateTime.toISOString(),
        eventStart: combinedDateTime.toISOString(),
        eventEnd: combinedDateTime2.toISOString(),
        eventDate: formatToDateForInput(combinedDateTime),
        eventStartTime: formatToTimeForInput(combinedDateTime),
        eventEndTime: formatToTimeForInput(combinedDateTime2),
        content: `${cleanedContent}\n📅 ${formattedDate}\n🕒 ${formattedTime} - ${formattedTime2}`,
      }));
    }

    setShowDateTimeInputs(false);
    console.log(announcementForm);
  };

  const formatToDateForInput = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatToTimeForInput = (time) => {
    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  return (
    <>
      {setShowModal && (
        <div className="modal-container">
          <div className="modal-content w-[20rem] h-[30rem] ">
            <div className="modal-title-bar bg-navy-blue">
              <h1 className="modal-title">Add New Announcement</h1>
              <button className="modal-btn-close">
                <IoClose className="btn-close-icon" onClick={handleClose} />
              </button>
            </div>
            <div
              style={{
                overflowY: "auto",
                maxHeight: "70%",
                scrollbarWidth: "none",
                padding: "10px",
              }}
            >
              <form
                className="employee-form-container"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="employee-form-group">
                  <label for="resID" className="form-label">
                    Category<label className="text-red-600">*</label>
                  </label>
                  <select
                    id="category"
                    name="category"
                    onChange={handleInputChange}
                    className="form-input h-[30px]"
                  >
                    <option value="Select" disabled selected hidden>
                      Select
                    </option>
                    {categoryList.map((element) => (
                      <option value={element}>{element}</option>
                    ))}
                  </select>
                </div>
                <div className="employee-form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    onChange={handleInputChange}
                    className="form-input h-[30px]"
                  />
                </div>
                <div className="employee-form-group">
                  <label className="form-label">Content</label>
                  <textarea
                    type="text"
                    id="content"
                    name="content"
                    value={announcementForm.content}
                    onChange={handleInputChange}
                    className="form-input h-[100px]"
                  />
                </div>
                {havePicture && (
                  <>
                    <label>Attachment</label>
                    <img
                      src={announcementForm.picture}
                      width={100}
                      height={100}
                    />
                  </>
                )}
                <div>
                  <button
                    type="button"
                    onClick={handleUploadPicture}
                    className="upload-btn"
                  >
                    <FiUpload />
                  </button>
                  <input
                    name="picture"
                    onChange={handleInputChange}
                    type="file"
                    style={{ display: "none" }}
                    ref={hiddenInputRef1}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleEvent}
                    className="upload-btn"
                  >
                    <FiCalendar />
                  </button>
                </div>
                {showDateTimeInputs && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      position: "absolute",
                      top: "60px",
                      backgroundColor: "white",
                      left: "10px",
                      zIndex: 10,
                      border: "1px solid black",
                    }}
                  >
                    <label>Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={announcementForm.eventDate}
                      name="eventDate"
                      onChange={handleInputChange}
                      style={{
                        marginTop: "10px",
                        width: "180px",
                        padding: "5px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                      }}
                    />
                    <label>Start Time</label>
                    <input
                      type="time"
                      name="eventStartTime"
                      value={announcementForm.eventStartTime}
                      onChange={handleInputChange}
                      style={{
                        marginTop: "10px",
                        width: "180px",
                        padding: "5px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                      }}
                    />
                    <label>End Time</label>
                    <input
                      type="time"
                      name="eventEndTime"
                      value={announcementForm.eventEndTime}
                      onChange={handleInputChange}
                      style={{
                        marginTop: "10px",
                        width: "180px",
                        padding: "5px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                      }}
                    />
                    <button onClick={handleOK} type="button">
                      OK
                    </button>
                  </div>
                )}
                <button type="submit" className="actions-btn bg-btn-color-blue">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateAnnouncement;
