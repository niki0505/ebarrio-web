import Webcam from "react-webcam";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { removeBackground } from "@imgly/background-removal";
import "../App.css";

function OpenCamera() {
  const webRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);

  const checkCamera = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    setHasCamera(videoDevices.length > 0);
  };

  useEffect(() => {
    checkCamera();

    const handleDeviceChange = () => {
      checkCamera();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      return navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange
      );
    };
  }, []);

  const openCamera = () => {
    setImageSrc(null);
  };

  const capture = async () => {
    const screenshot = webRef.current.getScreenshot();
    setLoading(true);
    if (screenshot) {
      try {
        const blob = await removeBackground(screenshot);
        const url = URL.createObjectURL(blob);
        setImageSrc(url);
      } catch (error) {
        console.error("Error removing background:", error);
      }
    }
  };
  return (
    <div className="floating-camera-container">
      <div>
        <h1>ID Picture</h1>
        {hasCamera ? (
          imageSrc ? (
            <img src={imageSrc} />
          ) : (
            <Webcam ref={webRef} screenshotFormat="image/png" />
          )
        ) : (
          <p>
            No camera detected. Please ensure its connected or installed
            properly.
          </p>
        )}
      </div>

      {imageSrc ? (
        <button onClick={openCamera}>Open Camera</button>
      ) : (
        <button onClick={capture}>Capture Photo</button>
      )}

      <button>Done</button>
    </div>
  );
}
export default OpenCamera;
