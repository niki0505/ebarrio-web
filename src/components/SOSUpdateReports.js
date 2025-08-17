import React, { useContext, useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { InfoContext } from "../context/InfoContext";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 14.46, // Aniban 2 latitude
  lng: 120.966, // Aniban 2 longitude
};

function SOSUpdateReports({ isCollapsed }) {
  const [position, setPosition] = useState(defaultCenter);
  const [selectedID, setSelectedID] = useState(null);
  const { fetchReports, reports } = useContext(InfoContext);
  const [report, setReport] = useState([]);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyC3T3SOxoBKrTVpuJwvxGZIBQKg2iuFHGE",
  });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });

        // Send to backend
        fetch("https://your-backend.com/api/sos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  }, []);

  function formatAddress(components) {
    let streetNumber = "";
    let route = "";
    let city = "";
    let province = "";

    components.forEach((comp) => {
      if (comp.types.includes("street_number")) streetNumber = comp.long_name;
      if (comp.types.includes("route")) route = comp.long_name;
      if (comp.types.includes("locality")) city = comp.long_name;
      if (comp.types.includes("administrative_area_level_2"))
        province = comp.long_name;
    });

    const addressParts = [streetNumber, route, city, province].filter(Boolean);
    return addressParts.join(", ");
  }

  const getReadableAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyC3T3SOxoBKrTVpuJwvxGZIBQKg2iuFHGE`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        console.log("Results", data.results[0].address_components);
        return formatAddress(data.results[0].address_components);
      }
      return null;
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  useEffect(() => {
    if (selectedID) {
      const found = reports.find((r) => r._id === selectedID);

      if (found) {
        (async () => {
          const readableAddress = await getReadableAddress(
            found.location.lat,
            found.location.lng
          );
          const { datePart, timePart } = getDateAndTime(found.createdAt);
          setReport({ ...found, readableAddress, datePart, timePart });
        })();
      } else {
        setReport(null);
      }
    } else {
      setReport(null);
    }
  }, [selectedID, reports]);

  function getDateAndTime(timestamp) {
    if (!timestamp) return { datePart: "", timePart: "" };

    const date = new Date(timestamp);

    const datePart = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Manila",
    });

    const timePart = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Manila",
    });

    return { datePart, timePart };
  }

  return (
    <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
      <div className="text-[30px] font-bold font-title text-[#BC0F0F]">
        SOS Update Reports
      </div>

      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={position}
          zoom={20}
        >
          {/* Marker */}
          {reports?.map((report) => {
            return (
              <Marker
                key={report._id}
                position={report.location}
                onClick={() => setSelectedID(report._id)}
              />
            );
          })}
        </GoogleMap>
      )}
      {report && (
        <div key={report._id}>
          <img
            src={report.resID?.picture}
            alt="Resident"
            style={{ width: "80px", height: "80px", borderRadius: "50%" }}
          />
          <p>
            {report.resID?.firstname} {report.resID?.lastname}
          </p>
          <p>{report.resID?.age}</p>
          <p>{report.resID?.householdno?.address}</p>
          <p>{report.resID?.mobilenumber}</p>
          <p>{report.responder?.length}</p>
        </div>
      )}

      {report && (
        <div>
          <p>
            {report.reporttype
              ? report.reporttype
              : "Resident didn't provide details but needs urgent assistance."}
          </p>
          <p>{report.resID?.age}</p>
          <p>{report.readableAddress}</p>
          <p>{report.datePart}</p>
          <p>{report.timePart}</p>
          <p>{report.reportdetails ? report.reportdetails : "N/A"}</p>
        </div>
      )}
    </main>
  );
}

export default SOSUpdateReports;
