import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";
import { useContext, useEffect, useState } from "react";
import { InfoContext } from "../context/InfoContext";
import { MdArrowDropDown } from "react-icons/md";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

function ActivityLogs({ isCollapsed }) {
  const { fetchActivityLogs, activitylogs } = useContext(InfoContext);

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  //For Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const sortedLogs = [...activitylogs].sort((a, b) => b.logno - a.logno);
  const currentRows = sortedLogs.slice(indexOfFirstRow, indexOfLastRow);
  const totalRows = activitylogs.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Activity Logs</div>

        <hr className="mt-4 border border-gray-300" />

        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>User</th>
              <th>Action</th>
              <th>Description</th>
              <th>Timestamp</th>
            </tr>
          </thead>

          <tbody className="bg-[#fff]">
            {activitylogs.length === 0 ? (
              <tr>
                <td colSpan={5}>No results found</td>
              </tr>
            ) : (
              currentRows.map((log) => (
                <tr
                  key={log._id}
                  className="border-t transition-colors duration-300 ease-in-out"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f0f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                  }}
                >
                  <td>{log.logno}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        textAlign: "left",
                      }}
                    >
                      <img
                        width={40}
                        style={{
                          borderRadius: "50%",
                          height: 40,
                          width: 40,
                          objectFit: "cover",
                          marginLeft: 10,
                        }}
                        alt="User"
                        src={
                          log.userID.empID?.resID?.picture ||
                          log.userID.resID?.picture
                        }
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div>
                          {log.userID.empID
                            ? log.userID.empID.resID.middlename
                              ? `${log.userID.empID.resID.lastname} ${log.userID.empID.resID.middlename} ${log.userID.empID.resID.firstname}`
                              : `${log.userID.empID.resID.lastname} ${log.userID.empID.resID.firstname}`
                            : log.userID.resID
                            ? log.userID.resID.middlename
                              ? `${log.userID.resID.lastname} ${log.userID.resID.middlename} ${log.userID.resID.firstname}`
                              : `${log.userID.resID.lastname} ${log.userID.resID.firstname}`
                            : "No name available"}
                        </div>
                        <div style={{ color: "gray" }}>
                          {log.userID.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{log.action}</td>
                  <td>{log.description}</td>
                  <td>{log.createdAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-end items-center mt-4 text-sm text-gray-700 gap-x-4">
          <div className="flex items-center space-x-1">
            <span>Rows per page:</span>
            <div className="relative w-12">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none w-full border px-1 py-1 pr-5 rounded bg-white text-center text-[#0E94D3]"
              >
                {[5, 10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-gray-600 pr-1">
                <MdArrowDropDown size={18} color={"#0E94D3"} />
              </div>
            </div>
          </div>

          <div>
            {startRow}-{endRow} of {totalRows}
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded"
            >
              <MdKeyboardArrowLeft color={"#0E94D3"} className="text-xl" />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded"
            >
              <MdKeyboardArrowRight color={"#0E94D3"} className="text-xl" />
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default ActivityLogs;
