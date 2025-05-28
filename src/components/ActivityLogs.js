import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";

function ActivityLogs({ isCollapsed }) {
  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Activity Logs</div>
      </main>
    </>
  );
}

export default ActivityLogs;
