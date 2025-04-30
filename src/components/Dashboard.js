import React, { useState, useEffect, useContext } from "react";
import { InfoContext } from "../context/InfoContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import api from "../api";

function Dashboard({ isCollapsed }) {
  const { announcements, fetchAnnouncements } = useContext(InfoContext);
  const [events, setEvents] = useState([]);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    if (!isFetched) {
      fetchAnnouncements();
      setIsFetched(true);
    }
  }, [fetchAnnouncements]);

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      console.log("Raw Announcements Data:", announcements);
      const newEvents = announcements
        .filter(
          (announcement) => announcement.eventStart && announcement.eventEnd
        )
        .map((announcement) => ({
          title: announcement.title,
          start: announcement.eventStart,
          end: announcement.eventEnd,
        }));
      setEvents((prevEvents) => {
        const updatedEvents = newEvents.filter(
          (newEvent) =>
            !prevEvents.some(
              (event) =>
                event.start === newEvent.start && event.end === newEvent.end
            )
        );
        return [...prevEvents, ...updatedEvents];
      });
    }
  }, [announcements]);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div>
          <h1>Events Calendar</h1>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={events}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }}
          />
        </div>
      </main>
    </>
  );
}

export default Dashboard;
