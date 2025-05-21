import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/CommonStyle.css";
import { AuthContext } from "../context/AuthContext";
import api from "../api";

function SessionTimeout({ timeout = 1 * 60 * 1000 }) {
  const { logout, user } = useContext(AuthContext);
  const timerRef = useRef(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showModal, setShowModal] = useState(() => {
    return localStorage.getItem("sessionTimedOut") === "true";
  });

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
      if (res.status === 200) {
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
      {setShowModal && (
        <div className="modal-container">
          <div className="modal-content w-[30rem] h-[15rem] ">
            <h2>Session Expired</h2>
            <p>You've been inactive for 15 minutes.</p>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm();
                }
              }}
              placeholder="Enter your password"
            />
            {passwordError && (
              <label className="text-[12px] text-red-600 m-0">
                {passwordError}
              </label>
            )}
            <button>Log Out</button>
            <button onClick={handleConfirm}>Stay Logged In</button>
          </div>
        </div>
      )}
    </>
  );
}

export default SessionTimeout;
