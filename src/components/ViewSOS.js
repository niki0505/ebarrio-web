import { useEffect, useState, useContext } from "react";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

//SCREENS

//STYLES
import "../App.css";

//ICONS
import { IoClose } from "react-icons/io5";

const containerStyle = {
  width: "50%",
  height: "200px",
};

function ViewSOS({ onClose, reportID }) {
  dayjs.extend(relativeTime);
  dayjs.extend(customParseFormat);
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { reports } = useContext(InfoContext);
  const [showModal, setShowModal] = useState(true);
  const [position, setPosition] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState([]);

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyC3T3SOxoBKrTVpuJwvxGZIBQKg2iuFHGE",
  });

  const selectedReport = reports.find((r) => r._id === reportID);

  useEffect(() => {
    if (selectedReport)
      setPosition({
        lat: selectedReport.location.lat,
        lng: selectedReport.location.lng,
      });
  }, [selectedReport]);

  console.log(selectedReport);
  return (
    <>
      {showModal && (
        <div className="modal-container">
          <div className="modal-content w-[45rem] h-[30rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">View Report</h1>
                  <IoClose
                    onClick={handleClose}
                    class="dialog-title-bar-icon"
                  ></IoClose>
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            <div className="modal-form-container">
              {selectedReport && (
                <div>
                  <p>{selectedReport.status}</p>
                  <p>
                    {dayjs(
                      selectedReport.updatedAt,
                      "MMMM D, YYYY [at] h:mm A"
                    ).fromNow()}
                  </p>
                  <img
                    src={selectedReport.resID?.picture}
                    alt="Resident"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                    }}
                  />
                  <p>
                    {selectedReport.resID.firstname}{" "}
                    {selectedReport.resID.lastname}
                  </p>
                  <p>{selectedReport.resID.age}</p>
                  <p>{selectedReport.resID.householdno.address}</p>
                  {isLoaded && position && (
                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      center={position}
                      zoom={20}
                    >
                      <Marker key={selectedReport._id} position={position} />
                    </GoogleMap>
                  )}
                  <p>{selectedReport.createdAt}</p>
                  <p>
                    {selectedReport.reporttype
                      ? selectedReport.reporttype
                      : "N/A"}
                  </p>
                  <p>
                    {selectedReport.reportdetails
                      ? selectedReport.reportdetails
                      : "N/A"}
                  </p>
                  {selectedReport.responder?.map((r) => {
                    return (
                      <>
                        <img
                          src={r.empID.resID?.picture}
                          alt="Personnel"
                          style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                          }}
                        />
                        <p>
                          {r.empID.resID.firstname} {r.empID.resID.lastname}
                        </p>
                        <p>{r.empID.resID.mobilenumber}</p>
                        <p>{r.arrivedat ? r.arrivedat : null}</p>
                      </>
                    );
                  })}
                  <p>{selectedReport.postreportdetails}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ViewSOS;
