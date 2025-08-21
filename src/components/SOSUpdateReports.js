//STYLES
import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";

function SOSUpdateReports({ isCollapsed }) {
  return (
<<<<<<< HEAD
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="text-[30px] font-bold font-title text-[#BC0F0F]">SOS Update Reports</div>
      </main>
    </>
=======
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

      <div className="mb-20"></div>
    </main>
>>>>>>> 50c69bc (Fixed Styles)
  );
}

export default SOSUpdateReports;
