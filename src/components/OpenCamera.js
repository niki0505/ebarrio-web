import Webcam from "react-webcam";
import { useRef, useState, useEffect } from "react";
import { removeBackground } from "@imgly/background-removal";

//STYLES
import "../Stylesheets/OpenCamera.css";

import { IoClose } from "react-icons/io5";

function OpenCamera({ onDone, onClose }) {
  const webRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [flash, setFlash] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const checkCamera = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    setHasCamera(videoDevices.length > 0);
  };

  useEffect(() => {
    checkCamera();
    const handleDeviceChange = () => checkCamera();
    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () =>
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange
      );
  }, []);

  const openCamera = () => {
    setImageSrc(null);
  };

  const capture = async () => {
    const screenshot = webRef.current.getScreenshot();
    if (screenshot) setImageSrc(screenshot);

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

  const handleDoneClick = () => {
    if (imageSrc) {
      onDone(imageSrc);
    }
  };

  return (
    <>
      {showModal && (
        <div className={`modal-container ${flash ? "flash-effect" : ""}`}>
          <div className="modal-content h-[30rem] w-[45rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Picture</h1>
                  <IoClose
                    onClick={onClose}
                    class="dialog-title-bar-icon"
                  ></IoClose>
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            <div className="modal-form-container flex flex-col items-center justify-center">
              <div classname="modal-form">
                <div>
                  {hasCamera ? (
                    imageSrc ? (
                      <img className="modal-image" src={imageSrc} />
                    ) : (
                      !loading && (
                        <Webcam
                          className="modal-image"
                          ref={webRef}
                          screenshotFormat="image/png/jpg"
                        />
                      )
                    )
                  ) : (
                    <p className="mb-5">
                      No camera detected. Please ensure it's connected or
                      installed properly.
                    </p>
                  )}
                </div>

                {imageSrc && !loading && (
                  <p className="success-message">
                    The picture has been captured successfully!
                  </p>
                )}

                <div className="camera-container">
                  {imageSrc && !loading ? (
                    <button
                      className="actions-btn bg-btn-color-blue"
                      onClick={openCamera}
                    >
                      Open Camera
                    </button>
                  ) : loading ? (
                    <button
                      type="button"
                      className="btn-disabled actions-btn bg-btn-color-blue"
                      disabled
                    >
                      <svg className="spinner" viewBox="0 0 24 24" fill="none">
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
                    <button
                      className={
                        hasCamera
                          ? "actions-btn bg-btn-color-blue"
                          : "actions-btn bg-btn-color-blue cursor-not-allowed"
                      }
                      onClick={capture}
                      disabled={!hasCamera}
                    >
                      Capture
                    </button>
                  )}

                  <button
                    className={
                      imageSrc
                        ? "actions-btn bg-btn-color-gray hover:bg-gray-400"
                        : "actions-btn bg-btn-color-gray cursor-not-allowed"
                    }
                    onClick={handleDoneClick}
                    disabled={!imageSrc}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OpenCamera;
