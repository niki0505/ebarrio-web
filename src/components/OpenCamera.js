import Webcam from "react-webcam";
import { useRef, useState, useEffect } from "react";
import { removeBackground } from "@imgly/background-removal";
import Styles from "../stylesheets/Styles.css";

function OpenCamera() {
  const webRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [flash, setFlash] = useState(false);

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
    // to trigger the flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const screenshot = webRef.current.getScreenshot();
    if (screenshot) {
      setImageSrc(screenshot); // to show captured image
    }
    setLoading(true);

    try {
      const blob = await removeBackground(screenshot);
      const url = URL.createObjectURL(blob);
      setImageSrc(url);
    } catch (error) {
      console.error("Error removing background:", error);
    }

    setLoading(false);
  };

  return (
    <div className={`modal-container ${flash ? "flash-effect" : ""}`}>
      <div className="modal-content">
        <h1 className="modal-title">Baranggay ID Picture</h1>
        <div className="modal-image-container">
          {hasCamera ? (
            imageSrc ? (
              <img className="modal-image" src={imageSrc} />
            ) : (
              !loading && (
                <Webcam
                  className="modal-image"
                  ref={webRef}
                  screenshotFormat="image/png"
                />
              )
            )
          ) : (
            <p>
              No camera detected. Please ensure it's connected or installed
              properly.
            </p>
          )}
        </div>

        {imageSrc && !loading && (
          <p className="success-message">Baranggay ID Captured Successfully!</p>
        )}

        <div className="btn-container">
          {imageSrc && !loading ? (
            <button className="btn-common" onClick={openCamera}>
              Open Camera
            </button>
          ) : loading ? (
            <button type="button" className="btn-disabled" disabled>
              <svg
                className="mr-3 w-5 h-5 animate-spin text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Processing...
            </button>
          ) : (
            <button className="btn-common" onClick={capture}>
              Capture
            </button>
          )}

          <button className="btn-done">Done</button>
        </div>
      </div>
    </div>
  );
}

export default OpenCamera;
