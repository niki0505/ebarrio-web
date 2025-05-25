import { useEffect, useRef, useState, useContext } from "react";
import "../App.css";
import { InfoContext } from "../context/InfoContext";
import { IoClose } from "react-icons/io5";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

function CreateReservation({ onClose }) {
  const confirm = useConfirm();
  const { fetchResidents, residents } = useContext(InfoContext);
  const [showModal, setShowModal] = useState(true);
  const [reservationForm, setReservationForm] = useState({
    resID: "",
    purpose: "",
    date: new Date(),
    starttime: null,
    endtime: null,
    amount: "",
  });
  const { courtreservations, fetchReservations } = useContext(InfoContext);

  useEffect(() => {
    fetchResidents();
    fetchReservations();
  }, []);

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to create a new court reservation?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    onClose();
    try {
      const response = await api.post("/createreservation", {
        reservationForm,
      });
      alert("Court reservation successfully created!");
    } catch (error) {
      console.log("Error creating court reservation", error);
    }
  };
  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const purposeList = ["Basketball", "Birthday"];
  const hourlyRate = 100;

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setReservationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const calculateAmount = () => {
      const startTime = new Date(reservationForm.starttime);
      const endTime = new Date(reservationForm.endtime);

      startTime.setFullYear(1970, 0, 1);
      endTime.setFullYear(1970, 0, 1);

      const timeDifference = endTime - startTime;
      const hoursDifference = Math.max(timeDifference / (1000 * 3600), 0);
      const calculatedAmount = hoursDifference * hourlyRate;
      const totalamount = "₱" + Math.round(calculatedAmount).toString();
      setReservationForm((prev) => ({
        ...prev,
        amount: totalamount,
      }));
    };

    if (reservationForm.starttime && reservationForm.endtime) {
      calculateAmount();
    }
  }, [reservationForm.starttime, reservationForm.endtime]);

  const handleDateChange = (e) => {
    // const selectedDate = e.target.value;
    // const dateParts = selectedDate.split("-");
    // const newDate = new Date(
    //   Number(dateParts[0]),
    //   Number(dateParts[1]) - 1,
    //   Number(dateParts[2])
    // );

    // const prevStartTime = new Date(reservationForm.starttime);
    // const prevEndTime = new Date(reservationForm.endtime);

    // const updatedStarttime = new Date(newDate);
    // updatedStarttime.setHours(prevStartTime.getHours());
    // updatedStarttime.setMinutes(prevStartTime.getMinutes());

    // const updatedEndtime = new Date(newDate);
    // updatedEndtime.setHours(prevEndTime.getHours());
    // updatedEndtime.setMinutes(prevEndTime.getMinutes());

    // setReservationForm((prev) => ({
    //   ...prev,
    //   date: newDate.toISOString(),
    //   starttime: null,
    //   endtime: null,
    //   amount: "",
    // }));

    const newDateStr = e.target.value;

    setReservationForm((prev) => {
      return {
        ...prev,
        date: newDateStr,
        starttime: "",
        endtime: "",
      };
    });
  };

  const handleStartTimeChange = (e) => {
    const time = e.target.value;
    const newStartTime = new Date(`${reservationForm.date}T${time}:00`);

    if (!reservationForm.date) {
      alert("Please select a date first.");
      return;
    }

    setReservationForm((prev) => ({
      ...prev,
      starttime: newStartTime.toISOString(),
      endtime: "",
    }));
  };

  const handleEndTimeChange = (e) => {
    const time = e.target.value;
    const newEndTime = new Date(`${reservationForm.date}T${time}:00`);
    const startTime = new Date(reservationForm.starttime);
    if (!reservationForm.date) {
      alert("Please select a date first.");
      return;
    }
    if (!reservationForm.starttime) {
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
        ? `This time slot overlaps with an existing reservation of ${conflict.start.toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )} - ${conflict.end.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}.`
        : "This time slot overlaps with another reservation.";
      alert(conflictInfo);
      setReservationForm((prev) => ({ ...prev, endtime: "" }));
      return;
    }
    setReservationForm((prev) => ({
      ...prev,
      endtime: newEndTime.toISOString(),
    }));
  };

  const checkIfTimeSlotIsAvailable = (startTime, endTime) => {
    const selectedStartTime = new Date(startTime);
    const selectedEndTime = new Date(endTime);

    if (
      isNaN(selectedStartTime.getTime()) ||
      isNaN(selectedEndTime.getTime())
    ) {
      console.warn("Invalid selected time range");
      return { isAvailable: false, conflict: null };
    }

    const conflict = courtreservations
      .filter((court) => court.status === "Approved")
      .find((court) => {
        const reservedStart = new Date(court.starttime);
        const reservedEnd = new Date(court.endtime);

        if (isNaN(reservedStart.getTime()) || isNaN(reservedEnd.getTime())) {
          return false;
        }

        return (
          selectedStartTime < reservedEnd && selectedEndTime > reservedStart
        );
      });

    if (conflict) {
      return {
        isAvailable: false,
        conflict: {
          start: new Date(conflict.starttime),
          end: new Date(conflict.endtime),
        },
      };
    }

    return { isAvailable: true, conflict: null };
  };

  return (
    <>
      {setShowModal && (
        <div className="modal-container">
          <div className="modal-content h-[32rem] w-[30rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Add New Reservation</h1>
                  <IoClose
                    onClick={handleClose}
                    class="dialog-title-bar-icon"
                  ></IoClose>
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
                <div className="employee-form-group">
                  <label for="resID" className="form-label">
                    Name<label className="text-red-600">*</label>
                  </label>
                  <select
                    id="resID"
                    name="resID"
                    onChange={handleDropdownChange}
                    className="form-input h-[30px]"
                  >
                    <option value="" disabled selected hidden>
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
                <div className="employee-form-group">
                  <label for="purpose" className="form-label">
                    Purpose<label className="text-red-600">*</label>
                  </label>
                  <select
                    id="purpose"
                    name="purpose"
                    onChange={handleDropdownChange}
                    className="form-input h-[30px]"
                  >
                    <option value="" disabled selected hidden>
                      Select
                    </option>
                    {purposeList.map((element) => (
                      <option value={element}>{element}</option>
                    ))}
                  </select>
                </div>
                <div className="employee-form-group">
                  <label for="date" className="form-label">
                    Date<label className="text-red-600">*</label>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className="form-input h-[30px] pr-2"
                    onChange={handleDateChange}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="employee-form-group">
                  <label for="starttime" className="form-label">
                    Start Time<label className="text-red-600">*</label>
                  </label>
                  <input
                    type="time"
                    id="starttime"
                    name="starttime"
                    onChange={handleStartTimeChange}
                    className="form-input h-[30px] pr-2"
                    value={
                      reservationForm.starttime
                        ? new Date(reservationForm.starttime)
                            .toTimeString()
                            .slice(0, 5)
                        : ""
                    }
                  />
                </div>
                <div className="employee-form-group">
                  <label for="endtime" className="form-label">
                    End Time<label className="text-red-600">*</label>
                  </label>
                  <input
                    type="time"
                    id="endtime"
                    name="endtime"
                    onChange={handleEndTimeChange}
                    className="form-input h-[30px] pr-2"
                    value={
                      reservationForm.endtime
                        ? new Date(reservationForm.endtime)
                            .toTimeString()
                            .slice(0, 5)
                        : ""
                    }
                  />
                </div>
                <div className="employee-form-group">
                  <label for="amount" className="form-label">
                    Amount
                  </label>
                  <input
                    value={reservationForm.amount}
                    type="text"
                    id="name"
                    name="name"
                    className="form-input h-[30px]"
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
