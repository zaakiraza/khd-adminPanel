import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Reports.css";

export default function TeacherReport() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${baseURL}/report/teachers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setReports(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch teacher reports");
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
        <h1>Teacher Activity Reports</h1>
      </div>
      <div className="report-grid">
        {reports.map((report) => (
          <div key={report.teacher_id} className="report-card">
            <h3>{report.name}</h3>
            <div className="stat-row">
              <span className="stat-label">Email</span>
              <span className="stat-value">{report.email}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Lesson Plans Created</span>
              <span className="stat-value">{report.lesson_plans_created}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
