import { useRef, useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import blueBg from "../assets/blue-bg.png";
import applogo from "../assets/applogo.png";
import api from "../api";

function SetPassword() {
  const location = useLocation();
  const { username } = location.state;
  const navigation = useNavigate();
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");
  const [securityquestions, setSecurityQuestions] = useState([
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);

  const handleSecurityChange = (index, field, value) => {
    const updated = [...securityquestions];
    updated[index][field] = value;
    setSecurityQuestions(updated);
  };

  const handleSubmit = async () => {
    if (password !== repassword) {
      alert("Passwords do not match.");
      return;
    }
    try {
      await api.put(`/resetpassword/${username}`, {
        password,
        securityquestions,
      });
      alert("Password reset successfully!");
      setTimeout(() => {
        navigation("/login");
      }, 2000);
    } catch (error) {
      console.log("Failed to reset password", error);
    }
  };

  const securityQuestionsList = [
    "What was the name of your first pet?",
    "What is your mother's maiden name?",
    "What was the name of your first school?",
  ];

  return (
    <>
      <div className="login-container">
        <div
          className="left-login-container"
          style={{ backgroundImage: `url(${blueBg})` }}
        >
          <img src={applogo} alt="App Logo" className="w-[256px] h-[256px]" />
        </div>

        <div className="right-login-container">
          <div className="login-form-container">
            <span className="login-title">Set Password</span>
            <input
              type="password"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
              className="form-input h-[35px]"
            />
            <input
              type="password"
              placeholder="Enter password"
              onChange={(e) => setRePassword(e.target.value)}
              className="form-input h-[35px]"
            />
            <label>Security Questions</label>
            <select
              onChange={(e) =>
                handleSecurityChange(0, "question", e.target.value)
              }
              className="form-input h-[30px]"
            >
              <option value="" disabled selected hidden>
                Select
              </option>
              {securityQuestionsList
                .filter((element) => element !== securityquestions[1].question)
                .map((element) => (
                  <option value={element}>{element}</option>
                ))}
            </select>
            <input
              type="password"
              placeholder="Enter answer"
              onChange={(e) =>
                handleSecurityChange(0, "answer", e.target.value.toLowerCase())
              }
              className="form-input h-[35px]"
            />
            <select
              onChange={(e) =>
                handleSecurityChange(1, "question", e.target.value)
              }
              className="form-input h-[30px]"
            >
              <option value="" disabled selected hidden>
                Select
              </option>
              {securityQuestionsList
                .filter((element) => element !== securityquestions[0].question)
                .map((element) => (
                  <option value={element}>{element}</option>
                ))}
            </select>
            <input
              type="password"
              placeholder="Enter answer"
              onChange={(e) =>
                handleSecurityChange(1, "answer", e.target.value.toLowerCase())
              }
              className="form-input h-[35px]"
            />
            <button
              type="submit"
              onClick={handleSubmit}
              className="actions-btn bg-btn-color-blue"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SetPassword;
