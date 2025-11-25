import React, { useState, useEffect } from "react";
import api from "../../../../utils/api";
import "../Reports.css";

export default function SessionReport() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get(`${baseURL}/session/all`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setSessions(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch sessions");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading) {
    return (
      <div className="reports-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading session reports...</p>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="reports-container">
        <div className="heading">
          <h1>
            <i className="fas fa-calendar-alt"></i> Session Reports
          </h1>
        </div>
        <div className="empty-state">
          <i className="fas fa-folder-open"></i>
          <p>No sessions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="heading">
        <h1>
          <i className="fas fa-calendar-alt"></i> Session Reports
        </h1>
        <p className="subtitle">Overview of all academic sessions</p>
      </div>
      <div className="report-grid">
        {sessions.map((session) => (
          <div key={session._id} className="report-card">
            <div className="report-card-header">
              <i className="fas fa-graduation-cap"></i>
              <h3>{session.session_name}</h3>
            </div>
            <div className="report-card-body">
              <div className="stat-row">
                <span className="stat-label">
                  <i className="fas fa-info-circle"></i> Status
                </span>
                <span className={`stat-badge ${session.isActive ? 'active' : 'inactive'}`}>
                  {session.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">
                  <i className="fas fa-clock"></i> Created
                </span>
                <span className="stat-value">
                  {session.createdAt 
                    ? new Date(session.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
