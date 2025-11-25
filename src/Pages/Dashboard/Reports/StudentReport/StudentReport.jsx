import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Reports.css";

export default function StudentReport() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${baseURL}/report/students`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setReports(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch student reports");
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
        <h1>Student Performance Reports</h1>
      </div>
      <div className="report-grid">
        {reports.map((report) => (
          <div key={report.student_id} className="report-card">
            <h3>{report.name}</h3>
            <div className="stat-row">
              <span className="stat-label">Class</span>
              <span className="stat-value">{report.class_name}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Attendance</span>
              <span className="stat-value">{report.attendance_percentage}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${report.attendance_percentage}%` }}
              ></div>
            </div>
            <div className="stat-row" style={{ marginTop: '10px' }}>
              <span className="stat-label">Avg. Result</span>
              <span className="stat-value">{report.average_result}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
