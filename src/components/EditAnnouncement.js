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

//ICONS
import { MdInsertPhoto, MdCalendarMonth } from "react-icons/md";

function EditAnnouncement({ onClose, announcementID }) {
  const confirm = useConfirm();
  const [name, setName] = useState("");
  const [eventDetails, setEventDetails] = useState("");
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

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        let formattedDate;
        let formattedStartTime;
        let formattedEndTime;
        const response = await api.get(`/getannouncement/${announcementID}`);
        if (response.data.picture !== "") {
          setHavePicture(true);
        }
        if (response.data.eventStart !== null) {
          formattedDate = new Date(response.data.eventStart)
            .toISOString()
            .split("T")[0];
          formattedStartTime = formatToTimeForInput(
            new Date(response.data.eventStart)
          );
          formattedEndTime = formatToTimeForInput(
            new Date(response.data.eventEnd)
          );
          setEventDetails(
            `📅 ${new Date(response.data.eventStart).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}\n🕒 ${new Date(response.data.eventStart).toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )} - ${new Date(response.data.eventEnd).toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}`
          );
        }
        setAnnouncementForm(() => ({
          category: response.data.category,
          title: response.data.title,
          content: response.data.content,
          picture: response.data.picture || "",
          eventDate: formattedDate || "",
          eventStartTime: formattedStartTime || "",
          eventEndTime: formattedEndTime || "",
        }));
      } catch (error) {
        console.log("Error fetching announcement", error);
      }
    };
    fetchAnnouncement();
  }, []);

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
      "Are you sure you want to edit this announcement?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    onClose();
    try {
      const firebaseBaseUrl = "https://firebasestorage.googleapis.com/";
      if (
        announcementForm.picture !== "" &&
        !announcementForm.picture.startsWith(firebaseBaseUrl)
      ) {
        const pictureUrl = await uploadToFirebase(announcementForm.picture);
        const response = await api.post(`/editannouncement/${announcementID}`, {
          announcementForm: { ...announcementForm, picture: pictureUrl },
        });
      } else {
        const response = await api.post(`/editannouncement/${announcementID}`, {
          announcementForm,
        });
      }
      alert("Announcement successfully updated!");
    } catch (error) {
      console.log("Error updating announcement", error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const handleRemovePic = () => {
    setAnnouncementForm((prev) => ({
      ...prev,
      picture: "",
    }));
    setHavePicture(false);
    hiddenInputRef1.current.value = "";
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
        const pictureUrl = URL.createObjectURL(files[0]);
        setAnnouncementForm((prev) => ({
          ...prev,
          picture: pictureUrl,
        }));
        setHavePicture(true);
      } else {
        setAnnouncementForm((prev) => ({
          ...prev,
          picture: "",
        }));
        setHavePicture(false);
      }
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

  const handleCancel = () => {
    setAnnouncementForm((prev) => ({
      ...prev,
      eventDate: "",
      eventStart: "",
      eventEnd: "",
      eventStartTime: "",
      eventEndTime: "",
    }));
    setEventDetails(null);
    setShowDateTimeInputs(false);
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

      setAnnouncementForm((prev) => ({
        ...prev,
        event: combinedDateTime.toISOString(),
        eventStart: combinedDateTime.toISOString(),
        eventEnd: combinedDateTime2.toISOString(),
        eventDate: formatToDateForInput(combinedDateTime),
        eventStartTime: formatToTimeForInput(combinedDateTime),
        eventEndTime: formatToTimeForInput(combinedDateTime2),
      }));
      setEventDetails(
        `📅 ${formattedDate}\n🕒 ${formattedTime} - ${formattedTime2}`
      );
    }

    setShowDateTimeInputs(false);
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
          <div className="modal-content w-[45rem] h-[30rem]">
            <div className="modal-title-bar bg-navy-blue">
              <h1 className="modal-title">Edit Announcement</h1>
              <button className="modal-btn-close">
                <IoClose className="btn-close-icon" onClick={handleClose} />
              </button>
            </div>
            <div className="w-full overflow-y-auto">
              <form
                className="employee-form-container"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                {/*UPLOADER - DETAILS*/}
                <div className="flex items-center w-full">
                  <img
                    src={user.picture}
                    alt="Profile"
                    className="navbar-profile-img"
                  />
                  <div className="flex flex-col items-start ml-2">
                    <label className="text-base font-semibold">
                      {user.name}
                    </label>
                    <label className="text-sm font-regular text-gray-500">
                      {user.role}
                    </label>
                  </div>
                </div>

                {/*CATEGORY, TITLE, CONTENT*/}
                <div className="flex flex-row w-full">
                  <div className="employee-form-group">
                    <label for="resID" className="form-label">
                      Category<label className="text-red-600">*</label>
                    </label>
                    <select
                      id="category"
                      name="category"
                      onChange={handleInputChange}
                      value={announcementForm.category}
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
                      value={announcementForm.title}
                      onChange={handleInputChange}
                      className="form-input h-[30px]"
                    />
                  </div>
                </div>
                <div className="employee-form-group">
                  <label className="form-label">Content</label>
                  <textarea
                    type="text"
                    id="content"
                    name="content"
                    value={announcementForm.content}
                    onChange={handleInputChange}
                    className="form-input h-[100px] "
                  />
                </div>
                {eventDetails && (
                  <div className="employee-form-group">
                    <label className="font-semibold text-navy-blue">
                      Event Details
                    </label>
                    <p>{eventDetails}</p>
                  </div>
                )}
                {havePicture && (
                  <div className="employee-form-group">
                    <label className="font-semibold text-navy-blue">
                      Attachment
                    </label>
                    <div className="create-announcement-attachment">
                      <label
                        style={{ cursor: "pointer" }}
                        onClick={handleRemovePic}
                      >
                        X
                      </label>
                      <img
                        src={announcementForm.picture}
                        className="w-full h-[30rem] mt-2"
                      />
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/*ADD TO YOUR POST AND SUBMIT BUTTON*/}
            <div className="mt-4 w-full">
              <div className="create-announcement-fixed-btns">
                <label className="font-semibold text-navy-blue">
                  Add to your post
                </label>
                <div className="flex flex-row items-center justify-center">
                  <button
                    type="button"
                    onClick={handleUploadPicture}
                    className=" text-[#50C700] "
                  >
                    <MdInsertPhoto className="w-[2rem] h-[2rem]" />
                  </button>
                  <input
                    name="picture"
                    onChange={handleInputChange}
                    type="file"
                    style={{ display: "none" }}
                    ref={hiddenInputRef1}
                  />

                  <button
                    type="button"
                    onClick={handleEvent}
                    className=" text-[#FFB200] "
                  >
                    <MdCalendarMonth className="w-[2rem] h-[2rem]" />
                  </button>

                  {/*SHOW EVENT DETAILS */}
                  {showDateTimeInputs && (
                    <div className="create-announcement-event-details">
                      <div className="modal-title-bar bg-navy-blue">
                        <h1 className="modal-title">Event Details</h1>
                      </div>

                      <form className="employee-form-container">
                        <div className="employee-form-group">
                          <label className="text-base font-semibold text-navy-blue">
                            Date
                          </label>
                          <input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            value={announcementForm.eventDate}
                            name="eventDate"
                            onChange={handleInputChange}
                            className="form-input h-[30px] text-base"
                          />
                        </div>

                        <div className="employee-form-group">
                          <label className="text-base font-semibold text-navy-blue">
                            Start Time
                          </label>
                          <input
                            type="time"
                            name="eventStartTime"
                            value={announcementForm.eventStartTime}
                            onChange={handleInputChange}
                            className="create-announcement-event-input"
                          />
                        </div>

                        <div className="employee-form-group">
                          <label className="text-base font-semibold text-navy-blue">
                            End Time
                          </label>
                          <input
                            type="time"
                            name="eventEndTime"
                            value={announcementForm.eventEndTime}
                            onChange={handleInputChange}
                            className="create-announcement-event-input"
                          />
                        </div>

                        <button
                          onClick={handleCancel}
                          type="button"
                          className="actions-btn bg-btn-color-blue"
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={handleOK}
                          type="button"
                          className="actions-btn bg-btn-color-blue"
                        >
                          OK
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                type="submit"
                className="actions-btn bg-btn-color-blue w-full"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EditAnnouncement;
