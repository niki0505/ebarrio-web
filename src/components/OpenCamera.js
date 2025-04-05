import Webcam from "react-webcam";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
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

    try {
      const formData = new FormData();
      formData.append(
        "image_file_b64",
        screenshot.replace(/^data:image\/\w+;base64,/, "")
      );
      formData.append("size", "auto");

      const response = await axios.post(
        "https://api.remove.bg/v1.0/removebg",
        formData,
        {
          headers: {
            "X-Api-Key": "fbLpgxEwyRaxsRZ7UeRNTYqB", // ⬅️ Replace this with your actual key
            "Content-Type": "application/x-www-form-urlencoded",
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      setImageSrc(url);
      console.log(`Removed BG: ${imageSrc}`);
      alert("Captured successfully!");
    } catch (err) {
      console.log("Error removing background:", err);
      alert("Something went wrong. Check your API key or image.");
    } finally {
      setLoading(false);
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
