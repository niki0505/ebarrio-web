import { useState } from "react";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

//STYLES
import "../App.css";

//ICONS
import { IoClose } from "react-icons/io5";

function AlertResidents({ onClose, resID }) {
  const confirm = useConfirm();
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to alert the residents?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      await api.post(`/alertresidents`, { message });
      alert("Residents have been successfully alerted.");
      onClose();
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        console.log("❌ Error status:", response.status);
        alert(response.data.message || "Something went wrong.");
      } else {
        console.log("❌ Network or unknown error:", error.message);
        alert("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  return (
    <>
      {setShowModal && (
        <div className="modal-container">
          <div className="modal-content w-[30rem] h-[22rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Alert Residents</h1>
                  <IoClose
                    onClick={handleClose}
                    class="dialog-title-bar-icon"
                  ></IoClose>
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            <div className="modal-form-container">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="modal-form">
                  <textarea
                    placeholder="Enter your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    minLength={20}
                    maxLength={255}
                    className="h-[11rem] textarea-container"
                    required
                  ></textarea>
                  <div className="textarea-length-text">
                    {message.length}/255
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                    >
                      {loading ? "Confirming..." : "Confirm"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AlertResidents;
