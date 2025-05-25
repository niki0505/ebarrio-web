import { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { OtpContext } from "../context/OtpContext";
import blueBg from "../assets/blue-bg.png";
import applogo from "../assets/applogo.png";
import api from "../api";

import AppLogo from "../assets/applogo-darkbg.png";

function Signup() {
  const navigation = useNavigate();
  const [firstname, setFirstname] = useState("");
  const { startOtp } = useContext(OtpContext);
  const [lastname, setLastname] = useState("");
  const [mobilenumber, setMobileNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [fnameError, setFnameError] = useState(null);
  const [lnameError, setLnameError] = useState(null);
  const [mobilenumError, setMobileNumError] = useState(null);
  const [usernameErrors, setUsernameErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [password2Errors, setPassword2Errors] = useState([]);

  const firstnameValidation = (val) => {
    setFirstname(val);
    if (!val) {
      setFnameError("First name must not be empty");
    } else {
      setFnameError(null);
    }
  };

  const lastnameValidation = (val) => {
    setLastname(val);
    if (!val) {
      setLnameError("Last name must not be empty");
    } else {
      setLnameError(null);
    }
  };

  const mobilenumValidation = (val) => {
    setMobileNumber(val.replace(/[^0-9]/g, ""));
    if (!val) {
      setMobileNumError("Mobile number must not be empty");
    } else {
      setMobileNumError(null);
    }
  };

  const usernameValidation = (val) => {
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setUsername(formattedVal);

    if (!formattedVal) {
      errors.push("Username must not be empty");
    }
    if (
      (formattedVal && formattedVal.length < 3) ||
      (formattedVal && formattedVal.length > 16)
    ) {
      errors.push("Username must be between 3 and 16 characters only");
    }
    if (formattedVal && !/^[a-zA-Z0-9_]+$/.test(formattedVal)) {
      errors.push(
        "Username can only contain letters, numbers, and underscores."
      );
    }
    if (
      (formattedVal && formattedVal.startsWith("_")) ||
      (formattedVal && formattedVal.endsWith("_"))
    ) {
      errors.push("Username must not start or end with an underscore");
    }

    setUsernameErrors(errors);
  };

  const passwordValidation = (val) => {
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setPassword(formattedVal);

    if (!formattedVal) {
      errors.push("Password must not be empty");
    }
    if (
      (formattedVal && formattedVal.length < 8) ||
      (formattedVal && formattedVal.length > 64)
    ) {
      errors.push("Password must be between 8 and 64 characters only");
    }
    if (formattedVal && !/^[a-zA-Z0-9!@\$%\^&*\+#]+$/.test(formattedVal)) {
      errors.push(
        "Password can only contain letters, numbers, and !, @, $, %, ^, &, *, +, #"
      );
    }
    setPasswordErrors(errors);
  };

  const password2Validation = (val) => {
    setPassword2(val);
    console.log(password);
    if (val !== password) {
      setPassword2Errors("Password does not match");
    } else {
      setPassword2Errors(null);
    }
  };

  const handleSignUp = async () => {
    if (!firstname || !lastname || !username || !password || !password2) {
      firstnameValidation(firstname);
      lastnameValidation(lastname);
      usernameValidation(username);
      passwordValidation(password);
      password2Validation(password2);
      return;
    }
    try {
      //CHECKS IF THE USERNAME FORMAT IS VALID
      if (usernameErrors.length !== 0) {
        return;
      }
      //CHECKS IF THE PASSWORD FORMAT IS VALID
      if (passwordErrors.length !== 0) {
        return;
      }

      //CHECKS IF THE USER IS AN EMPLOYEE
      const res = await api.post("/checkemployee", {
        firstname,
        lastname,
        mobilenumber,
      });
      console.log(res.data);
      if (!res.data.isResident || !res.data.isEmployee) {
        console.log(`❌ User is not an employee`);
        alert("Only employee can register");
        return;
      } else if (
        !res.data.isSecretary &&
        res.data.isResident &&
        res.data.isEmployee
      ) {
        console.log(`❌ User is not a secretary`);
        alert("Only secretary can register");
        return;
      } else if (
        res.data.hasAccount &&
        res.data.isSecretary &&
        res.data.isResident &&
        res.data.isEmployee
      ) {
        console.log(`❌ Employee already has an account`);
        alert("Employee already has an account");
        return;
      } else if (
        !res.data.hasAccount &&
        res.data.isSecretary &&
        res.data.isResident &&
        res.data.isEmployee
      ) {
        //CHECKS IF THE USERNAME IS ALREADY TAKEN
        const res2 = await api.post("/checkusername", {
          username,
        });
        if (res2.data.usernameExists) {
          alert("Username is already taken");
          return;
        }

        console.log(` Sending OTP...`);

        //SENDS OTP
        try {
          const res3 = await api.post("/otp", {
            mobilenumber,
          });
          setUsername("");
          setPassword("");
          setFirstname("");
          setLastname("");
          setMobileNumber("");
          startOtp(res3.data.otp, 300);
          navigation("/otp", {
            state: {
              empID: res.data.empID,
              mobilenumber,
              username,
              password,
              role: "Secretary",
            },
          });
        } catch (error) {
          console.error("Error sending OTP:", error);
          alert("Something went wrong while sending OTP");
        }
      }
    } catch (error) {
      console.log("Error", error.message);
    }
  };
  return (
    <>
      <div
        className="w-screen h-screen flex items-center justify-center overflow-hidden relative"
        style={{
          backgroundImage: `radial-gradient(circle, #0981B4 0%, #075D81 50%, #04384E 100%)`,
        }}
      >
        <img
          src={AppLogo}
          alt="App Logo"
          className="w-[312px] h-[312px] translate-x-[-20vw]"
        />
        <div className="absolute right-0 h-full bg-[#FFFBFC] shadow-lg p-12 w-full sm:w-[320px] md:w-[500px] flex flex-col justify-center gap-8">
          <h1 className="header-text">Create your account</h1>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="First Name"
              onChange={(e) => firstnameValidation(e.target.value)}
              value={firstname}
              className="form-input"
            />
            {fnameError ? (
              <p className="error-input-message">{fnameError}</p>
            ) : null}

            <input
              type="text"
              placeholder="Last Name"
              onChange={(e) => lastnameValidation(e.target.value)}
              value={lastname}
              className="form-input"
            />
            {lnameError ? (
              <p className="error-input-message">{lnameError}</p>
            ) : null}

            <input
              type="text"
              placeholder="Mobile Number"
              onChange={(e) => mobilenumValidation(e.target.value)}
              value={mobilenumber}
              maxLength={11}
              className="form-input"
            />
            {mobilenumError ? (
              <p className="error-input-message">{mobilenumError}</p>
            ) : null}

            <input
              type="text"
              placeholder="Username"
              onChange={(e) => usernameValidation(e.target.value)}
              value={username}
              className="form-input"
            />

            {usernameErrors.length > 0 &&
              usernameErrors.map((error, index) => (
                <p key={index} className="error-input-message">
                  {error}
                </p>
              ))}

            <input
              type="password"
              placeholder="Password"
              onChange={(e) => passwordValidation(e.target.value)}
              value={password}
              className="form-input"
            />

            {passwordErrors.length > 0 &&
              passwordErrors.map((error, index) => (
                <p key={index} className="error-input-message">
                  {error}
                </p>
              ))}

            <input
              type="password"
              placeholder="Confirm Password"
              onChange={(e) => password2Validation(e.target.value)}
              value={password2}
              className="form-input"
            />
            {password2Errors ? (
              <p className="error-input-message">{password2Errors}</p>
            ) : null}
          </div>

          <button
            onClick={handleSignUp}
            type="submit"
            className="px-8 py-3 rounded-[8px] items-center text-[#fff] shadow-box-shadow font-title w-full truncate overflow-hidden whitespace-nowrap bg-btn-color-blue font-bold text-[20px] hover:bg-[#0A7A9D]"
          >
            Sign up
          </button>
        </div>
      </div>
    </>
  );
}

export default Signup;
