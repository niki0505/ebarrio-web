import { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { OtpContext } from "../context/OtpContext";
import axios from "axios";

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
      const res = await axios.post("http://localhost:5000/api/checkemployee", {
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
        const res2 = await axios.post(
          "http://localhost:5000/api/checkusername",
          {
            username,
          }
        );
        if (res2.data.usernameExists) {
          alert("Username is already taken");
          return;
        }

        console.log(` Sending OTP...`);

        //SENDS OTP
        try {
          const res3 = await axios.post("http://localhost:5000/api/otp", {
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
              resID: res.data.resID,
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
    <div>
      <div style={{ width: "300px", flexDirection: "column", gap: "10px" }}>
        <div>
          <input
            type="text"
            placeholder="First Name"
            onChange={(e) => firstnameValidation(e.target.value)}
            value={firstname}
          />
          {fnameError ? <p style={{ color: "red" }}>{fnameError}</p> : null}
        </div>
        <div>
          <input
            type="text"
            placeholder="Last Name"
            onChange={(e) => lastnameValidation(e.target.value)}
            value={lastname}
          />
          {lnameError ? <p style={{ color: "red" }}>{lnameError}</p> : null}
        </div>
        <div></div>
        <input
          type="text"
          placeholder="Mobile Number"
          onChange={(e) => mobilenumValidation(e.target.value)}
          value={mobilenumber}
          maxLength={11}
        />
        {mobilenumError ? (
          <p style={{ color: "red" }}>{mobilenumError}</p>
        ) : null}
      </div>
      <div>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => usernameValidation(e.target.value)}
          value={username}
        />
        {usernameErrors ? (
          <p style={{ color: "red" }}>{usernameErrors}</p>
        ) : null}
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => passwordValidation(e.target.value)}
          value={password}
        />
        {passwordErrors ? (
          <p style={{ color: "red" }}>{passwordErrors}</p>
        ) : null}
      </div>
      <div>
        <input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => password2Validation(e.target.value)}
          value={password2}
        />
        {password2Errors ? (
          <p style={{ color: "red" }}>{password2Errors}</p>
        ) : null}
      </div>
      <div>
        <button onClick={handleSignUp} type="submit">
          Sign up
        </button>
      </div>
    </div>
  );
}

export default Signup;
