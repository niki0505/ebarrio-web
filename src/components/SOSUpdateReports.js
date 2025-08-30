import React, { useContext, useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { InfoContext } from "../context/InfoContext";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdArrowDropDown,
} from "react-icons/md";
import ViewSOS from "./ViewSOS";

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
  const [isReportClicked, setReportClicked] = useState(false);
  const [isActiveClicked, setActiveClicked] = useState(true);
  const [isHistoryClicked, setHistoryClicked] = useState(false);
  const [filteredReports, setFilteredReports] = useState([]);

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

          setReport({ ...found, readableAddress });
        })();
      } else {
        setReport(null);
      }
    } else {
      setReport(null);
    }
  }, [selectedID, reports]);

  const handleMenu1 = () => {
    setActiveClicked(true);
    setHistoryClicked(false);
    setSelectedID(null);
  };
  const handleMenu2 = () => {
    setHistoryClicked(true);
    setActiveClicked(false);
    setSelectedID(null);
  };

  useEffect(() => {
    if (reports) {
      let filtered = reports;
      if (isActiveClicked) {
        filtered = filtered.filter(
          (report) => report.status === "Pending" || report.status === "Ongoing"
        );
      } else if (isHistoryClicked) {
        filtered = filtered.filter(
          (report) =>
            report.status === "Resolved" ||
            report.status === "False Alarm" ||
            report.status === "Cancelled"
        );
      }
      setFilteredReports(filtered);
    }
  }, [reports, isActiveClicked, isHistoryClicked]);

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("All");
  const totalRows = filteredReports.length;
  const totalPages =
    rowsPerPage === "All" ? 1 : Math.ceil(totalRows / rowsPerPage);
  const indexOfLastRow =
    currentPage * (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const indexOfFirstRow =
    indexOfLastRow - (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const currentRows =
    rowsPerPage === "All"
      ? filteredReports
      : filteredReports.slice(indexOfFirstRow, indexOfLastRow);
  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  return (
    <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
      <div className="text-[30px] font-bold font-title text-[#BC0F0F]">
        SOS Update Reports
      </div>

      <div className="status-container">
        <p
          onClick={handleMenu1}
          className={`status-text ${
            isActiveClicked ? "border-b-4 border-[#BC0F0F]" : "text-[#808080]"
          }`}
        >
          Active
        </p>
        <p
          onClick={handleMenu2}
          className={`status-text ${
            isHistoryClicked ? "border-b-4 border-[#BC0F0F]" : "text-[#808080]"
          }`}
        >
          History
        </p>
      </div>

      <div className="line-container">
        <hr className="line" />
      </div>

      {isActiveClicked ? (
        <>
          <div
            className={`mt-4 ${report ? "grid grid-cols-3 gap-4" : "w-full"}`}
          >
            {/* Map */}
            {isLoaded && (
              <div
                className={`${
                  report ? "col-span-2" : "w-full"
                } border-4 border-[#BC0F0F] rounded-lg overflow-hidden`}
              >
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "440px" }}
                  center={position}
                  zoom={18}
                >
                  {filteredReports?.map((report) => (
                    <Marker
                      key={report._id}
                      position={report.location}
                      onClick={() => setSelectedID(report._id)}
                    />
                  ))}
                </GoogleMap>
              </div>
            )}

            {/* Reporter Details */}
            {report && (
              <div>
                {/* Reporter */}
                <div className="bg-[#BC0F0F] text-white rounded-lg p-5 shadow-md flex flex-col items-center">
                  <h2 className="text-lg font-bold mb-2">Reporter Details</h2>
                  <img
                    src={report.resID?.picture}
                    alt="Resident"
                    className="w-24 h-24 bg-white rounded-full mb-3 object-cover"
                  />
                  <p className="text-xl font-semibold">
                    {report.resID?.firstname} {report.resID?.lastname}
                  </p>
                  <p className="text-sm italic mb-2">Resident</p>
                  <div className="flex flex-col items-start">
                    <div className="flex flex-row gap-2">
                      <span className="font-bold">Age:</span>
                      <span className="opacity-80">
                        {report.resID?.age || "N/A"}
                      </span>
                    </div>
                    <span className="font-bold">Address:</span>
                    <span className="opacity-80">
                      {report.resID?.householdno?.address}
                    </span>

                    <div className="flex flex-row gap-2">
                      <span className="font-bold">Mobile:</span>
                      <span className="opacity-80">
                        {report.resID?.mobilenumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-[#BC0F0F] text-white rounded-lg p-5 shadow-md mt-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Heading:</span>
                    <span className="opacity-80">
                      {
                        report.responder?.filter((r) => r.status === "Heading")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Arrived:</span>
                    <span className="opacity-80">
                      {
                        report.responder?.filter((r) => r.status === "Arrived")
                          .length
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Emergency Table */}
          {report && (
            <div className="mt-6 border rounded-lg shadow overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead className="bg-[#BC0F0F] text-white">
                  <tr>
                    <th className="px-4 py-2">Emergency Type</th>
                    <th className="px-4 py-2">Location</th>
                    <th className="px-4 py-2">Date Reported</th>
                    <th className="px-4 py-2">Time Reported</th>
                    <th className="px-4 py-2">Additional Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-4 py-3">{report.reporttype || "N/A"}</td>
                    <td className="px-4 py-3">{report.readableAddress}</td>
                    <td className="px-4 py-3">
                      {report.createdAt?.split(" at ")[0]}
                    </td>
                    <td className="px-4 py-3">
                      {report.createdAt?.split(" at ")[1]}
                    </td>
                    <td className="px-4 py-3">
                      {report.reportdetails || "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead className="bg-[#BC0F0F]">
                <tr className="cursor-default">
                  <th>No.</th>
                  <th>Reporter</th>
                  <th>Responder/s</th>
                  <th>Type of the Incident</th>
                  <th>Status</th>
                  <th>Date Completed</th>
                </tr>
              </thead>

              <tbody className="bg-[#fff] cursor-fault">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={3}>No results found</td>
                  </tr>
                ) : (
                  currentRows.map((report) => (
                    <tr
                      key={report._id}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                      }}
                      className="cursor-default"
                      onClick={() => {
                        setReportClicked(true);
                        setSelectedID(report._id);
                      }}
                    >
                      <td>{report.SOSno}</td>
                      <td>
                        {report.resID.firstname} {report.resID.lastname}
                      </td>

                      <td>
                        {report.responder
                          .map(
                            (r) =>
                              `${r.empID?.resID.firstname} ${r.empID?.resID.lastname}`
                          )
                          .join(", ")}
                      </td>
                      <td>{report.reporttype ? report.reporttype : "N/A"}</td>
                      <td>{report.status}</td>
                      <td>{report.updatedAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {isReportClicked && (
              <ViewSOS
                onClose={() => setReportClicked(false)}
                reportID={selectedID}
              />
            )}

            <div className="table-pagination">
              <div className="table-pagination-size">
                <span>Rows per page:</span>
                <div className="relative w-12">
                  <select
                    value={rowsPerPage === "All" ? "All" : rowsPerPage}
                    onChange={(e) => {
                      const value =
                        e.target.value === "All"
                          ? "All"
                          : Number(e.target.value);
                      setRowsPerPage(value);
                      setCurrentPage(1);
                    }}
                    className="table-pagination-select"
                  >
                    <option value="All">All</option>
                    {[5, 10, 15, 20].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <div className="table-pagination-select-icon">
                    <MdArrowDropDown size={18} color={"#0E94D3"} />
                  </div>
                </div>
              </div>

              <div>
                {startRow}-{endRow} of {totalRows}
              </div>

              {rowsPerPage !== "All" && (
                <div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="table-pagination-btn"
                  >
                    <MdKeyboardArrowLeft
                      color={"#0E94D3"}
                      className="text-xl"
                    />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="table-pagination-btn"
                  >
                    <MdKeyboardArrowRight
                      color={"#0E94D3"}
                      className="text-xl"
                    />
                  </button>
                </div>
              )}
            </div>
            {currentRows.map((row, index) => (
              <div key={index}>{row.name}</div>
            ))}
          </div>
        </>
      )}
      <div className="mb-20"></div>
    </main>
  );
}

export default SOSUpdateReports;
