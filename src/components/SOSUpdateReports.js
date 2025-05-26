import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";

function SOSUpdateReports({ isCollapsed }) {
  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">SOS Update Reports</div>
      </main>
    </>
  );
}

export default SOSUpdateReports;
