import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

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
  const [selected, setSelected] = useState(null); // For tracking which pin is clicked

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyC3T3SOxoBKrTVpuJwvxGZIBQKg2iuFHGE", // Replace with your API key
  });

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
          <Marker position={position} onClick={() => setSelected(position)} />

          {/* Info Window when marker is clicked */}
          {selected && (
            <InfoWindow
              position={selected}
              onCloseClick={() => setSelected(null)}
            >
              <div>
                <h2>🚨 SOS Location</h2>
                <p>Lat: {selected.lat}</p>
                <p>Lng: {selected.lng}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </main>
  );
}

export default SOSUpdateReports;
