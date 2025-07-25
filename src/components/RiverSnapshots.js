import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";
import api from "../api";
import { useState, useEffect } from "react";

function RiverSnapshots({ isCollapsed }) {
  const [latest, setLatest] = useState([]);
  const [isRecentClicked, setRecentClicked] = useState(true);
  const [isHistoryClicked, setHistoryClicked] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModal, setModal] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get("/latestsnapshot");
        setLatest(res.data.latest);
        setHistory(res.data.history);
      } catch (err) {
        console.error("❌ Could not fetch snapshot:", err);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleMenu1 = () => {
    setRecentClicked(true);
    setHistoryClicked(false);
  };
  const handleMenu2 = () => {
    setHistoryClicked(true);
    setRecentClicked(false);
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="text-[30px] font-bold font-title text-[#BC0F0F]">
          River Snapshots
        </div>
        <div className="status-container">
          <p
            onClick={handleMenu1}
            className={`status-text ${
              isRecentClicked
                ? "status-line !border-[#BC0F0F]"
                : "text-[#808080]"
            }`}
          >
            Recent
          </p>
          <p
            onClick={handleMenu2}
            className={`status-text ${
              isHistoryClicked
                ? "status-line !border-[#BC0F0F]"
                : "text-[#808080]"
            }`}
          >
            History
          </p>
        </div>
        {isRecentClicked && (
          <div className="mt-4">
            {latest.url ? (
              <div>
                <img
                  src={latest.url}
                  alt="Latest River Snapshot"
                  className="rounded shadow-md max-w-full h-auto"
                />
                <p>
                  CCTV Snapshot as of{" "}
                  {latest.datetime?.split(" at ")[1] || "Unknown Time"}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Loading latest snapshot...</p>
            )}
          </div>
        )}
        {isHistoryClicked && (
          <>
            <table>
              <thead className="bg-[#BC0F0F]">
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody className="bg-[#fff]">
                {history.map((snap, index) => {
                  const [datePart, timePart] = snap.datetime.split(" at ");
                  return (
                    <tr
                      key={index}
                      onClick={() => {
                        setSelectedImage(snap.url);
                        setModal(true);
                      }}
                      className="border-t transition-colors duration-300 ease-in-out"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      <td>{datePart}</td>
                      <td>{timePart}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {isModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl w-full relative">
                  <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl"
                    onClick={() => setModal(false)}
                  >
                    &times;
                  </button>
                  <img
                    src={selectedImage}
                    alt="Selected Snapshot"
                    className="w-full h-auto rounded"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default RiverSnapshots;
