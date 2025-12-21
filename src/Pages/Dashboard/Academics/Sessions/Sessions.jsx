import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./Sessions.css";

export default function Sessions() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showError, showSuccess, showWarning } = useToast();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    session_name: "",
  });

  // Fetch all sessions
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}/session/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 200) {
        setSessions(response.data.data);
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        setSessions([]);
      } else {
        showError("Failed to fetch sessions");
        if (e.response && e.response.status === 403) {
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleAdd = () => {
    setFormData({ session_name: "" });
    setEditingSession(null);
    setShowAddModal(true);
  };

  const handleEdit = (session) => {
    setFormData({ session_name: session.session_name });
    setEditingSession(session);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingSession(null);
    setFormData({ session_name: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.session_name.trim()) {
      showWarning("Session name is required");
      return;
    }

    try {
      if (editingSession) {
        // Update existing session
        const response = await axios.put(
          `${baseURL}/session/${editingSession._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200) {
          showSuccess("Session updated successfully");
          handleCloseModal();
          fetchSessions();
        }
      } else {
        // Add new session
        const response = await axios.post(`${baseURL}/session`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status === 201) {
          showSuccess("Session added successfully");
          handleCloseModal();
          fetchSessions();
        }
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to save session");
    }
  };

  const handleToggleStatus = async (session) => {
    const endpoint = session.isActive
      ? `/session/update/inactive/${session._id}`
      : `/session/update/active/${session._id}`;

    try {
      const response = await axios.patch(`${baseURL}${endpoint}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        showSuccess(
          `Session ${session.isActive ? "deactivated" : "activated"} successfully`
        );
        fetchSessions();
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to update session status");
    }
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this session?")) {
      return;
    }

    try {
      const response = await axios.delete(`${baseURL}/session/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        showSuccess("Session deleted successfully");
        fetchSessions();
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to delete session");
    }
  };

  return (
    <section className="sess-container">
      <div className="sess-heading">
        <div>
          <h1>Session Management</h1>
          <p className="subtitle">Create and manage academic sessions</p>
        </div>
      </div>

      {/* Add Button */}
      <div className="sess-action-bar">
        <button className="sess-add-btn" onClick={handleAdd}>
          <i className="fa-solid fa-plus"></i> Add New Session
        </button>
      </div>

      {loading ? (
        <div className="sess-loading-state">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading sessions...</p>
        </div>
      ) : sessions.length > 0 ? (
        <>
          <div className="sess-grid">
            {sessions.map((session) => (
              <div
                key={session._id}
                className={`sess-card ${session.isActive ? "active" : "inactive"}`}
              >
                <div className="sess-card-header">
                  <h3>{session.session_name}</h3>
                  <span className={`sess-status-badge ${session.isActive ? "active" : "inactive"}`}>
                    {session.isActive ? (
                      <>
                        <i className="fa-solid fa-check-circle"></i> Active
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-times-circle"></i> Inactive
                      </>
                    )}
                  </span>
                </div>

                <div className="sess-card-actions">
                  <button
                    className="sess-edit-btn"
                    onClick={() => handleEdit(session)}
                  >
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                  <button
                    className={`sess-toggle-btn ${session.isActive ? "deactivate" : "activate"}`}
                    onClick={() => handleToggleStatus(session)}
                  >
                    <i className={`fa-solid fa-${session.isActive ? "toggle-on" : "toggle-off"}`}></i>
                    {session.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="sess-delete-btn"
                    onClick={() => handleDelete(session._id)}
                  >
                    <i className="fa-solid fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="sess-summary-card">
            <h3>
              <i className="fa-solid fa-chart-pie"></i> Summary
            </h3>
            <div className="sess-summary-stats">
              <div className="sess-stat-box">
                <span className="sess-stat-number">{sessions.length}</span>
                <span className="sess-stat-label">Total Sessions</span>
              </div>
              <div className="sess-stat-box active">
                <span className="sess-stat-number">
                  {sessions.filter((s) => s.isActive).length}
                </span>
                <span className="sess-stat-label">Active Sessions</span>
              </div>
              <div className="sess-stat-box inactive">
                <span className="sess-stat-number">
                  {sessions.filter((s) => !s.isActive).length}
                </span>
                <span className="sess-stat-label">Inactive Sessions</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="sess-empty-state">
          <i className="fa-solid fa-calendar-xmark"></i>
          <p>No sessions found</p>
          <span>Click "Add New Session" to create your first session</span>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="sess-modal-overlay" onClick={handleCloseModal}>
          <div className="sess-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="sess-modal-header">
              <h2>
                <i className="fa-solid fa-calendar-plus"></i>{" "}
                {editingSession ? "Edit Session" : "Add New Session"}
              </h2>
              <button className="sess-close-btn" onClick={handleCloseModal}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="sess-form-group">
                <label htmlFor="session-name">
                  <i className="fa-solid fa-tag"></i> Session Name:
                </label>
                <input
                  type="text"
                  id="session-name"
                  value={formData.session_name}
                  onChange={(e) =>
                    setFormData({ ...formData, session_name: e.target.value })
                  }
                  placeholder="e.g., Rajab 2025, Zilhaj 2025"
                  autoFocus
                />
              </div>

              <div className="sess-form-actions">
                <button type="submit" className="sess-submit-btn">
                  <i className="fa-solid fa-check"></i>{" "}
                  {editingSession ? "Update Session" : "Add Session"}
                </button>
                <button
                  type="button"
                  className="sess-cancel-btn"
                  onClick={handleCloseModal}
                >
                  <i className="fa-solid fa-times"></i> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
