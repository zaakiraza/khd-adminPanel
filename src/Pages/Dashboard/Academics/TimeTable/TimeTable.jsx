import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./TimeTable.css";

export default function TimeTable() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showError, showSuccess, showWarning } = useToast();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
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

  // Fetch all active classes
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}/class/all?isActive=true`, {
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

  const handleEdit = (classData) => {
    setEditingClass(classData._id);
    setFormData({
      class_timing: classData.class_timing || "",
      class_day: classData.class_day || "",
    });
  };

  const handleCancel = () => {
    setEditingClass(null);
    setFormData({
      class_timing: "",
      class_day: "",
    });
  };

  const handleSave = async (classId) => {
    if (!formData.class_timing || !formData.class_day) {
      showWarning("Please fill in both timing and day");
      return;
    }

    try {
      const response = await axios.put(
        `${baseURL}/class/${classId}`,
        {
          class_timing: formData.class_timing,
          class_day: formData.class_day,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        showSuccess("Timetable updated successfully");
        setEditingClass(null);
        fetchClasses(); // Refresh the list
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to update timetable");
    }
  };

  const handleClearSchedule = async (classId) => {
    if (!window.confirm("Are you sure you want to clear the schedule for this class?")) {
      return;
    }

    try {
      const response = await axios.put(
        `${baseURL}/class/${classId}`,
        {
          class_timing: "",
          class_day: "",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        showSuccess("Schedule cleared successfully");
        fetchClasses();
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to clear schedule");
    }
  };

  const getScheduleStatus = (classData) => {
    if (classData.class_timing && classData.class_day) {
      return "scheduled";
    }
    return "unscheduled";
  };

  return (
    <section className="tt-container">
      <div className="tt-heading">
        <div>
          <h1>Class Timetable Management</h1>
          <p className="subtitle">Set and manage schedules for active classes</p>
        </div>
      </div>

      {loading ? (
        <div className="tt-loading-state">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading classes...</p>
        </div>
      ) : classes.length > 0 ? (
        <div className="tt-grid">
          {classes.map((classData) => (
            <div
              key={classData._id}
              className={`tt-card ${getScheduleStatus(classData)}`}
            >
              <div className="tt-card-header">
                <div className="tt-class-info">
                  <h3>{classData.class_name}</h3>
                  {classData.teacher_assigned && (
                    <span className="tt-teacher-badge">
                      <i className="fa-solid fa-chalkboard-user"></i>{" "}
                      {classData.teacher_assigned}
                    </span>
                  )}
                </div>
                <span
                  className={`tt-status-indicator ${getScheduleStatus(classData)}`}
                >
                  {getScheduleStatus(classData) === "scheduled" ? (
                    <>
                      <i className="fa-solid fa-check-circle"></i> Scheduled
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-exclamation-circle"></i> Not
                      Scheduled
                    </>
                  )}
                </span>
              </div>

              {editingClass === classData._id ? (
                <div className="tt-edit-form">
                  <div className="tt-form-group">
                    <label htmlFor={`timing-${classData._id}`}>
                      <i className="fa-solid fa-clock"></i> Class Timing:
                    </label>
                    <input
                      type="time"
                      id={`timing-${classData._id}`}
                      value={formData.class_timing}
                      onChange={(e) =>
                        setFormData({ ...formData, class_timing: e.target.value })
                      }
                    />
                  </div>

                  <div className="tt-form-group">
                    <label htmlFor={`day-${classData._id}`}>
                      <i className="fa-solid fa-calendar-days"></i> Class Day:
                    </label>
                    <select
                      id={`day-${classData._id}`}
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

                  <div className="tt-form-actions">
                    <button
                      className="tt-save-btn"
                      onClick={() => handleSave(classData._id)}
                    >
                      <i className="fa-solid fa-check"></i> Save
                    </button>
                    <button className="tt-cancel-btn" onClick={handleCancel}>
                      <i className="fa-solid fa-times"></i> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="tt-schedule-display">
                  {classData.class_timing && classData.class_day ? (
                    <>
                      <div className="tt-schedule-info">
                        <div className="tt-info-item">
                          <i className="fa-solid fa-calendar-days"></i>
                          <div>
                            <span className="label">Day</span>
                            <span className="value">{classData.class_day}</span>
                          </div>
                        </div>
                        <div className="tt-info-item">
                          <i className="fa-solid fa-clock"></i>
                          <div>
                            <span className="label">Time</span>
                            <span className="value">
                              {formatTime(classData.class_timing)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="tt-card-actions">
                        <button
                          className="tt-edit-btn"
                          onClick={() => handleEdit(classData)}
                        >
                          <i className="fa-solid fa-pen"></i> Edit
                        </button>
                        <button
                          className="tt-clear-btn"
                          onClick={() => handleClearSchedule(classData._id)}
                        >
                          <i className="fa-solid fa-trash"></i> Clear
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="tt-no-schedule">
                      <i className="fa-solid fa-calendar-xmark"></i>
                      <p>No schedule set</p>
                      <button
                        className="tt-add-btn"
                        onClick={() => handleEdit(classData)}
                      >
                        <i className="fa-solid fa-plus"></i> Add Schedule
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="tt-empty-state">
          <i className="fa-solid fa-calendar-xmark"></i>
          <p>No active classes found</p>
          <span>Please add active classes to create timetables</span>
        </div>
      )}

      {/* Summary Section */}
      {classes.length > 0 && (
        <div className="tt-summary-card">
          <h3>
            <i className="fa-solid fa-chart-pie"></i> Summary
          </h3>
          <div className="tt-summary-stats">
            <div className="tt-stat-box">
              <span className="tt-stat-number">{classes.length}</span>
              <span className="tt-stat-label">Total Active Classes</span>
            </div>
            <div className="tt-stat-box scheduled">
              <span className="tt-stat-number">
                {classes.filter((c) => c.class_timing && c.class_day).length}
              </span>
              <span className="tt-stat-label">Scheduled</span>
            </div>
            <div className="tt-stat-box unscheduled">
              <span className="tt-stat-number">
                {classes.filter((c) => !c.class_timing || !c.class_day).length}
              </span>
              <span className="tt-stat-label">Not Scheduled</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Helper function to format time
function formatTime(time) {
  if (!time) return "N/A";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
