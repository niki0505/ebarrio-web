import { useRef, useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import blueBg from "../assets/blue-bg.png";
import applogo from "../assets/applogo.png";
import api from "../api";
import AppLogo from "../assets/applogo-darkbg.png";

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
      });
      alert("Your password has been successfully set.");
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
      <div
        className="w-screen h-screen relative overflow-hidden"
        style={{
          backgroundImage: `radial-gradient(circle, #0981B4 0%, #075D81 50%, #04384E 100%)`,
        }}
      >
        <img
          src={AppLogo}
          alt="App Logo"
          className="w-[400px] h-[400px] absolute bottom-[-100px] left-[-90px]"
        />
        <div className="modal-container">
          <div className="flex flex-col bg-white rounded-xl shadow-lg p-8 w-[25rem] h-[25rem] justify-center items-center gap-8 overflow-y-auto hide-scrollbar">
            <div>
              <h1 className="header-text text-start">Set Password</h1>
              <span className="text-[#808080] font-subTitle font-semibold text-[14px]">
                Enter password and confirm it to complete the reset process.
              </span>
            </div>
            <div className="flex flex-col gap-4 w-full">
              <input
                type="password"
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
              <input
                type="password"
                placeholder="Enter confirm password"
                onChange={(e) => setRePassword(e.target.value)}
                className="form-input"
              />

              {/* <label>Security Questions</label>
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
              className="form-input"
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
              className="form-input"
            /> */}
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="px-8 py-3 rounded-[8px] items-center text-[#fff] font-bold shadow-box-shadow font-title w-full truncate overflow-hidden whitespace-nowrap bg-btn-color-blue w-full text-[20px] hover:bg-[#0A7A9D]"
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
