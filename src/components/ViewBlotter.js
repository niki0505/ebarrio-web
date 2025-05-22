import { useEffect, useRef, useState, useContext } from "react";
import "../App.css";
import { IoClose } from "react-icons/io5";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";
import { InfoContext } from "../context/InfoContext";
import SettleBlotter from "./SettleBlotter";
import BlotterReject from "./BlotterReject";
import BlotterPrint from "./blotter/BlotterPrint";
import { useNavigate } from "react-router-dom";

function ViewBlotter({ onClose, blotterID }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const [blotter, setBlotter] = useState([]);
  const [captain, setCaptain] = useState([]);
  const { blotterreports, fetchBlotterReports } = useContext(InfoContext);
  const [isRejectClicked, setRejectClicked] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [scheduleForm, setScheduleForm] = useState({
    date: null,
    starttime: null,
    endtime: null,
  });
  const [expandedDetails, setExpandedDetails] = useState([]);

  useEffect(() => {
    const fetchCaptain = async () => {
      try {
        const response = await api.get("/getcaptain");
        setCaptain(response.data);
      } catch (error) {
        console.log("Error fetching captain");
      }
    };
    fetchCaptain();
  }, []);

  useEffect(() => {
    const fetchBlotter = async () => {
      try {
        const response = await api.get(`/getblotter/${blotterID}`);
        setBlotter(response.data);

        const starttime = response.data.starttime
          ? new Date(response.data.starttime)
          : null;
        const endtime = response.data.endtime
          ? new Date(response.data.endtime)
          : null;

        setScheduleForm((prev) => ({
          ...prev,
          date: starttime ? starttime.toISOString().split("T")[0] : null,
          starttime: starttime ? starttime.toISOString() : null,
          endtime: endtime ? endtime.toISOString() : null,
        }));
      } catch (error) {
        console.log("Error fetching blotter", error);
      }
    };
    fetchBlotter();
    fetchBlotterReports();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    const dateParts = selectedDate.split("-");
    const newDate = new Date(
      Date.UTC(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2])
      )
    );

    const prevStartTime = new Date(scheduleForm.starttime);
    const prevEndTime = new Date(scheduleForm.endtime);

    const updatedStarttime = new Date(newDate);
    updatedStarttime.setHours(prevStartTime.getHours());
    updatedStarttime.setMinutes(prevStartTime.getMinutes());

    const updatedEndtime = new Date(newDate);
    updatedEndtime.setHours(prevEndTime.getHours());
    updatedEndtime.setMinutes(prevEndTime.getMinutes());

    setScheduleForm((prev) => ({
      ...prev,
      date: newDate.toISOString().split("T")[0],
      starttime: null,
      endtime: null,
    }));
  };

  const checkIfTimeSlotIsAvailable = (startTime, endTime) => {
    const selectedStartTime = new Date(startTime);
    const selectedEndTime = new Date(endTime);

    return blotterreports
      .filter((blot) => blot.status === "Scheduled" && blot._id !== blotterID)
      .every((blot) => {
        const reservedStart = new Date(blot.starttime);
        const reservedEnd = new Date(blot.endtime);
        if (
          (selectedStartTime >= reservedStart &&
            selectedStartTime < reservedEnd) ||
          (selectedEndTime > reservedStart && selectedEndTime <= reservedEnd)
        ) {
          return false;
        }
        return (
          selectedEndTime <= reservedStart || selectedStartTime >= reservedEnd
        );
      });
  };

  const handleStartTimeChange = (e) => {
    const time = e.target.value;
    const [hours, minutes] = time.split(":");

    const newStartTime = new Date(scheduleForm.date || new Date());
    newStartTime.setHours(Number(hours));
    newStartTime.setMinutes(Number(minutes));

    if (!checkIfTimeSlotIsAvailable(newStartTime, scheduleForm.endtime)) {
      const conflictingBlotter = blotterreports
        .filter((blot) => blot.status === "Scheduled" && blot._id !== blotterID)
        .find((blot) => {
          const reservedStart = new Date(blot.starttime);
          const reservedEnd = new Date(blot.endtime);

          return (
            (newStartTime >= reservedStart && newStartTime < reservedEnd) ||
            (newStartTime < reservedStart &&
              scheduleForm.endtime > reservedStart)
          );
        });

      if (conflictingBlotter) {
        const newStartTimeAfterConflict = new Date(conflictingBlotter.endtime);
        alert(
          `The time slot overlaps with an existing blotter. Your start time has been updated to ${newStartTimeAfterConflict.toLocaleTimeString()} (the end time of the previous blotter).`
        );

        setScheduleForm((prev) => ({
          ...prev,
          starttime: newStartTimeAfterConflict.toISOString(),
          endtime: null,
        }));
      }
      return;
    }

    setScheduleForm((prev) => ({
      ...prev,
      starttime: newStartTime.toISOString(),
      endtime: null,
    }));
  };

  const handleEndTimeChange = (e) => {
    const time = e.target.value;
    const [hours, minutes] = time.split(":");

    const newEndTime = new Date(scheduleForm.date || new Date());
    newEndTime.setHours(Number(hours));
    newEndTime.setMinutes(Number(minutes));

    const startTime = new Date(scheduleForm.starttime);

    if (newEndTime <= startTime) {
      alert("End time must be after the start time.");
      return;
    }

    if (!checkIfTimeSlotIsAvailable(startTime, newEndTime)) {
      const conflictingBlotter = blotterreports
        .filter((blot) => blot.status === "Scheduled" && blot._id !== blotterID)
        .find((blot) => {
          const reservedStart = new Date(blot.starttime);
          const reservedEnd = new Date(blot.endtime);

          return startTime < reservedEnd && newEndTime > reservedStart;
        });

      if (conflictingBlotter) {
        const suggestedEndTime = new Date(conflictingBlotter.starttime);
        alert(
          `The selected end time overlaps with another reservation. It should end before ${suggestedEndTime.toLocaleTimeString()}.`
        );
        setScheduleForm((prev) => ({
          ...prev,
          endtime: suggestedEndTime.toISOString(),
        }));
      }
      return;
    }

    setScheduleForm((prev) => ({
      ...prev,
      endtime: newEndTime.toISOString(),
    }));
  };

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to schedule this blotter?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.put(`/scheduleblotter/${blotterID}`, { scheduleForm });
      alert("Blotter successfully scheduled!");
      onClose();
    } catch (error) {
      console.log("Error scheduling blotter", error);
    }
  };

  const handleEdit = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to edit this blotter's schedule?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.put(`/editscheduleblotter/${blotterID}`, { scheduleForm });
      alert("Blotter successfully updated!");
      onClose();
    } catch (error) {
      console.log("Error updating blotter", error);
    }
  };

  const handleSettle = () => {
    navigation("/settle-blotter", { state: { blotterID: blotterID } });
    onClose();
  };

  const handlePrint = () => {
    BlotterPrint({
      blotterData: blotter,
      captainData: captain,
    });
  };

  const handleReject = () => {
    setRejectClicked(true);
  };

  const toggleExpanded = (id) => {
    setExpandedDetails((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const renderDetails = (blotter) => {
    const details = blotter.details || "";
    const words = details.split(" ");
    const isLong = words.length > 50;
    const isExpanded = expandedDetails.includes(blotter._id);
    const displayText = isExpanded
      ? blotter.details
      : words.slice(0, 50).join(" ") + (isLong ? "..." : "");

    return (
      <div className="text-sm font-normal text-justify">
        {displayText}
        {isLong && (
          <span
            className="text-blue-500 cursor-pointer ml-1"
            onClick={() => toggleExpanded(blotter._id)}
          >
            {isExpanded ? "See less" : "See more"}
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      {setShowModal && (
        <div className="modal-container">
          <div className="modal-content w-[45rem] h-[30rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">View Blotter</h1>
                  <IoClose
                    onClick={handleClose}
                    class="dialog-title-bar-icon"
                  ></IoClose>
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            <div className="modal-form-container">
              <div className="modal-form">
                <div className="flex flex-col gap-y-4">
                  <div>
                    <label className="section-title text-start">
                      Complainant Information
                    </label>
                    <hr class="section-divider" />
                    {/*Complainant Information*/}
                    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3 mt-4 mb-4">
                      <div>
                        <label className="form-label">Complainant Name</label>
                        <label className="text-sm font-regular">
                          {blotter.complainantID
                            ? `${blotter.complainantID.firstname} ${
                                blotter.complainantID.middlename || ""
                              } ${blotter.complainantID.lastname}`.trim()
                            : blotter.complainantname}
                        </label>
                      </div>

                      <div>
                        <label className="form-label">
                          Complainant Address{" "}
                        </label>
                        <label className="text-sm font-regular">
                          {blotter.complainantID
                            ? blotter.complainantID.address
                            : blotter.complainantaddress}
                        </label>
                      </div>

                      <div>
                        <label className="form-label">
                          Complainant Contact No
                        </label>
                        <label className="text-sm font-regular">
                          {blotter.complainantID
                            ? blotter.complainantID.mobilenumber
                            : blotter.complainantcontactno}
                        </label>
                      </div>
                    </div>

                    {/*Subject of the Complaint Information*/}
                    <label className="section-title text-start">
                      Subject Information
                    </label>
                    <hr class="section-divider" />
                    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3 mt-4 mb-4">
                      <div>
                        <label className="form-label">Subject Name</label>
                        <label className="text-sm font-regular">
                          {blotter.subjectID
                            ? `${blotter.subjectID.firstname} ${
                                blotter.subjectID.middlename || ""
                              } ${blotter.subjectID.lastname}`.trim()
                            : blotter.subjectname}
                        </label>
                      </div>

                      <div>
                        <label className="form-label">Subject Address</label>
                        <label className="text-sm font-regular">
                          {blotter.subjectID
                            ? blotter.subjectID.address
                            : blotter.subjectaddress}
                        </label>
                      </div>
                    </div>

                    {/*Blotter Information*/}
                    <label className="section-title text-start">
                      Blotter Information
                    </label>
                    <hr class="section-divider" />
                    <div className="grid grid-cols-1 gap-4 mt-4 mb-4">
                      <div className="col-span-1">
                        <label className="form-label">
                          Type of the Incident
                        </label>
                        <label className="text-sm font-regular">
                          {blotter.type}
                        </label>
                      </div>
                      <div className="col-span-3">
                        <label className="form-label">
                          Details of the Incident
                        </label>
                        <label>{renderDetails(blotter)}</label>
                      </div>
                    </div>

                    {(blotter.status === "Pending" ||
                      blotter.status === "Scheduled") && (
                      <>
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
                              value={scheduleForm.date ? scheduleForm.date : ""}
                              onChange={handleDateChange}
                              className="form-input h-[30px]"
                              min={new Date().toISOString().split("T")[0]}
                            />
                          </div>

                          <div>
                            <label className="form-label">Start Time</label>
                            <input
                              type="time"
                              id="starttime"
                              name="starttime"
                              className="form-input h-[30px]"
                              onChange={handleStartTimeChange}
                              value={
                                scheduleForm.starttime
                                  ? new Date(scheduleForm.starttime)
                                      .toTimeString()
                                      .slice(0, 5)
                                  : ""
                              }
                            />
                          </div>
                          <div>
                            <label className="form-label">End Time </label>
                            <input
                              type="time"
                              id="endtime"
                              name="endtime"
                              className="form-input h-[30px]"
                              onChange={handleEndTimeChange}
                              value={
                                scheduleForm.endtime
                                  ? new Date(scheduleForm.endtime)
                                      .toTimeString()
                                      .slice(0, 5)
                                  : ""
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {blotter.status === "Settled" && (
                      <>
                        <label className="section-title text-start">
                          Settlement Information
                        </label>
                        <hr class="section-divider" />
                        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3 mt-4">
                          <div>
                            <label className="form-label">Date</label>
                            <label className="text-sm font-regular">
                              {scheduleForm.date}
                            </label>
                          </div>
                          <div>
                            <label className="form-label">Start Time </label>
                            <label className="text-sm font-regular">
                              {new Date(
                                scheduleForm.starttime
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </label>
                          </div>
                          <div>
                            <label className="form-label">End Time </label>
                            <label className="text-sm font-regular">
                              {new Date(
                                scheduleForm.endtime
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </label>
                          </div>

                          <div className="col-span-3">
                            <label className="form-label">Details </label>
                            <label className="text-sm font-regular">
                              {blotter.agreementdetails}
                            </label>
                          </div>
                          <div className="col-span-1">
                            <label className="form-label">Witness </label>
                            <label className="text-sm font-regular">
                              {blotter.witnessID
                                ? `${blotter.witnessID.firstname} ${
                                    blotter.witnessID.middlename || ""
                                  } ${blotter.witnessID.lastname}`
                                : blotter.witnessname}
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    {blotter.status === "Pending" && (
                      <>
                        <div className="flex justify-center gap-4 mt-4">
                          <button
                            type="submit"
                            onClick={handleSubmit}
                            className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                          >
                            Schedule
                          </button>
                          <button
                            type="button"
                            onClick={handleReject}
                            className="actions-btn bg-btn-color-red hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </>
                    )}

                    {blotter.status === "Scheduled" && (
                      <>
                        <div className="flex justify-center gap-4 mt-4">
                          <button
                            type="button"
                            onClick={handleEdit}
                            className="actions-btn bg-btn-color-blue"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={handleSettle}
                            className="actions-btn bg-[#06D001]"
                          >
                            Settle
                          </button>
                        </div>
                      </>
                    )}
                    {blotter.status === "Settled" && (
                      <>
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={handlePrint}
                            className="actions-btn bg-btn-color-blue "
                          >
                            Print
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isRejectClicked && (
        <BlotterReject
          blotterID={blotterID}
          onClose={() => setRejectClicked(false)}
          onViewClose={onClose}
        />
      )}
    </>
  );
}

export default ViewBlotter;
