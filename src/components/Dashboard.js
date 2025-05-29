import React, { useState, useEffect, useContext } from "react";
import { InfoContext } from "../context/InfoContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import "../Stylesheets/Dashboard.css";
import api from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ResponsiveContainer } from "recharts";

//ICONS
import { IoIosPeople } from "react-icons/io";
import {
  MdEditDocument,
  MdElderly,
  MdHowToVote,
  MdOutlineHowToVote,
} from "react-icons/md";
import { IoDocumentTextSharp } from "react-icons/io5";
import { PiCourtBasketballFill } from "react-icons/pi";
import { FaMale, FaFemale } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

function Dashboard({ isCollapsed }) {
  const [residentsData, setResidentsData] = useState({});
  const [documentData, setDocumentData] = useState({});
  const [blotterData, setBlotterData] = useState({});
  const [reservationData, setReservationData] = useState({});
  const {
    announcements,
    fetchAnnouncements,
    fetchReservations,
    courtreservations,
    residents,
    fetchResidents,
    certificates,
    fetchCertificates,
    blotterreports,
    fetchBlotterReports,
  } = useContext(InfoContext);
  const [events, setEvents] = useState([]);
  const [isFetched, setIsFetched] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!isFetched) {
      fetchResidents();
      fetchCertificates();
      fetchAnnouncements();
      fetchReservations();
      fetchBlotterReports();
      setIsFetched(true);
    }
  }, []);

  // Demographics Data
  useEffect(() => {
    const fetchResidentData = async () => {
      const totalResidents = residents.filter(
        (element) => element.status !== "Archived"
      ).length;

      const male = residents
        .filter((element) => element.sex === "Male")
        .filter((element) => element.status !== "Archived").length;

      const female = residents
        .filter((element) => element.sex === "Female")
        .filter((element) => element.status !== "Archived").length;

      const seniorCitizens = residents
        .filter((element) => element.age >= 60)
        .filter((element) => element.status !== "Archived").length;

      const voters = residents
        .filter((element) => element.voter === "Yes")
        .filter((element) => element.status !== "Archived").length;

      setResidentsData({
        total: totalResidents,
        male: male,
        female: female,
        seniorCitizens: seniorCitizens,
        voters: voters,
      });
    };
    fetchResidentData();
  }, [residents]);

  // Certificates Data
  useEffect(() => {
    const fetchCertificatesData = () => {
      const monthlyCounts = {};

      certificates.forEach((certificate) => {
        const rawDate = certificate.createdAt;
        const fixedDateStr = rawDate.replace(" at ", " ");
        const date = new Date(fixedDateStr);

        const month = date.toLocaleString("default", { month: "long" });
        const status = certificate.status;

        if (!monthlyCounts[month]) {
          monthlyCounts[month] = { Pending: 0, Issued: 0, Rejected: 0 };
        }

        if (monthlyCounts[month][status] !== undefined) {
          monthlyCounts[month][status]++;
        }
      });

      setDocumentData(monthlyCounts);
    };

    fetchCertificatesData();
  }, [certificates]);

  // Reservation Data
  useEffect(() => {
    const fetchReservationsData = async () => {
      const monthlyCounts = {};

      courtreservations.forEach((court) => {
        const rawDate = court.createdAt;
        const fixedDateStr = rawDate.replace(" at ", " ");
        const date = new Date(fixedDateStr);

        const month = date.toLocaleString("default", { month: "long" });
        const status = court.status;

        if (!monthlyCounts[month]) {
          monthlyCounts[month] = { Pending: 0, Approved: 0, Rejected: 0 };
        }

        if (monthlyCounts[month][status] !== undefined) {
          monthlyCounts[month][status]++;
        }
      });

      setReservationData(monthlyCounts);
    };
    fetchReservationsData();
  }, [courtreservations]);

  // Blotter Data
  useEffect(() => {
    const fetchBlotterData = async () => {
      const monthlyCounts = {};

      blotterreports.forEach((blotter) => {
        const rawDate = blotter.createdAt;
        const fixedDateStr = rawDate.replace(" at ", " ");
        const date = new Date(fixedDateStr);

        const month = date.toLocaleString("default", { month: "long" });
        const status = blotter.status;

        if (!monthlyCounts[month]) {
          monthlyCounts[month] = {
            Pending: 0,
            Scheduled: 0,
            Settled: 0,
            Rejected: 0,
          };
        }

        if (monthlyCounts[month][status] !== undefined) {
          monthlyCounts[month][status]++;
        }
      });

      setBlotterData(monthlyCounts);
    };
    fetchBlotterData();
  }, [blotterreports]);

  useEffect(() => {
    if (user.role === "Secretary" || user.role === "Clerk") {
      const announcementEvents = (announcements || [])
        .filter((a) => a.status !== "Archived")
        .filter((a) => a.times)
        .flatMap((a) =>
          Object.entries(a.times).map(([dateKey, timeObj]) => ({
            title: a.title,
            start: new Date(timeObj.starttime),
            end: new Date(timeObj.endtime),
            backgroundColor:
              a.category === "General"
                ? "#FF0000"
                : a.category === "Health & Sanitation"
                ? "#FFB200"
                : a.category === "Public Safety & Emergency"
                ? "#2600FF"
                : a.category === "Education & Youth"
                ? "#770ED3"
                : a.category === "Social Services"
                ? "#FA7020"
                : a.category === "Infrastructure"
                ? "#FA7020"
                : a.category === "Court Reservations"
                ? "#CF0ED3"
                : "#3174ad",
          }))
        );
      const approvedReservationEvents = (courtreservations || [])
        .filter((r) => r.status === "Approved")
        .flatMap((r) =>
          Object.entries(r.times || {}).map(([dateKey, timeObj]) => ({
            title: `${r.resID?.lastname}, ${r.resID?.firstname} - ${r.purpose}`,
            start: new Date(timeObj.starttime),
            end: new Date(timeObj.endtime),
            backgroundColor: "#770ED3",
          }))
        );

      setEvents([...announcementEvents, ...approvedReservationEvents]);
    } else if (user.role === "Justice") {
      const scheduledBlotters = (blotterreports || [])
        .filter((b) => b.status === "Scheduled")
        .map((b) => ({
          title: `${b.complainantID?.lastname}, ${b.complainantID?.firstname}`,
          start: parseCustomDateString(b.starttime),
          end: parseCustomDateString(b.endtime),
          backgroundColor: "#770ED3",
        }));
      setEvents([...scheduledBlotters]);
    }
  }, [user.role, blotterreports, announcements, courtreservations]);

  function parseCustomDateString(dateStr) {
    const [datePart, timePart] = dateStr.split(" at ");
    const fullStr = `${datePart} ${timePart}`;
    const parsedDate = new Date(fullStr);

    if (isNaN(parsedDate.getTime())) {
      console.warn("Invalid date string:", dateStr);
      return null;
    }

    return parsedDate.toISOString();
  }

  //To render the document requests, reservation requests, and blotters in bar graph
  const documentChartData = Object.entries(documentData).map(
    ([month, counts]) => ({
      month,
      ...counts,
    })
  );

  const reservationChartData = Object.entries(reservationData).map(
    ([month, counts]) => ({
      month,
      ...counts,
    })
  );

  const blotterChartData = Object.entries(blotterData).map(
    ([month, counts]) => ({
      month,
      ...counts,
    })
  );

  //To show single graph per status when click
  const allDocumentStatuses = ["Pending", "Issued", "Rejected"];
  const allReservationStatuses = ["Pending", "Approved", "Rejected"];
  const allBlotterStatuses = ["Pending", "Scheduled", "Rejected", "Settled"];

  const [activeDocumentKeys, setActiveDocumentKeys] =
    useState(allDocumentStatuses);
  const [activeReservationKeys, setActiveReservationKeys] = useState(
    allReservationStatuses
  );
  const [activeBlotterKeys, setActiveBlotterKeys] =
    useState(allBlotterStatuses);

  const handleLegendClick = (dataKey, activeKeys, setActiveKeys, allKeys) => {
    if (activeKeys.length === 1 && activeKeys[0] === dataKey) {
      setActiveKeys(allKeys);
    } else {
      setActiveKeys([dataKey]);
    }
  };

  //To set the frequency (y-axis) of graph
  const maxDocumentFrequency = Math.max(
    ...documentChartData.flatMap((d) => [
      d.Pending || 0,
      d.Issued || 0,
      d.Rejected || 0,
    ])
  );

  const maxReservationFrequency = Math.max(
    ...reservationChartData.flatMap((d) => [
      d.Pending || 0,
      d.Issued || 0,
      d.Rejected || 0,
    ])
  );

  const maxBlotterFrequency = Math.max(
    ...blotterChartData.flatMap((d) => [
      d.Pending || 0,
      d.Scheduled || 0,
      d.Settled || 0,
      d.Rejected || 0,
    ])
  );

  function roundUp(value, step) {
    return Math.ceil(value / step) * step;
  }

  // to generate even ticks
  function generateTicks(maxValue, numberOfTicks = 6) {
    if (maxValue === 0) return [0];

    const interval = maxValue / (numberOfTicks - 1);
    const ticks = [];

    for (let i = 0; i < numberOfTicks; i++) {
      ticks.push(Math.round(interval * i));
    }

    // Rounded to remove duplicate
    return [...new Set(ticks)].sort((a, b) => a - b);
  }

  // Round up max frequencies to nearest 5
  const roundedMaxDocumentFrequency = roundUp(maxDocumentFrequency, 5);
  const roundedMaxReservationFrequency = roundUp(maxReservationFrequency, 5);
  const roundedMaxBlotterFrequency = roundUp(maxBlotterFrequency, 5);

  const documentYTicks = generateTicks(roundedMaxDocumentFrequency);
  const reservationYTicks = generateTicks(roundedMaxReservationFrequency);
  const blotterYTicks = generateTicks(roundedMaxBlotterFrequency);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Dashboard</div>

        <div className="form-grid mt-4">
          {(user.role === "Secretary" || user.role === "Clerk") && (
            <>
              <div className="form-group">
                <div className="demog-card-container">
                  <div class="demog-card-left-border bg-[#FFB200]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.total}
                    </h2>
                    <p class="text-[#FFB200] font-title text-[16px] font-semibold">
                      Total Residents
                    </p>
                  </div>

                  <div class="demog-icon">
                    <IoIosPeople />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="demog-card-container">
                  <div class="demog-card-left-border bg-[#0079FF]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.male}
                    </h2>
                    <p class="text-[#0079FF] font-title text-[16px] font-semibold">
                      Male
                    </p>
                  </div>

                  <div class="demog-icon">
                    <FaMale />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="demog-card-container">
                  <div class="demog-card-left-border bg-[#FF90BB]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.female}
                    </h2>
                    <p class="text-[#FF90BB] font-title text-[16px] font-semibold">
                      Female
                    </p>
                  </div>

                  <div class="demog-icon">
                    <FaFemale />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="demog-card-container">
                  <div class="demog-card-left-border bg-[#00DFA2]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.seniorCitizens}
                    </h2>
                    <p class="text-[#00DFA2] font-title text-[16px] font-semibold">
                      Senior Citizens
                    </p>
                  </div>

                  <div class="demog-icon">
                    <MdElderly />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="demog-card-container">
                  <div class="demog-card-left-border bg-[#06D001]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.voters}
                    </h2>
                    <p class="text-[#06D001] font-title text-[16px] font-semibold">
                      Voters
                    </p>
                  </div>

                  <div class="demog-icon">
                    <MdHowToVote />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-8">
          <h1 className="text-[20px] font-title font-semibold">Reports</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {(user.role === "Secretary" || user.role === "Clerk") && (
              <>
                {/* Document Requests */}
                <div className="col-span-1 white-bg-container">
                  <h2 className="text-base font-medium text-center text-navy-blue">
                    Document Requests
                  </h2>
                  {documentChartData.length > 0 ? (
                    <div className="w-full h-[18rem]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={documentChartData}
                          margin={{ top: 20, right: 30, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="month"
                            tick={({ x, y, payload }) => (
                              <text
                                x={x}
                                y={y + 15}
                                textAnchor="middle"
                                fontSize={14}
                                fontFamily="Quicksand"
                                fill="#04384E"
                                fontWeight="600"
                              >
                                {payload.value}
                              </text>
                            )}
                          />

                          <YAxis
                            domain={[0, roundedMaxDocumentFrequency]}
                            ticks={documentYTicks}
                          />

                          <Tooltip />
                          <Legend
                            wrapperStyle={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#04384E",
                              fontFamily: "Quicksand",
                            }}
                            onClick={(e) =>
                              handleLegendClick(
                                e.dataKey,
                                activeDocumentKeys,
                                setActiveDocumentKeys,
                                allDocumentStatuses
                              )
                            }
                          />
                          {activeDocumentKeys.includes("Pending") && (
                            <Bar dataKey="Pending" fill="#FFC107" />
                          )}
                          {activeDocumentKeys.includes("Issued") && (
                            <Bar dataKey="Issued" fill="#4CAF50" />
                          )}
                          {activeDocumentKeys.includes("Rejected") && (
                            <Bar dataKey="Rejected" fill="#F63131" />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="w-full h-[18rem] flex items-center justify-center">
                      <h1 className="text-center text-gray-600">
                        No document request data available.
                      </h1>
                    </div>
                  )}
                </div>

                {/* Court Reservations */}
                <div className="col-span-1 white-bg-container">
                  <h2 className="text-base font-medium text-center text-navy-blue">
                    Court Reservation
                  </h2>
                  {reservationChartData.length > 0 ? (
                    <div className="w-full h-[18rem]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={reservationChartData}
                          margin={{ top: 20, right: 30, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="month"
                            tick={({ x, y, payload }) => (
                              <text
                                x={x}
                                y={y + 15}
                                textAnchor="middle"
                                fontSize={14}
                                fontFamily="Quicksand"
                                fill="#04384E"
                                fontWeight="600"
                              >
                                {payload.value}
                              </text>
                            )}
                          />
                          <YAxis
                            domain={[0, roundedMaxReservationFrequency]}
                            ticks={reservationYTicks}
                          />
                          <Tooltip />
                          <Legend
                            wrapperStyle={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#04384E",
                              fontFamily: "Quicksand",
                            }}
                            onClick={(e) =>
                              handleLegendClick(
                                e.dataKey,
                                activeReservationKeys,
                                setActiveReservationKeys,
                                allReservationStatuses
                              )
                            }
                          />
                          {activeReservationKeys.includes("Pending") && (
                            <Bar dataKey="Pending" fill="#FFC107" />
                          )}
                          {activeReservationKeys.includes("Approved") && (
                            <Bar dataKey="Approved" fill="#4CAF50" />
                          )}
                          {activeReservationKeys.includes("Rejected") && (
                            <Bar dataKey="Rejected" fill="#F63131" />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="w-full h-[18rem] flex items-center justify-center">
                      <h1 className="text-center text-gray-600">
                        No court reservation data available.
                      </h1>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Blotter Reports */}
            {(user.role === "Justice" || user.role === "Secretary") && (
              <div className="col-span-2 white-bg-container">
                <h2 className="text-base font-medium text-center text-navy-blue">
                  Blotter Reports
                </h2>
                {blotterChartData.length > 0 ? (
                  <div className="w-full h-[18rem]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={blotterChartData}
                        margin={{ top: 20, right: 30, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          tick={({ x, y, payload }) => (
                            <text
                              x={x}
                              y={y + 15}
                              textAnchor="middle"
                              fontSize={14}
                              fontFamily="Quicksand"
                              fill="#04384E"
                              fontWeight="600"
                            >
                              {payload.value}
                            </text>
                          )}
                        />
                        <YAxis
                          domain={[0, roundedMaxBlotterFrequency]}
                          ticks={blotterYTicks}
                        />

                        <Tooltip />
                        <Legend
                          wrapperStyle={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#04384E",
                            fontFamily: "Quicksand",
                          }}
                          onClick={(e) =>
                            handleLegendClick(
                              e.dataKey,
                              activeBlotterKeys,
                              setActiveBlotterKeys,
                              allBlotterStatuses
                            )
                          }
                        />
                        {activeBlotterKeys.includes("Pending") && (
                          <Bar dataKey="Pending" fill="#FFC107" />
                        )}
                        {activeBlotterKeys.includes("Scheduled") && (
                          <Bar dataKey="Scheduled" fill="#0096FF" />
                        )}
                        {activeBlotterKeys.includes("Settled") && (
                          <Bar dataKey="Settled" fill="#4CAF50" />
                        )}
                        {activeBlotterKeys.includes("Rejected") && (
                          <Bar dataKey="Rejected" fill="#F63131" />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="w-full h-[18rem] flex items-center justify-center">
                    <h1 className="text-center text-gray-600">
                      No blotter report data available.
                    </h1>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-[20px] font-title font-semibold">
            Events Calendar
          </h1>
          <div className="white-bg-container">
            <div className="form-grid mt-4 mb-4">
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#FF0000] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-sm font-subTitle font-[600]">
                    General
                  </span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#FFB200] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-sm font-subTitle font-[600]">
                    Health & Sanitation
                  </span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#2600FF] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-sm font-subTitle font-[600]">
                    Public Safety & Emergency
                  </span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#770ED3] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-sm font-subTitle font-[600]">
                    Education & Youth
                  </span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#FA7020] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-sm font-subTitle font-[600]">
                    Social Services
                  </span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#06D001] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-sm font-subTitle font-[600]">
                    Infrastructure
                  </span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#CF0ED3] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-sm font-subTitle font-[600]">
                    Court Reservation
                  </span>
                </div>
              </div>
            </div>

            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              slotEventOverlap={false}
              dayMaxEventRows={true}
              allDaySlot={false}
              events={events}
              height="auto"
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              datesSet={(viewInfo) => {
                document.body.classList.remove(
                  "fc-month-view",
                  "fc-week-view",
                  "fc-day-view"
                );
                if (viewInfo.view.type === "dayGridMonth") {
                  document.body.classList.add("fc-month-view");
                } else {
                  document.body.classList.add("fc-week-view"); // or fc-day-view
                }
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}

export default Dashboard;
