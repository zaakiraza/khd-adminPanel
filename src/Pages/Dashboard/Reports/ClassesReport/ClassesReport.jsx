import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Reports.css";

export default function ClassesReport() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${baseURL}/report/classes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setReports(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch class reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="loading-state">Loading reports...</div>;

  return (
    <div className="reports-container">
      <div className="heading">
        <h1>Class Performance Reports</h1>
      </div>
      <div className="report-grid">
        {reports.map((report) => (
          <div key={report.class_id} className="report-card">
            <h3>{report.class_name}</h3>
            <div className="stat-row">
              <span className="stat-label">Total Students</span>
              <span className="stat-value">{report.total_students}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Avg. Attendance</span>
              <span className="stat-value">{report.average_attendance}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${report.average_attendance}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
