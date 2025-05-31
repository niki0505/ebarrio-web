import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/CommonStyle.css";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { IoClose } from "react-icons/io5";
import { MdOutlineQuestionMark } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SessionTimeout({ timeout = 15 * 60 * 1000 }) {
  const { logout, user } = useContext(AuthContext);
  const timerRef = useRef(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showModal, setShowModal] = useState(() => {
    return localStorage.getItem("sessionTimedOut") === "true";
  });
  const [showPassword, setShowPassword] = useState(false);

  const resetTimer = () => {
    clearTimeout(timerRef.current);
    localStorage.removeItem("sessionTimedOut");

    timerRef.current = setTimeout(() => {
      localStorage.setItem("sessionTimedOut", "true");
      setShowModal(true);
    }, timeout);
  };

  useEffect(() => {
    if (!showModal) {
      resetTimer();
      const events = ["mousemove", "keydown", "click", "scroll"];
      events.forEach((event) => window.addEventListener(event, resetTimer));

      return () => {
        clearTimeout(timerRef.current);
        events.forEach((event) =>
          window.removeEventListener(event, resetTimer)
        );
      };
    }
  }, [showModal]);

  const handleConfirm = async () => {
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    try {
      const res = await api.post("/checkcredentials", {
        username: user.username,
        password: password,
      });
      console.log(res.status);
      if (res.status === 200) {
        setPassword("");
        setPasswordError("");
        setShowModal(false);
        resetTimer();
      }
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        console.log("❌ Error status:", response.status);
        setPasswordError(response.data.message || "Something went wrong.");
      } else {
        console.log("❌ Network or unknown error:", error.message);
        setPasswordError("An unexpected error occurred.");
      }
    }
  };

  return (
    <>
      {showModal && (
        <div className="h-full fixed inset-0 flex items-center justify-center bg-black bg-opacity-95 z-50">
          <div className="modal-content w-[30rem] max-h-[24rem] bg-white rounded shadow flex flex-col overflow-hidden">
            <div className="dialog-title-bar flex-shrink-0 px-4 py-2">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="dialog-title-bar-title">Session Expired</h1>
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            <div className="modal-form-container flex-1 overflow-y-auto px-4 py-2 flex flex-col items-center">
              <div className="bg-[rgba(4,56,78,0.3)] p-3 rounded-full">
                <MdOutlineQuestionMark className="text-white text-4xl" />
              </div>

              <h2 className="mt-2">Session Expired</h2>
              <p className="text-center">
                You've been inactive for 15 minutes.
              </p>

              <div className="mt-4 w-full">
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleConfirm();
                    }}
                    className="form-input w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
                {passwordError && (
                  <h1 className="text-[12px] text-red-600 m-0">
                    {passwordError}
                  </h1>
                )}
              </div>

              <div className="flex gap-x-4">
                <button className="actions-btn bg-btn-color-red hover:bg-red-700">
                  Log Out
                </button>
                <button
                  onClick={handleConfirm}
                  className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                >
                  Stay Logged In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SessionTimeout;
