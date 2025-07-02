import React, { useState, useEffect, useContext } from "react";
import { InfoContext } from "../context/InfoContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import "../Stylesheets/Dashboard.css";
import { useNavigate } from "react-router-dom";
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
import { FaHandsHelping } from "react-icons/fa";
import { FaHouse } from "react-icons/fa6";
import { MdWorkOff } from "react-icons/md";
import { AuthContext } from "../context/AuthContext";

function Dashboard({ isCollapsed }) {
  const navigation = useNavigate();
  const [residentsData, setResidentsData] = useState({});
  const [documentData, setDocumentData] = useState({});
  const [blotterData, setBlotterData] = useState({});
  const [classificationsData, setClassificationsData] = useState({});
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
    fetchHouseholds,
    household,
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
      fetchHouseholds();
      setIsFetched(true);
    }
  }, []);

  // Demographics Data
  useEffect(() => {
    const fetchResidentData = async () => {
      const totalResidents = residents.filter(
        (element) =>
          element.status !== "Archived" &&
          element.status !== "Pending" &&
          element.status !== "Rejected"
      ).length;

      const male = residents
        .filter((element) => element.sex === "Male")
        .filter(
          (element) =>
            element.status !== "Archived" &&
            element.status !== "Pending" &&
            element.status !== "Rejected"
        ).length;

      const female = residents
        .filter((element) => element.sex === "Female")
        .filter(
          (element) =>
            element.status !== "Archived" &&
            element.status !== "Pending" &&
            element.status !== "Rejected"
        ).length;

      const seniorCitizens = residents
        .filter((element) => element.age >= 60)
        .filter(
          (element) =>
            element.status !== "Archived" &&
            element.status !== "Pending" &&
            element.status !== "Rejected"
        ).length;

      const voters = residents
        .filter((element) => element.voter === "Yes")
        .filter(
          (element) =>
            element.status !== "Archived" &&
            element.status !== "Pending" &&
            element.status !== "Rejected"
        ).length;

      const PWD = residents
        .filter((element) => element.isPWD)
        .filter(
          (element) =>
            element.status !== "Archived" &&
            element.status !== "Pending" &&
            element.status !== "Rejected"
        ).length;

      const pregnant = residents
        .filter((element) => element.isPregnant)
        .filter(
          (element) =>
            element.status !== "Archived" &&
            element.status !== "Pending" &&
            element.status !== "Rejected"
        ).length;

      const fourps = household
        .filter((element) => element.sociostatus === "NHTS 4Ps")
        .filter(
          (element) =>
            element.status !== "Archived" &&
            element.status !== "Pending" &&
            element.status !== "Rejected"
        ).length;

      // const soloparent = residents
      //   .filter((element) => element.isSoloParent)
      //   .filter(
      //     (element) =>
      //       element.status !== "Archived" && element.status !== "Pending"
      //   ).length;

      const unemployed = residents
        .filter(
          (element) =>
            element.employmentstatus === "Unemployed" &&
            element.status !== "Pending" &&
            element.status !== "Rejected"
        )
        .filter((element) => element.status !== "Archived").length;

      const totalHouseholds = household.filter(
        (element) =>
          element.status !== "Archived" &&
          element.status !== "Pending" &&
          element.status !== "Rejected"
      ).length;

      setClassificationsData({
        Newborn: residents.filter((r) => r.isNewborn).length,
        Infant: residents.filter((r) => r.isInfant).length,
        "Under 5 y.o": residents.filter((r) => r.isUnder5).length,
        "School of Age": residents.filter((r) => r.isSchoolAge).length,
        Adolescent: residents.filter((r) => r.isAdolescent).length,
        "Adolescent Pregnant": residents.filter((r) => r.isAdolescentPregnant)
          .length,
        Adult: residents.filter((r) => r.isAdult).length,
        Postpartum: residents.filter((r) => r.isPostpartum).length,
        "Women of Reproductive Age": residents.filter(
          (r) => r.isWomenOfReproductive
        ).length,
        "Senior Citizens": residents.filter((r) => r.isSenior).length,
        Pregnant: residents.filter((r) => r.isPregnant).length,
        PWD: residents.filter((r) => r.isPWD).length,
      });

      setResidentsData({
        total: totalResidents,
        totalHouseholds: totalHouseholds,
        male: male,
        female: female,
        seniorCitizens: seniorCitizens,
        voters: voters,
        PWD: PWD,
        pregnant: pregnant,
        fourps: fourps,
        // soloparent: soloparent,
        unemployed: unemployed,
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
    if (user.role === "Secretary" || user.role === "Technical Admin") {
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
                ? "#4A90E2"
                : a.category === "Health & Sanitation"
                ? "#7ED321"
                : a.category === "Public Safety & Emergency"
                ? "#FF0000"
                : a.category === "Education & Youth"
                ? "#FFD942"
                : a.category === "Social Services"
                ? "#808080"
                : a.category === "Infrastructure"
                ? "#EC9300"
                : a.category === "Court Reservations"
                ? "#9B59B6"
                : a.category === "Blotter"
                ? "#00796B"
                : "#4A90E2",
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
      const scheduledBlotters = (blotterreports || [])
        .filter((b) => b.status === "Scheduled")
        .map((b) => ({
          title: `${b.complainantID?.lastname}, ${b.complainantID?.firstname}`,
          start: parseCustomDateString(b.starttime),
          end: parseCustomDateString(b.endtime),
          backgroundColor: "#00796B",
        }));

      setEvents([
        ...announcementEvents,
        ...approvedReservationEvents,
        ...scheduledBlotters,
      ]);
    } else if (user.role === "Clerk") {
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
                ? "#4A90E2"
                : a.category === "Health & Sanitation"
                ? "#7ED321"
                : a.category === "Public Safety & Emergency"
                ? "#FF0000"
                : a.category === "Education & Youth"
                ? "#FFD942"
                : a.category === "Social Services"
                ? "#808080"
                : a.category === "Infrastructure"
                ? "#EC9300"
                : a.category === "Court Reservations"
                ? "#9B59B6"
                : a.category === "Blotter"
                ? "#00796B"
                : "#4A90E2",
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
    } else if (
      user.role === "Justice" ||
      user.role === "Secretary" ||
      user.role === "Technical Admin"
    ) {
      const scheduledBlotters = (blotterreports || [])
        .filter((b) => b.status === "Scheduled")
        .map((b) => ({
          title: `${b.complainantID?.lastname}, ${b.complainantID?.firstname}`,
          start: parseCustomDateString(b.starttime),
          end: parseCustomDateString(b.endtime),
          backgroundColor: "#00796B",
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

  const classificationArray = Object.entries(classificationsData).map(
    ([key, value]) => ({
      category: key,
      Total: value,
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
          {(user.role === "Secretary" ||
            user.role === "Clerk" ||
            user.role === "Technical Admin") && (
            <>
              <div
                className="form-group cursor-pointer"
                onClick={() => navigation("/residents")}
              >
                <div className="demog-card-container hover:bg-[#FFB200]/10">
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

              <div
                className="form-group cursor-pointer"
                onClick={() => navigation("/households")}
              >
                <div className="demog-card-container hover:bg-[#EB5B00]/10">
                  <div class="demog-card-left-border bg-[#EB5B00]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.totalHouseholds}
                    </h2>
                    <p class="text-[#EB5B00] font-title text-[16px] font-semibold">
                      Total Households
                    </p>
                  </div>

                  <div class="demog-icon">
                    <FaHouse />
                  </div>
                </div>
              </div>

              <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/residents", {
                    state: {
                      selectedSort: "Male",
                    },
                  })
                }
              >
                <div className="demog-card-container hover:bg-[#0079FF]/10">
                  <div class="demog-card-left-border bg-[#0079FF] "></div>

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

              <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/residents", {
                    state: {
                      selectedSort: "Female",
                    },
                  })
                }
              >
                <div className="demog-card-container hover:bg-[#FF90BB]/10">
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

              {/* <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/residents", {
                    state: {
                      selectedSort: "Senior Citizens",
                    },
                  })
                }
              >
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

              <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/residents", {
                    state: {
                      selectedSort: "PWD",
                    },
                  })
                }
              >
                <div className="demog-card-container">
                  <div class="demog-card-left-border bg-[#00DFA2]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.PWD}
                    </h2>
                    <p class="text-[#00DFA2] font-title text-[16px] font-semibold">
                      PWD
                    </p>
                  </div>

                  <div class="demog-icon">
                    <MdElderly />
                  </div>
                </div>
              </div>

              <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/residents", {
                    state: {
                      selectedSort: "Pregnant",
                    },
                  })
                }
              >
                <div className="demog-card-container">
                  <div class="demog-card-left-border bg-[#00DFA2]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.pregnant}
                    </h2>
                    <p class="text-[#00DFA2] font-title text-[16px] font-semibold">
                      Pregnant
                    </p>
                  </div>

                  <div class="demog-icon">
                    <MdElderly />
                  </div>
                </div>
              </div> */}

              <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/households", {
                    state: {
                      selectedSort: "4Ps",
                    },
                  })
                }
              >
                <div className="demog-card-container hover:bg-[#AF47D2]/10">
                  <div class="demog-card-left-border bg-[#AF47D2]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.fourps}
                    </h2>
                    <p class="text-[#AF47D2] font-title text-[16px] font-semibold">
                      4Ps
                    </p>
                  </div>

                  <div class="demog-icon">
                    <FaHandsHelping />
                  </div>
                </div>
              </div>

              {/* <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/residents", {
                    state: {
                      selectedSort: "Solo Parent",
                    },
                  })
                }
              >
                <div className="demog-card-container">
                  <div class="demog-card-left-border bg-[#00DFA2]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.soloparent}
                    </h2>
                    <p class="text-[#00DFA2] font-title text-[16px] font-semibold">
                      Solo Parent
                    </p>
                  </div>

                  <div class="demog-icon">
                    <MdElderly />
                  </div>
                </div>
              </div> */}

              <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/residents", {
                    state: {
                      selectedSort: "Unemployed",
                    },
                  })
                }
              >
                <div className="demog-card-container hover:bg-[#7C838B]/10">
                  <div class="demog-card-left-border bg-[#7C838B]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.unemployed}
                    </h2>
                    <p class="text-[#7C838B] font-title text-[16px] font-semibold">
                      Unemployed
                    </p>
                  </div>

                  <div class="demog-icon">
                    <MdWorkOff />
                  </div>
                </div>
              </div>

              <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/residents", {
                    state: {
                      selectedSort: "Voters",
                    },
                  })
                }
              >
                <div className="demog-card-container hover:bg-[#06D001]/10">
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
        {(user.role === "Secretary" ||
          user.role === "Clerk" ||
          user.role === "Technical Admin") && (
          <div className="col-span-2 white-bg-container">
            <h2 className="text-base font-medium text-center text-navy-blue">
              Classification by Age/Health
            </h2>
            {classificationArray.length > 0 ? (
              <div className="w-full h-[20rem]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={classificationArray}
                    margin={{ top: 20, right: 30, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 14, fill: "#04384E" }}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="Total"
                      fill="#0096FF"
                      className="cursor-pointer"
                      onClick={(data, index) => {
                        const clickedCategory =
                          classificationArray[index].category;

                        navigation("/residents", {
                          state: {
                            selectedSort: clickedCategory,
                          },
                        });
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="w-full h-[20rem] flex items-center justify-center">
                <h1 className="text-center text-gray-600">
                  No classification data available.
                </h1>
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <h1 className="text-[20px] font-title font-semibold">Reports</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {(user.role === "Secretary" ||
              user.role === "Clerk" ||
              user.role === "Technical Admin") && (
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
            {(user.role === "Justice" ||
              user.role === "Secretary" ||
              user.role === "Technical Admin") && (
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
              {(user.role === "Secretary" ||
                user.role === "Clerk" ||
                user.role === "Technical Admin") && (
                <>
                  <div className="form-group">
                    <div className="flex flex-row items-center">
                      <div className="bg-[#4A90E2] w-4 h-4 rounded-md"></div>
                      <span className="ml-4 text-sm font-subTitle font-[600]">
                        General
                      </span>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="flex flex-row items-center">
                      <div className="bg-[#7ED321] w-4 h-4 rounded-md"></div>
                      <span className="ml-4 text-sm font-subTitle font-[600]">
                        Health & Sanitation
                      </span>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="flex flex-row items-center">
                      <div className="bg-[#FF0000] w-4 h-4 rounded-md"></div>
                      <span className="ml-4 text-sm font-subTitle font-[600]">
                        Public Safety & Emergency
                      </span>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="flex flex-row items-center">
                      <div className="bg-[#FFD942] w-4 h-4 rounded-md"></div>
                      <span className="ml-4 text-sm font-subTitle font-[600]">
                        Education & Youth
                      </span>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="flex flex-row items-center">
                      <div className="bg-[#808080] w-4 h-4 rounded-md"></div>
                      <span className="ml-4 text-sm font-subTitle font-[600]">
                        Social Services
                      </span>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="flex flex-row items-center">
                      <div className="bg-[#EC9300] w-4 h-4 rounded-md"></div>
                      <span className="ml-4 text-sm font-subTitle font-[600]">
                        Infrastructure
                      </span>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="flex flex-row items-center">
                      <div className="bg-[#9B59B6] w-4 h-4 rounded-md"></div>
                      <span className="ml-4 text-sm font-subTitle font-[600]">
                        Court Reservation
                      </span>
                    </div>
                  </div>
                </>
              )}
              {(user.role === "Secretary" ||
                user.role === "Justice" ||
                user.role === "Technical Admin") && (
                <div className="form-group">
                  <div className="flex flex-row items-center">
                    <div className="bg-[#00796B] w-4 h-4 rounded-md"></div>
                    <span className="ml-4 text-sm font-subTitle font-[600]">
                      Blotter
                    </span>
                  </div>
                </div>
              )}
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
