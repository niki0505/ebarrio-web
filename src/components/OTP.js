import { useRef, useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";
import { OtpContext } from "../context/OtpContext";
import axios from "axios";

function OTP() {
  const location = useLocation();
  const navigation = useNavigate();
  const { resID, mobilenumber, username, password, role } = location.state;
  const [resendTimer, setResendTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendCount, setResendCount] = useState(0);
  const [OTP, setOTP] = useState("");
  const { otp, timer, startOtp, clearOtp } = useContext(OtpContext);
  const otpRef = useRef(null);

  useEffect(() => {
    console.log(role);
    let interval = null;
    if (isResendDisabled) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isResendDisabled]);

  const handleResend = async () => {
    if (resendCount < 3) {
      clearOtp();
      console.log("OTP from context is removed");
      console.log("Resending OTP...");
      try {
        const res = await axios.post("http://localhost:5000/api/otp", {
          mobilenumber,
        });
        startOtp(res.data.otp, 300);
        setResendTimer(30);
        setIsResendDisabled(true);
        setResendCount((prevCount) => prevCount + 1);
        console.log("New OTP is generated");
      } catch (error) {
        console.error("Error sending OTP:", error);
        alert("Something went wrong while sending OTP");
      }
    } else {
      alert("You can only resend OTP 3 times.");
    }
  };

  useEffect(() => {
    if (otp) {
      console.log("OTP from context is active");
    } else {
      console.log("OTP from context is not active");
    }
  }, [otp]);

  const handleOTP = async (enteredOTP) => {
    if (!otp) {
      alert("OTP has expired.");
      setOTP("");
      return;
    }
    const cleanOtp = otp.toString().trim();
    const cleanEnteredOtp = enteredOTP.toString().trim();
    if (cleanOtp === cleanEnteredOtp) {
      const res = await axios.post("http://localhost:5000/api/register", {
        username: username,
        password: password,
        resID: resID,
        role,
      });
      alert("User registered successfully. Please log in.");
      navigation("/login");
    } else {
      alert("The OTP you entered is incorrect.");
      setOTP("");
    }
  };

  const handleOTPChange = (text) => {
    setOTP(text);
    if (text.length === 6) {
      setTimeout(() => {
        handleOTP(text);
      }, 200);
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div style={{ width: "330px" }}>
        <OtpInput
          value={OTP}
          onChange={handleOTPChange}
          numInputs={6}
          isInputNum
          shouldAutoFocus
          renderSeparator={<span>-</span>}
          renderInput={(props) => <input {...props} />}
        />
      </div>
      {isResendDisabled ? (
        <p style={{ color: "gray", marginTop: "10px" }}>
          Resend OTP in {resendTimer} second{resendTimer !== 1 ? "s" : ""}
        </p>
      ) : (
        <p
          onClick={handleResend}
          style={{ color: "blue", cursor: "pointer", marginTop: "10px" }}
        >
          Resend OTP
        </p>
      )}
    </div>
  );
}

export default OTP;
