import { createContext, useState, useEffect } from "react";

export const OtpContext = createContext();

export const OtpProvider = ({ children }) => {
  const [otp, setOtp] = useState(null);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const startOtp = (newOtp, duration) => {
    setOtp(newOtp);
    setTimer(duration);

    const id = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setOtp(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setIntervalId(id);
  };

  const clearOtp = () => {
    setOtp(null);
    setTimer(0);
    if (intervalId) clearInterval(intervalId);
  };

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <OtpContext.Provider value={{ otp, timer, startOtp, clearOtp }}>
      {children}
    </OtpContext.Provider>
  );
};
