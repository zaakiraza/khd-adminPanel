import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Reports.css";

export default function ExamReport() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${baseURL}/report/exams`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setReports(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch exam reports");
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
        <h1>Examination Reports</h1>
      </div>
      <div className="report-grid">
        {reports.map((report) => (
          <div key={report.exam_id} className="report-card">
            <h3>{report.exam_name}</h3>
            <div className="stat-row">
              <span className="stat-label">Class</span>
              <span className="stat-value">{report.class_name}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Subject</span>
              <span className="stat-value">{report.subject}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Pass Percentage</span>
              <span className="stat-value">{report.pass_percentage}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${report.pass_percentage}%`,
                  backgroundColor: report.pass_percentage > 70 ? '#16a34a' : '#dc2626'
                }}
              ></div>
            </div>
            <div className="stat-row" style={{ marginTop: '10px' }}>
              <span className="stat-label">Top Scorer</span>
              <span className="stat-value">{report.top_scorer}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
