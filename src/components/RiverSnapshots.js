import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";

function RiverSnapshots({ isCollapsed }) {
  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">River Snapshots</div>
      </main>
    </>
  );
}

export default RiverSnapshots;
