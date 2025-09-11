import { Outlet } from "react-router-dom";
import SideBarMenu from "./SideBarMenu";
import "./dashboard.css";

export default function Dashboard() {
  return (
    <div style={{ display: "flex" }}>
      <SideBarMenu />
      <div
        style={{
          width: "78%",
          marginLeft: "22%",
          height: "100vh",
          backgroundColor: "#e9e9e9",
          overflowY: "auto",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
