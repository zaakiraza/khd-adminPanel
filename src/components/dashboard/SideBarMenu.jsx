import { Link, useLocation } from "react-router-dom";
import "./dashboard.css";
// import logo from "../../assets/logo.png";

export default function SideBarMenu() {
  const location = useLocation();
  const logo = '/logo.png';
  const menuItems = [
    { name: "Students", path: "/dashboard/student" },
    { name: "Attendance", path: "/dashboard/attendance" },
    { name: "New Admissions", path: "/dashboard/new-admissions" },
    { name: "Quizes", path: "/dashboard/quizes" },
    { name: "Assignments", path: "/dashboard/assignments" },
    { name: "Create Zoom Meeting", path: "/dashboard/zoom" },
    { name: "Result", path: "/dashboard/result" },
  ];

  return (
    <div className="sideMenu">
      <div className="TopLogo">
        <img src={logo} alt="logo" />
      </div>
      <ul className="barItems">
        {menuItems.map((item, idx) => (
          <li
            key={idx}
            className={location.pathname === item.path ? "active" : ""}
          >
            <Link
              to={item.path}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
