import { useEffect, useState, useContext } from "react";
import "../App.css";
import { InfoContext } from "../context/InfoContext";
import { IoClose } from "react-icons/io5";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";
import DatePicker from "react-multi-date-picker";

function CreateReservation({ onClose }) {
  const confirm = useConfirm();
  const { fetchResidents, residents, courtreservations, fetchReservations } =
    useContext(InfoContext);

  const [showModal, setShowModal] = useState(true);
  const [reservationForm, setReservationForm] = useState({
    resID: "",
    purpose: "",
    date: [],
    times: {},
    amount: "",
  });

  useEffect(() => {
    fetchResidents();
    fetchReservations();
  }, []);

  // Calculate total amount based on all times across all selected dates
  useEffect(() => {
    const hourlyRate = 100;
    let totalHours = 0;

    for (const dateKey in reservationForm.times) {
      const t = reservationForm.times[dateKey];
      if (t?.starttime && t?.endtime) {
        const start = new Date(t.starttime);
        const end = new Date(t.endtime);

        if (!isNaN(start) && !isNaN(end) && end > start) {
          totalHours += (end - start) / (1000 * 3600);
        }
      }
    }

    const totalAmount = "₱" + Math.round(totalHours * hourlyRate);
    setReservationForm((prev) => ({ ...prev, amount: totalAmount }));
  }, [reservationForm.times]);

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to create a new court reservation?",
      "confirm"
    );
    if (!isConfirmed) return;
    try {
      delete reservationForm.date;
      await api.post("/createreservation", { reservationForm });
      alert("Court reservation successfully created!");
      onClose();
    } catch (error) {
      console.error("Error creating court reservation", error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const purposeList = ["Basketball", "Birthday"];

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setReservationForm((prev) => ({ ...prev, [name]: value }));
  };

  // Date picker change
  const handleDateChange = (dates) => {
    // Format dates to ISO YYYY-MM-DD strings
    const formattedDates = dates.map((d) => d.format("YYYY-MM-DD"));

    // Remove times for deselected dates
    const newTimes = {};
    formattedDates.forEach((date) => {
      if (reservationForm.times[date]) {
        newTimes[date] = reservationForm.times[date];
      }
    });

    setReservationForm((prev) => ({
      ...prev,
      date: formattedDates,
      times: newTimes,
    }));
  };

  // Time change handlers per date
  const handleStartTimeChange = (date, time) => {
    if (!time) return;

    const newStartTime = new Date(`${date}T${time}:00`);

    setReservationForm((prev) => {
      const currentTimes = prev.times[date] || {};
      return {
        ...prev,
        times: {
          ...prev.times,
          [date]: {
            ...currentTimes,
            starttime: newStartTime.toISOString(),
            endtime: null, // reset endtime if starttime changes
          },
        },
      };
    });
  };

  const handleEndTimeChange = (date, time) => {
    if (!time) return;

    const currentTimes = reservationForm.times[date] || {};
    if (!currentTimes.starttime) {
      alert("Please select a start time first for " + date);
      return;
    }

    const [year, month, day] = date.split("-");
    const [hours, minutes] = time.split(":");
    const newEndTime = new Date(year, month - 1, day, hours, minutes, 0);
    const startTime = new Date(currentTimes.starttime);

    if (newEndTime <= startTime) {
      alert(`End time must be after start time for ${date}`);
      return;
    }

    const conflict = courtreservations
      .filter(
        (r) =>
          r.status === "Approved" &&
          r.times?.[date]?.starttime &&
          r.times?.[date]?.endtime
      )
      .find((r) => {
        const reservedStart = new Date(r.times[date].starttime);
        const reservedEnd = new Date(r.times[date].endtime);

        console.log(
          "Checking overlap:",
          { selectedStart: startTime, selectedEnd: newEndTime },
          { reservedStart, reservedEnd }
        );

        return startTime < reservedEnd && newEndTime > reservedStart;
      });

    if (conflict) {
      alert(
        `Time slot overlaps with existing reservation on ${date} (${new Date(
          conflict.times[date].starttime
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${new Date(conflict.times[date].endtime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}).`
      );
      return;
    }

    setReservationForm((prev) => {
      const updatedTimes = prev.times[date] || {};
      return {
        ...prev,
        times: {
          ...prev.times,
          [date]: {
            ...updatedTimes,
            endtime: newEndTime.toISOString(),
          },
        },
      };
    });
  };

  return (
    <>
      {showModal && (
        <div className="modal-container">
          <div className="modal-content h-[25rem] w-[30rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Add New Reservation</h1>
                  <IoClose
                    onClick={handleClose}
                    className="dialog-title-bar-icon"
                  />
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            <form
              className="modal-form-container"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="modal-form">
                {/* Resident Select */}
                <div className="employee-form-group">
                  <label htmlFor="resID" className="form-label">
                    Name<label className="text-red-600">*</label>
                  </label>
                  <select
                    id="resID"
                    name="resID"
                    onChange={handleDropdownChange}
                    className="form-input"
                    value={reservationForm.resID}
                  >
                    <option value="" disabled>
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

                {/* Purpose Select */}
                <div className="employee-form-group">
                  <label htmlFor="purpose" className="form-label">
                    Purpose<label className="text-red-600">*</label>
                  </label>
                  <select
                    id="purpose"
                    name="purpose"
                    onChange={handleDropdownChange}
                    className="form-input"
                    value={reservationForm.purpose}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {purposeList.map((element) => (
                      <option key={element} value={element}>
                        {element}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date picker */}
                <div className="employee-form-group">
                  <label className="form-label">
                    Date<label className="text-red-600">*</label>
                  </label>
                  <DatePicker
                    multiple
                    value={reservationForm.date}
                    onChange={handleDateChange}
                    format="YYYY-MM-DD"
                    placeholder="Select multiple dates"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "35px",
                      borderRadius: "8px",
                      paddingLeft: "0.5rem",
                      border: "1px solid #C1C0C0",
                      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                      fontFamily: "Quicksand",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      appearance: "none",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Start/End time inputs per date */}
                {reservationForm.date.length > 0 && (
                  <div className="employee-form-group">
                    <label className="form-label">
                      Select Start and End Times
                    </label>
                    {reservationForm.date.map((date) => {
                      const times = reservationForm.times[date] || {};
                      return (
                        <div
                          key={date}
                          className="flex items-center space-x-2 space-y-4 w-full"
                        >
                          <span className="font-subTitle text-[14px] font-medium w-full pl-2 mt-3">
                            {date}
                          </span>

                          <input
                            type="time"
                            value={
                              times.starttime
                                ? new Date(times.starttime)
                                    .toTimeString()
                                    .slice(0, 5)
                                : ""
                            }
                            onChange={(e) =>
                              handleStartTimeChange(date, e.target.value)
                            }
                            className="form-input"
                            required
                          />
                          <input
                            type="time"
                            value={
                              times.endtime
                                ? new Date(times.endtime)
                                    .toTimeString()
                                    .slice(0, 5)
                                : ""
                            }
                            onChange={(e) =>
                              handleEndTimeChange(date, e.target.value)
                            }
                            className="form-input"
                            required
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Amount (readonly) */}
                <div className="employee-form-group">
                  <label htmlFor="amount" className="form-label">
                    Amount
                  </label>
                  <input
                    value={reservationForm.amount}
                    type="text"
                    id="amount"
                    name="amount"
                    className="form-input"
                    readOnly
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateReservation;
