import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./Classes.css";

export default function Classes() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showError, showSuccess, showWarning } = useToast();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    class_name: "",
    teacher_assigned: "",
    class_timing: "",
    class_day: "",
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch all classes
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}/class/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 200) {
        setClasses(response.data.data);
      }
    } catch (e) {
      showError("Failed to fetch classes");
      if (e.response && e.response.status === 403) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAdd = () => {
    setFormData({
      class_name: "",
      teacher_assigned: "",
      class_timing: "",
      class_day: "",
    });
    setEditingClass(null);
    setShowAddModal(true);
  };

  const handleEdit = (classData) => {
    setFormData({
      class_name: classData.class_name,
      teacher_assigned: classData.teacher_assigned || "",
      class_timing: classData.class_timing || "",
      class_day: classData.class_day || "",
    });
    setEditingClass(classData);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingClass(null);
    setFormData({
      class_name: "",
      teacher_assigned: "",
      class_timing: "",
      class_day: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.class_name.trim()) {
      showWarning("Class name is required");
      return;
    }

    try {
      if (editingClass) {
        // Update existing class
        const response = await axios.put(
          `${baseURL}/class/${editingClass._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200) {
          showSuccess("Class updated successfully");
          handleCloseModal();
          fetchClasses();
        }
      } else {
        // Add new class
        const response = await axios.post(`${baseURL}/class`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status === 201) {
          showSuccess("Class added successfully");
          handleCloseModal();
          fetchClasses();
        }
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to save class");
    }
  };

  const handleToggleStatus = async (classData) => {
    const endpoint = classData.isActive
      ? `/class/update/inactive/${classData._id}`
      : `/class/update/active/${classData._id}`;

    try {
      const response = await axios.patch(`${baseURL}${endpoint}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        showSuccess(
          `Class ${classData.isActive ? "deactivated" : "activated"} successfully`
        );
        fetchClasses();
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to update class status");
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) {
      return;
    }

    try {
      const response = await axios.delete(`${baseURL}/class/${classId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        showSuccess("Class deleted successfully");
        fetchClasses();
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to delete class");
    }
  };

  const formatTime = (time) => {
    if (!time) return "Not Set";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <section className="classes-container">
      <div className="heading">
        <h1>Class Management</h1>
        <p className="subtitle">Create and manage academic classes</p>
      </div>

      {/* Add Button */}
      <div className="action-bar">
        <button className="add-class-btn" onClick={handleAdd}>
          <i className="fa-solid fa-plus"></i> Add New Class
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading classes...</p>
        </div>
      ) : classes.length > 0 ? (
        <>
          <div className="classes-grid">
            {classes.map((classData) => (
              <div
                key={classData._id}
                className={`class-card ${classData.isActive ? "active" : "inactive"}`}
              >
                <div className="card-header">
                  <div className="class-info">
                    <h3>{classData.class_name}</h3>
                    {classData.teacher_assigned && (
                      <span className="teacher-badge">
                        <i className="fa-solid fa-chalkboard-user"></i>{" "}
                        {classData.teacher_assigned}
                      </span>
                    )}
                  </div>
                  <span
                    className={`status-badge ${classData.isActive ? "active" : "inactive"}`}
                  >
                    {classData.isActive ? (
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

                <div className="class-details">
                  <div className="detail-item">
                    <i className="fa-solid fa-calendar-days"></i>
                    <div>
                      <span className="label">Day</span>
                      <span className="value">
                        {classData.class_day || "Not Set"}
                      </span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <i className="fa-solid fa-clock"></i>
                    <div>
                      <span className="label">Time</span>
                      <span className="value">
                        {formatTime(classData.class_timing)}
                      </span>
                    </div>
                  </div>
                  <div className="detail-item">
                    <i className="fa-solid fa-users"></i>
                    <div>
                      <span className="label">Students</span>
                      <span className="value">
                        {classData.students_enrolled || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(classData)}
                  >
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                  <button
                    className={`toggle-btn ${classData.isActive ? "deactivate" : "activate"}`}
                    onClick={() => handleToggleStatus(classData)}
                  >
                    <i
                      className={`fa-solid fa-${classData.isActive ? "toggle-on" : "toggle-off"}`}
                    ></i>
                    {classData.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(classData._id)}
                  >
                    <i className="fa-solid fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="summary-card">
            <h3>
              <i className="fa-solid fa-chart-pie"></i> Summary
            </h3>
            <div className="summary-stats">
              <div className="stat-box">
                <span className="stat-number">{classes.length}</span>
                <span className="stat-label">Total Classes</span>
              </div>
              <div className="stat-box active">
                <span className="stat-number">
                  {classes.filter((c) => c.isActive).length}
                </span>
                <span className="stat-label">Active Classes</span>
              </div>
              <div className="stat-box inactive">
                <span className="stat-number">
                  {classes.filter((c) => !c.isActive).length}
                </span>
                <span className="stat-label">Inactive Classes</span>
              </div>
              <div className="stat-box scheduled">
                <span className="stat-number">
                  {
                    classes.filter(
                      (c) => c.class_timing && c.class_day
                    ).length
                  }
                </span>
                <span className="stat-label">Scheduled</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <i className="fa-solid fa-school"></i>
          <p>No classes found</p>
          <span>Click "Add New Class" to create your first class</span>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fa-solid fa-school"></i>{" "}
                {editingClass ? "Edit Class" : "Add New Class"}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="class-name">
                  <i className="fa-solid fa-tag"></i> Class Name:
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="class-name"
                  value={formData.class_name}
                  onChange={(e) =>
                    setFormData({ ...formData, class_name: e.target.value })
                  }
                  placeholder="e.g., Atfaal-Awal, Awwal, Doam"
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="teacher-assigned">
                  <i className="fa-solid fa-chalkboard-user"></i> Teacher
                  Assigned:
                </label>
                <input
                  type="text"
                  id="teacher-assigned"
                  value={formData.teacher_assigned}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teacher_assigned: e.target.value,
                    })
                  }
                  placeholder="Teacher name (optional)"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="class-day">
                    <i className="fa-solid fa-calendar-days"></i> Class Day:
                  </label>
                  <select
                    id="class-day"
                    value={formData.class_day}
                    onChange={(e) =>
                      setFormData({ ...formData, class_day: e.target.value })
                    }
                  >
                    <option value="">-- Select Day --</option>
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="class-timing">
                    <i className="fa-solid fa-clock"></i> Class Timing:
                  </label>
                  <input
                    type="time"
                    id="class-timing"
                    value={formData.class_timing}
                    onChange={(e) =>
                      setFormData({ ...formData, class_timing: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  <i className="fa-solid fa-check"></i>{" "}
                  {editingClass ? "Update Class" : "Add Class"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
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
