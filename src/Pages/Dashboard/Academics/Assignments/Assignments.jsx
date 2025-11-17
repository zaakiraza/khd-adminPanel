import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./Assignments.css";

export default function Assignments() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showSuccess, showError, showWarning } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [missingAssignments, setMissingAssignments] = useState([]);
  const [showReminder, setShowReminder] = useState(false);

  const [filters, setFilters] = useState({
    class_id: "",
    status: "",
    week_number: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    class_id: "",
    subject: "",
    description: "",
    due_date: "",
    end_time: "",
    total_marks: "100",
    week_number: "",
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchClasses();
    fetchAssignments();
    checkMissingAssignments();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseURL}/class/all?isActive=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(response.data.data || []);
    } catch (error) {
      showError("Failed to fetch classes");
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filters.class_id) params.append("class_id", filters.class_id);
      if (filters.status) params.append("status", filters.status);
      if (filters.week_number)
        params.append("week_number", filters.week_number);

      const response = await axios.get(
        `${baseURL}/assignment?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssignments(response.data.data || []);
    } catch (error) {
      showError("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const checkMissingAssignments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseURL}/assignment/missing`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const missing = response.data.data;
      setMissingAssignments(missing.classes || []);

      if (missing.missing_count > 0) {
        setShowReminder(true);
        showWarning(
          `${missing.missing_count} classes are missing assignments for week ${missing.week_number}!`
        );
      }
    } catch (error) {
      console.error("Failed to check missing assignments");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (editingAssignment) {
        await axios.put(
          `${baseURL}/assignment/${editingAssignment._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showSuccess("Assignment updated successfully");
      } else {
        await axios.post(`${baseURL}/assignment`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showSuccess("Assignment created successfully");
      }

      fetchAssignments();
      checkMissingAssignments();
      handleCloseModal();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to save assignment");
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      class_id: assignment.class_id._id || assignment.class_id,
      subject: assignment.subject,
      description: assignment.description,
      due_date: assignment.due_date.split("T")[0],
      end_time: assignment.end_time || "",
      total_marks: assignment.total_marks,
      week_number: assignment.week_number,
      year: assignment.year,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${baseURL}/assignment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess("Assignment deleted successfully");
      fetchAssignments();
      checkMissingAssignments();
    } catch (error) {
      showError("Failed to delete assignment");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${baseURL}/assignment/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showSuccess(`Assignment status updated to ${newStatus}`);
      fetchAssignments();
    } catch (error) {
      showError("Failed to update assignment status");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAssignment(null);
    setFormData({
      title: "",
      class_id: "",
      subject: "",
      description: "",
      due_date: "",
      end_time: "",
      total_marks: "100",
      week_number: "",
      year: new Date().getFullYear(),
    });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchAssignments();
  };

  const resetFilters = () => {
    setFilters({
      class_id: "",
      status: "",
      week_number: "",
    });
    setTimeout(() => fetchAssignments(), 100);
  };

  const getCurrentWeekNumber = () => {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "green";
      case "draft":
        return "orange";
      case "closed":
        return "red";
      default:
        return "gray";
    }
  };

  const totalAssignments =  assignments.length;
  const publishedAssignments = assignments.filter(
    (a) => a.status === "published"
  ).length;
  const draftAssignments = assignments.filter(
    (a) => a.status === "draft"
  ).length;

  return (
    <div className="assignments-container">
      <div className="assignments-header">
        <h1>Assignments Management</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add Assignment
        </button>
      </div>

      {/* Reminder Alert */}
      {showReminder && missingAssignments.length > 0 && (
        <div className="reminder-alert">
          <div className="reminder-header">
            <h3>⚠️ Weekly Assignment Reminder</h3>
            <button onClick={() => setShowReminder(false)}>×</button>
          </div>
          <p>
            The following classes are missing assignments for this week (Week{" "}
            {getCurrentWeekNumber()}):
          </p>
          <ul>
            {missingAssignments.map((cls) => (
              <li key={cls._id}>{cls.class_name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card">
          <h3>{totalAssignments}</h3>
          <p>Total Assignments</p>
        </div>
        <div className="stat-card">
          <h3>{publishedAssignments}</h3>
          <p>Published</p>
        </div>
        <div className="stat-card">
          <h3>{draftAssignments}</h3>
          <p>Drafts</p>
        </div>
        <div className="stat-card">
          <h3>{getCurrentWeekNumber()}</h3>
          <p>Current Week</p>
        </div>
      </div>

      {/* Filters */}
      <div className="toolbar">
        <div className="filters">
          <select
            name="class_id"
            value={filters.class_id}
            onChange={handleFilterChange}
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.class_name}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>

          <input
            type="number"
            name="week_number"
            placeholder="Week Number"
            value={filters.week_number}
            onChange={handleFilterChange}
            min="1"
            max="52"
          />

          <button className="filter-btn" onClick={applyFilters}>
            Apply Filters
          </button>
          <button className="reset-btn" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      {/* Assignments Grid */}
      {loading ? (
        <div className="loading">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="no-data">No assignments found</div>
      ) : (
        <div className="assignments-grid">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="assignment-card">
              <div className="card-header">
                <h3>{assignment.title}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(assignment.status) }}
                >
                  {assignment.status}
                </span>
              </div>

              <div className="card-body">
                <p className="class-name">{assignment.class_name}</p>
                <p className="subject">Subject: {assignment.subject}</p>
                <p className="description">{assignment.description}</p>

                <div className="assignment-info">
                  <div className="info-item">
                    <span className="label">Due Date:</span>
                    <span className="value">
                      {formatDate(assignment.due_date)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Week:</span>
                    <span className="value">{assignment.week_number}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Marks:</span>
                    <span className="value">{assignment.total_marks}</span>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                {assignment.status === "draft" && (
                  <button
                    className="action-btn publish-btn"
                    onClick={() =>
                      handleStatusUpdate(assignment._id, "published")
                    }
                  >
                    Publish
                  </button>
                )}
                {assignment.status === "published" && (
                  <>
                    <button
                      className="action-btn unpublish-btn"
                      onClick={() => handleStatusUpdate(assignment._id, "draft")}
                    >
                      Unpublish
                    </button>
                    <button
                      className="action-btn close-btn"
                      onClick={() => handleStatusUpdate(assignment._id, "closed")}
                    >
                      Close
                    </button>
                  </>
                )}
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEdit(assignment)}
                >
                  Edit
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(assignment._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingAssignment ? "Edit Assignment" : "Add Assignment"}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Class *</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) =>
                      setFormData({ ...formData, class_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.class_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Due Date *</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Marks *</label>
                  <input
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) =>
                      setFormData({ ...formData, total_marks: e.target.value })
                    }
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Week Number *</label>
                  <input
                    type="number"
                    value={formData.week_number}
                    onChange={(e) =>
                      setFormData({ ...formData, week_number: e.target.value })
                    }
                    min="1"
                    max="52"
                    placeholder={`Current: ${getCurrentWeekNumber()}`}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Year *</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    min="2020"
                    max="2030"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingAssignment ? "Update" : "Create"} Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
