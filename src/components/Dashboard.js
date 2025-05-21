import React, { useState, useEffect, useContext } from "react";
import { InfoContext } from "../context/InfoContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import "../Stylesheets/Dashboard.css";
import api from "../api";

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

  // Check the structure
  // console.log(documentData);
  // console.log(reservationData);
  // console.log(blotterData);

  useEffect(() => {
    if (user.role === "Secretary" || user.role === "Clerk") {
      const announcementEvents = (announcements || [])
        .filter((a) => a.status !== "Archived")
        .filter((a) => a.eventStart && a.eventEnd)
        .map((a) => ({
          title: a.title,
          start: a.eventStart,
          end: a.eventEnd,
          backgroundColor:
            a.category === "General"
              ? "#E3DE48"
              : a.category === "Public Safety & Emergency"
              ? "#FA7020"
              : a.category === "Health & Sanitation"
              ? "#E3DE48"
              : a.category === "Social Services"
              ? "#50C700"
              : a.category === "Infrastructure"
              ? "#0E94D3"
              : a.category === "Education & Youth"
              ? "#1E0ED3"
              : "#3174ad",
        }));

      const approvedReservationEvents = (courtreservations || [])
        .filter((r) => r.status === "Approved")
        .map((r) => ({
          title: `${r.resID?.lastname}, ${r.resID?.firstname}`,
          start: r.starttime,
          end: r.endtime,
          backgroundColor: "#770ED3",
        }));

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

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Dashboard</div>

        <div className="form-grid mt-4">
          {(user.role === "Secretary" || user.role === "Clerk") && (
            <>
              <div className="form-group">
                <div className="demog-card-container">
                  <div class="demog-card-left-border bg-[#E3DE48]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.total}
                    </h2>
                    <p class="text-[#E3DE48] font-title text-[16px] font-medium">
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
                  <div class="demog-card-left-border bg-[#0E94D3]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.male}
                    </h2>
                    <p class="text-[#0E94D3] font-title text-[16px] font-medium">
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
                  <div class="demog-card-left-border bg-[#FCA0FE]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.female}
                    </h2>
                    <p class="text-[#FCA0FE] font-title text-[16px] font-medium">
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
                  <div class="demog-card-left-border bg-[#FA7020]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.seniorCitizens}
                    </h2>
                    <p class="text-[#FA7020] font-title text-[16px] font-medium">
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
                  <div class="demog-card-left-border bg-[#59D05E]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.voters}
                    </h2>
                    <p class="text-[#59D05E] font-title text-[16px] font-medium">
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
          {(user.role === "Secretary" || user.role === "Clerk") && (
            <>{/* Bar Graph of Certificates & Reservations */}</>
          )}

          {user.role === "Justice" && <>{/* Bar Graph of Blotters */}</>}
        </div>

        <div className="mt-8">
          <h1 className="text-[20px] font-title font-semibold">
            Events Calendar
          </h1>
          <div className="bg-white p-2 rounded-md">
            <div className="form-grid mt-4 mb-4">
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#FF0000] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-[14px] font-title font-medium">
                    General
                  </span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#FA7020] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-[14px] font-title font-medium">
                    Public Safety & Emergency
                  </span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#E3DE48] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-[14px] font-title font-medium">
                    Health & Sanitation
                  </span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#50C700] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-[14px] font-title font-medium">
                    Social Services
                  </span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#0E94D3] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-[14px] font-title font-medium">
                    Infrastructure
                  </span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#1E0ED3] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-[14px] font-title font-medium">
                    Education & Youth
                  </span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#770ED3] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-[14px] font-title font-medium">
                    Court Reservation
                  </span>
                </div>
              </div>
            </div>

            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              slotEventOverlap={false}
              dayMaxEventRows={true}
              events={events}
              height="auto"
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}

export default Dashboard;
