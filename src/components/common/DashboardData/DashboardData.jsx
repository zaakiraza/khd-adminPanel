import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardData.css";

function DashboardData() {
  const [totalStudents, setTotalStudents] = useState(null);
  const [activeClasses, setActiveClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_BASEURL;

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const classesData = await axios.get(`${API_BASE}/class/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (classesData.data.status) {
        let classArr = classesData.data.data;
        let cleanArr = classArr.filter((elem) => elem.isActive);
        setActiveClasses(cleanArr);
      }

      const userData = await axios.get(`${API_BASE}/users/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (userData.data.status) {
        setTotalStudents(userData.data.count);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="dashboard-data">
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-title">Total Students</div>
          <div className="card-value">
            {loading ? "Loading..." : error ? "-" : totalStudents ?? "-"}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Active Classes</div>
          <div className="card-value">
            {loading ? "Loading..." : error ? "-" : activeClasses.length}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardData;
