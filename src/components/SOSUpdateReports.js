//STYLES
import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";

function SOSUpdateReports({ isCollapsed }) {
  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="text-[30px] font-bold font-title text-[#BC0F0F]">SOS Update Reports</div>
      </main>
    </>
  );
}

export default SOSUpdateReports;
