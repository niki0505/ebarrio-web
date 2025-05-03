import { useRef, useState, useEffect, useContext } from "react";
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { MdPersonAddAlt1 } from "react-icons/md";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import ReactDOM from "react-dom/client";
import { useConfirm } from "../context/ConfirmContext";
import IndigencyPrint from "./certificates/IndigencyPrint";
import CreateCertificate from "./CreateCertificate";
import BusinessClearancePrint from "./certificates/BusinessClearancePrint";
import ClearancePrint from "./certificates/ClearancePrint";
import { AuthContext } from "../context/AuthContext";
import Reject from "./Reject";

function CourtReservations({ isCollapsed }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  //   const { fetchCertificates, certificates } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  //   const [certificates, setCertificates] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  //   const [expandedRow, setExpandedRow] = useState(null);
  //   const [search, setSearch] = useState("");

  //   const [isRejectClicked, setRejectClicked] = useState(false);
  //   const [selectedCertID, setSelectedCertID] = useState(null);

  //   useEffect(() => {
  //     setFilteredCertificates(certificates);
  //   }, [certificates]);

  //   useEffect(() => {
  //     fetchCertificates();
  //   }, [fetchCertificates]);

  //   const rejectBtn = (e, certID) => {
  //     e.stopPropagation();
  //     setRejectClicked(true);
  //     setSelectedCertID(certID);
  //   };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Court Reservations</div>

        {/* <SearchBar handleSearch={handleSearch} searchValue={search} /> */}

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Purpose</th>
              <th>Date & Time</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {/* {filteredReservations.length === 0 ? (
                    <tr className="bg-white">
                      <td colSpan={5} className="text-center p-2">
                        No results found
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((cert) => (
                      <tr key={cert.resID._id} className="border-t">
                        <td className="p-2">
                          {cert.resID.middlename
                            ? `${cert.resID.lastname} ${cert.resID.middlename} ${cert.resID.firstname}`
                            : `${cert.resID.lastname} ${cert.resID.firstname}`}
                        </td>
                        <td className="p-2">{cert.typeofcertificate}</td>
                        <td className="p-2">{cert.amount}</td>
                        <td className="p-2">
                          {cert.createdAt.substring(
                            0,
                            cert.createdAt.indexOf(" at")
                          )}
                        </td>
                        <td className="p-2">{cert.status}</td>
                      </tr>
                    ))
                  )} */}
          </tbody>
        </table>
        {/* {isRejectClicked && (
          <Reject
            certID={selectedCertID}
            onClose={() => setRejectClicked(false)}
          />
        )} */}
      </main>
    </>
  );
}

export default CourtReservations;
