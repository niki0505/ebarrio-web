import { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { OtpContext } from "../context/OtpContext";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

//ICONS
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
  const confirm = useConfirm();

  const firstnameValidation = (val) => {
    setFirstname(val);
    if (!val) {
      setFnameError("This field is required!");
    } else {
      setFnameError(null);
    }
  };

  const lastnameValidation = (val) => {
    setLastname(val);
    if (!val) {
      setLnameError("This field is required!");
    } else {
      setLnameError(null);
    }
  };

  const mobilenumValidation = (val) => {
    setMobileNumber(val.replace(/[^0-9]/g, ""));
    if (!val) {
      setMobileNumError("This field is required!");
    } else {
      setMobileNumError(null);
    }
  };

  const usernameValidation = (val) => {
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setUsername(formattedVal);

    if (!formattedVal) {
      errors.push("This field is required!");
    }
    if (
      (formattedVal && formattedVal.length < 3) ||
      (formattedVal && formattedVal.length > 16)
    ) {
      errors.push("Username must be between 3 and 16 characters only!");
    }
    if (formattedVal && !/^[a-zA-Z0-9_]+$/.test(formattedVal)) {
      errors.push(
        "Username can only contain letters, numbers, and underscores!"
      );
    }
    if (
      (formattedVal && formattedVal.startsWith("_")) ||
      (formattedVal && formattedVal.endsWith("_"))
    ) {
      errors.push("Username must not start or end with an underscore!");
    }

    setUsernameErrors(errors);
  };

  const passwordValidation = (val) => {
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setPassword(formattedVal);

    if (!formattedVal) {
      errors.push("This field is required!");
    }
    if (
      (formattedVal && formattedVal.length < 8) ||
      (formattedVal && formattedVal.length > 64)
    ) {
      errors.push("Password must be between 8 and 64 characters only!");
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
      setPassword2Errors("Password do not match!");
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
        confirm("You must be an employee to register.", "failed");
        return;
      } else if (
        !res.data.isSecretary &&
        res.data.isResident &&
        res.data.isEmployee
      ) {
        console.log(`❌ User is not a secretary`);
        confirm("Only a secretary can complete the registration.", "failed");
        return;
      } else if (
        res.data.hasAccount &&
        res.data.isSecretary &&
        res.data.isResident &&
        res.data.isEmployee
      ) {
        console.log(`❌ Employee already has an account`);
        confirm("This employee already has an account.", "failed");
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
          confirm("The username is already taken.", "failed");
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
          confirm(
            "An unexpected error occured while sending OTP. Please try again.",
            "failed"
          );
        }
      }
    } catch (error) {
      console.log("Error", error.message);
    }
  };
  return (
    <>
      <div
        className="login-container"
        style={{
          backgroundImage: `radial-gradient(circle, #0981B4 0%, #075D81 50%, #04384E 100%)`,
        }}
      >
        <img
          src={AppLogo}
          alt="App Logo"
          className="login-logo translate-x-[-25vw]"
        />
        <div className="right-login-container">
          <h1 className="header-text">Create your account</h1>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="First Name"
              onChange={(e) => firstnameValidation(e.target.value)}
              value={firstname}
              className="form-input"
            />
            {fnameError ? <p className="error-msg">{fnameError}</p> : null}

            <input
              type="text"
              placeholder="Last Name"
              onChange={(e) => lastnameValidation(e.target.value)}
              value={lastname}
              className="form-input"
            />
            {lnameError ? <p className="error-msg">{lnameError}</p> : null}

            <input
              type="text"
              placeholder="Mobile Number"
              onChange={(e) => mobilenumValidation(e.target.value)}
              value={mobilenumber}
              maxLength={12}
              className="form-input"
            />
            {mobilenumError ? (
              <p className="error-msg">{mobilenumError}</p>
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
                <p key={index} className="error-msg">
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
                <p key={index} className="error-msg">
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
              <p className="error-msg">{password2Errors}</p>
            ) : null}
          </div>

          <div className="flex flex-col">
            <button onClick={handleSignUp} type="submit" className="login-btn">
              Sign up
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
