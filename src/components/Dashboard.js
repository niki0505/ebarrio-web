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

function Dashboard({ isCollapsed }) {
  const {
    announcements,
    fetchAnnouncements,
    fetchReservations,
    courtreservations,
  } = useContext(InfoContext);
  const [events, setEvents] = useState([]);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    if (!isFetched) {
      fetchAnnouncements();
      fetchReservations();
      setIsFetched(true);
    }
  }, [fetchAnnouncements, fetchReservations]);

  useEffect(() => {
    const announcementEvents = (announcements || [])
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
  }, [announcements, courtreservations]);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Dashboard</div>

        <div className="form-grid mt-4">
          <div className="form-group">
            <div className="demog-card-container">
              <div class="demog-card-left-border bg-[#E3DE48]"></div>

              <div class="flex-grow">
                <h2 class="demog-text-number">3,000</h2>
                <p class="text-[#E3DE48] font-semibold">Total Residents</p>
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
                <h2 class="demog-text-number">1,500</h2>
                <p class="text-[#0E94D3] font-semibold">Male</p>
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
                <h2 class="demog-text-number">1,500</h2>
                <p class="text-[#FCA0FE] font-semibold">Female</p>
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
                <h2 class="demog-text-number">500</h2>
                <p class="text-[#FA7020] font-semibold">Senior Citizens</p>
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
                <h2 class="demog-text-number">1,000</h2>
                <p class="text-[#59D05E] font-semibold">Voters</p>
              </div>

              <div class="demog-icon">
                <MdHowToVote />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="demog-card-container">
              <div class="demog-card-left-border bg-[#FF0000]"></div>

              <div class="flex-grow">
                <h2 class="demog-text-number">500</h2>
                <p class="text-[#FF0000] font-semibold">Non-Voters</p>
              </div>

              <div class="demog-icon">
                <MdOutlineHowToVote />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="demog-card-container">
              <div class="demog-card-left-border bg-[#BF9727]"></div>

              <div class="flex-grow">
                <h2 class="demog-text-number">500</h2>
                <p class="text-[#BF9727] font-semibold">Blotter</p>
              </div>

              <div class="demog-icon">
                <MdEditDocument />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="demog-card-container">
              <div class="demog-card-left-border bg-[#43254F]"></div>

              <div class="flex-grow">
                <h2 class="demog-text-number">500</h2>
                <p class="text-[#43254F] font-semibold">Certificate Requests</p>
              </div>

              <div class="demog-icon">
                <IoDocumentTextSharp />
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="demog-card-container">
              <div class="demog-card-left-border bg-[#7D7979]"></div>

              <div class="flex-grow">
                <h2 class="demog-text-number">2</h2>
                <p class="text-[#7D7979] font-semibold">Court Reservations</p>
              </div>

              <div class="demog-icon">
                <PiCourtBasketballFill />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-xl tracking-tight font-semibold">
            Events Calendar
          </h1>
          <div className="bg-white p-2 rounded-md">
            <div className="form-grid mt-4 mb-4">
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#FF0000] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-sm">General</span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#FA7020] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-sm">
                    Public Safety & Emergency
                  </span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#E3DE48] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-sm">Health & Sanitation</span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#50C700] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-sm">Social Services</span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#0E94D3] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-sm">Infrastructure</span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#1E0ED3] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-sm">Education & Youth</span>
                </div>
              </div>
              <div className="form-group">
                <div className="flex flex-row items-center">
                  <div className="bg-[#770ED3] w-4 h-4 rounded-md"></div>
                  <span className="ml-4 text-sm">Court Reservation</span>
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
