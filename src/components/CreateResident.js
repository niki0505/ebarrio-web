import Webcam from "react-webcam";
import { useRef, useState } from "react";
import axios from "axios";
import OpenCamera from "./OpenCamera";

function CreateResident() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const toggleCamera = () => {
    setIsCameraOpen((prev) => !prev);
  };
  return (
    <div>
      <h1>Hello</h1>
      <button onClick={toggleCamera}>Open Camera</button>
      <button>Attach Photo</button>
      {isCameraOpen && <OpenCamera />}
    </div>
  );
}

export default CreateResident;
