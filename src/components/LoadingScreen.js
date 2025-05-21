import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/CommonStyle.css";
import { AuthContext } from "../context/AuthContext";
import api from "../api";

function LoadingScreen({}) {
  return (
    <>
      <div className="modal-container">
        <div className="modal-content w-[30rem] h-[15rem] ">
          <h2 style={{ color: "white" }}>Loading...</h2>
        </div>
      </div>
    </>
  );
}

export default LoadingScreen;
