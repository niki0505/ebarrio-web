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
  const { blotterreports, fetchBlotterReports } = useContext(InfoContext);
  const [isRejectClicked, setRejectClicked] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [scheduleForm, setScheduleForm] = useState({
    date: null,
    starttime: null,
    endtime: null,
  });

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
    });
  };

  const handleReject = () => {
    setRejectClicked(true);
  };

  return (
    <>
      {setShowModal && (
        <div className="modal-container">
          <div className="modal-content w-[45rem] h-[30rem]">
            <div className="modal-title-bar bg-navy-blue">
              <h1 className="modal-title">View Blotter</h1>
              <button className="modal-btn-close">
                <IoClose className="btn-close-icon" onClick={handleClose} />
              </button>
            </div>
            <div className="w-full overflow-y-auto">
              {/*Complainant Information*/}
              <div>
                <label>Complainant Name: </label>
                <label>
                  {blotter.complainantID
                    ? `${blotter.complainantID.firstname} ${
                        blotter.complainantID.middlename || ""
                      } ${blotter.complainantID.lastname}`.trim()
                    : blotter.complainantname}
                </label>
              </div>

              <div>
                <label>Complainant Address: </label>
                <label>
                  {blotter.complainantID
                    ? blotter.complainantID.address
                    : blotter.complainantaddress}
                </label>
              </div>

              <div>
                <label>Complainant Contact No: </label>
                <label>
                  {blotter.complainantID
                    ? blotter.complainantID.mobilenumber
                    : blotter.complainantcontactno}
                </label>
              </div>

              {/*Subject of the Complaint Information*/}
              <div>
                <label>Subject Name: </label>
                <label>
                  {blotter.subjectID
                    ? `${blotter.subjectID.firstname} ${
                        blotter.subjectID.middlename || ""
                      } ${blotter.subjectID.lastname}`.trim()
                    : blotter.subjectname}
                </label>
              </div>

              <div>
                <label>Subject Address: </label>
                <label>
                  {blotter.subjectID
                    ? blotter.subjectID.address
                    : blotter.subjectaddress}
                </label>
              </div>

              {/*Blotter Information*/}
              <div>
                <label>Type of the Incident: </label>
                <label>{blotter.type}</label>
              </div>

              <div>
                <label>Details of the Incident: </label>
                <label>{blotter.details}</label>
              </div>

              {(blotter.status === "Pending" ||
                blotter.status === "Scheduled") && (
                <>
                  {/*Settlement Proceedings*/}
                  <div>
                    <label>Date: </label>
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
                    <label>Start Time: </label>
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
                    <label>End Time: </label>
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
                </>
              )}

              {blotter.status === "Settled" && (
                <>
                  <div>
                    <label>Date: </label>
                    <label>{scheduleForm.date}</label>
                  </div>
                  <div>
                    <label>Start Time: </label>
                    <label>
                      {new Date(scheduleForm.starttime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </label>
                  </div>
                  <div>
                    <label>End Time: </label>
                    <label>
                      {new Date(scheduleForm.endtime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </label>
                  </div>

                  <div>
                    <label>Details: </label>
                    <label>{blotter.agreementdetails}</label>
                  </div>
                  <div>
                    <label>Witness: </label>
                    <label>
                      {blotter.witnessID
                        ? `${blotter.witnessID.firstname} ${
                            blotter.witnessID.middlename || ""
                          } ${blotter.witnessID.lastname}`
                        : blotter.witnessname}
                    </label>
                  </div>
                </>
              )}

              {blotter.status === "Pending" && (
                <>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="actions-btn bg-btn-color-blue"
                  >
                    Schedule
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    className="actions-btn bg-btn-color-blue"
                  >
                    Reject
                  </button>
                </>
              )}

              {blotter.status === "Scheduled" && (
                <>
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
                    className="actions-btn bg-btn-color-blue"
                  >
                    Settle
                  </button>
                </>
              )}
              {blotter.status === "Settled" && (
                <>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="actions-btn bg-btn-color-blue"
                  >
                    Print
                  </button>
                </>
              )}
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
