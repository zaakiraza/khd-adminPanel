import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ApproveLeave.css";
import {useToast} from "../../../../components/common/Toast/ToastContext";
export default function ApproveLeave() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showSuccess, showError } = useToast();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchLeaves();
  }, [filter]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/leave?status=${filter === 'all' ? '' : filter}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLeaves(response.data.data || []);
    } catch (error) {
      showError("Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.patch(
        `${baseURL}/leave/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      showSuccess(`Leave request ${status}`);
      fetchLeaves();
    } catch (error) {
      showError("Failed to update status");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const stats = {
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length
  };

  return (
    <div className="approve-leave-container">
      <div className="heading">
        <h1><i className="fas fa-user-clock"></i> Leave Management</h1>
        <p className="subtitle">Review and manage student and teacher leave requests</p>
      </div>

      <div className="leave-stats">
        <div className="stat-card pending">
          <div className="stat-icon"><i className="fas fa-hourglass-half"></i></div>
          <div className="stat-info">
            <h3>{stats.pending}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
        <div className="stat-card approved">
          <div className="stat-icon"><i className="fas fa-check"></i></div>
          <div className="stat-info">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-icon"><i className="fas fa-times"></i></div>
          <div className="stat-info">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      <div className="leaves-list">
        <div className="list-header">
          <h2>Leave Requests</h2>
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All Requests</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading requests...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-inbox"></i>
            <p>No leave requests found</p>
          </div>
        ) : (
          leaves.map((leave) => (
            <div key={leave._id} className="leave-item">
              <div className="applicant-info">
                <div className="avatar-placeholder">
                  {getInitials(leave.user_name)}
                </div>
                <div className="details">
                  <h4>{leave.user_name}</h4>
                  <div className="leave-meta">
                    <span><i className="fas fa-tag"></i> {leave.leave_type}</span>
                    <span><i className="fas fa-calendar"></i> {formatDate(leave.start_date)} - {formatDate(leave.end_date)}</span>
                  </div>
                  <p className="reason">"{leave.reason}"</p>
                </div>
              </div>
              <div className="actions">
                {leave.status === 'pending' ? (
                  <>
                    <button
                      className="approve-btn"
                      onClick={() => handleStatusUpdate(leave._id, 'approved')}
                    >
                      <i className="fas fa-check"></i> Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleStatusUpdate(leave._id, 'rejected')}
                    >
                      <i className="fas fa-times"></i> Reject
                    </button>
                  </>
                ) : (
                  <span className={`status-tag ${leave.status}`}>
                    {leave.status}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
