import Sidebar from "../SideBar/Sidebar";
import { Outlet } from "react-router-dom";
import "./dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />
      <main className="dashboard__main">
        <Outlet />
      </main>
    </div>
  );
}
