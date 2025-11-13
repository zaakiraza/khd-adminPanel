import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./Schedule.css";

export default function Schedule() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showError, showSuccess, showWarning } = useToast();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("weekly"); // weekly or list
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    class_timing: "",
    class_day: "",
  });

  // Only show days where you have classes
  const daysOfWeek = ["Friday", "Saturday"];

  const allDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch all active classes with schedules
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}/class/all?isActive=true`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 200) {
        // Only include classes with both day and time set
        const scheduledClasses = response.data.data.filter(
          (cls) => cls.class_day && cls.class_timing
        );
        setClasses(scheduledClasses);
      }
    } catch (e) {
      showError("Failed to fetch schedule");
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

  const formatTime = (time) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getClassesForDay = (day) => {
    return classes
      .filter((cls) => cls.class_day === day)
      .sort((a, b) => {
        // Sort by time
        const timeA = a.class_timing || "00:00";
        const timeB = b.class_timing || "00:00";
        return timeA.localeCompare(timeB);
      });
  };

  const groupClassesByTime = () => {
    const grouped = {};
    classes.forEach((cls) => {
      const time = cls.class_timing;
      if (!grouped[time]) {
        grouped[time] = [];
      }
      grouped[time].push(cls);
    });
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Create CSV content
    let csv = "Day,Class Name,Teacher,Time\n";
    daysOfWeek.forEach((day) => {
      const dayClasses = getClassesForDay(day);
      dayClasses.forEach((cls) => {
        csv += `${day},"${cls.class_name}","${cls.teacher_assigned || "N/A"}","${formatTime(cls.class_timing)}"\n`;
      });
    });

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "class-schedule.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleEditSchedule = (classData) => {
    setEditingClass(classData);
    setFormData({
      class_timing: classData.class_timing || "",
      class_day: classData.class_day || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingClass(null);
    setFormData({
      class_timing: "",
      class_day: "",
    });
  };

  const handleSaveSchedule = async () => {
    if (!formData.class_timing || !formData.class_day) {
      showWarning("Please select both timing and day");
      return;
    }

    try {
      const response = await axios.put(
        `${baseURL}/class/${editingClass._id}`,
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
        showSuccess("Schedule updated successfully");
        handleCancelEdit();
        fetchClasses();
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to update schedule");
    }
  };

  return (
    <section className="schedule-container">
      <div className="heading">
        <h1>Class Schedule</h1>
        <p className="subtitle">View weekly timetable for all active classes</p>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === "weekly" ? "active" : ""}`}
            onClick={() => setViewMode("weekly")}
          >
            <i className="fa-solid fa-calendar-week"></i> Weekly View
          </button>
          <button
            className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <i className="fa-solid fa-list"></i> List View
          </button>
        </div>

        <div className="action-buttons">
          <button className="action-btn print" onClick={handlePrint}>
            <i className="fa-solid fa-print"></i> Print
          </button>
          <button className="action-btn export" onClick={handleExport}>
            <i className="fa-solid fa-download"></i> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading schedule...</p>
        </div>
      ) : classes.length > 0 ? (
        <>
          {viewMode === "weekly" ? (
            // Weekly Calendar View
            <div className="weekly-view">
              {daysOfWeek.map((day) => {
                const dayClasses = getClassesForDay(day);
                return (
                  <div key={day} className="day-column">
                    <div className="day-header">
                      <h3>{day}</h3>
                      <span className="class-count">
                        {dayClasses.length}{" "}
                        {dayClasses.length === 1 ? "class" : "classes"}
                      </span>
                    </div>
                    <div className="day-classes">
                      {dayClasses.length > 0 ? (
                        dayClasses.map((cls) => (
                          <div key={cls._id} className="class-card">
                            {editingClass && editingClass._id === cls._id ? (
                              <div className="edit-form-inline">
                                <div className="form-group-inline">
                                  <label>Day:</label>
                                  <select
                                    value={formData.class_day}
                                    onChange={(e) =>
                                      setFormData({ ...formData, class_day: e.target.value })
                                    }
                                  >
                                    {allDays.map((d) => (
                                      <option key={d} value={d}>
                                        {d}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="form-group-inline">
                                  <label>Time:</label>
                                  <input
                                    type="time"
                                    value={formData.class_timing}
                                    onChange={(e) =>
                                      setFormData({ ...formData, class_timing: e.target.value })
                                    }
                                  />
                                </div>
                                <div className="inline-actions">
                                  <button
                                    className="save-inline-btn"
                                    onClick={handleSaveSchedule}
                                  >
                                    <i className="fa-solid fa-check"></i>
                                  </button>
                                  <button
                                    className="cancel-inline-btn"
                                    onClick={handleCancelEdit}
                                  >
                                    <i className="fa-solid fa-times"></i>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="card-header-inline">
                                  <div className="time-badge">
                                    <i className="fa-solid fa-clock"></i>
                                    {formatTime(cls.class_timing)}
                                  </div>
                                  <button
                                    className="edit-icon-btn"
                                    onClick={() => handleEditSchedule(cls)}
                                    title="Edit Schedule"
                                  >
                                    <i className="fa-solid fa-pen"></i>
                                  </button>
                                </div>
                                <h4>{cls.class_name}</h4>
                                {cls.teacher_assigned && (
                                  <p className="teacher">
                                    <i className="fa-solid fa-chalkboard-user"></i>
                                    {cls.teacher_assigned}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="no-classes">
                          <i className="fa-solid fa-calendar-xmark"></i>
                          <span>No classes</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View
            <div className="list-view">
              <div className="schedule-table-container">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Day</th>
                      <th>Class Name</th>
                      <th>Teacher</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupClassesByTime().map(([time, timeClasses]) =>
                      timeClasses.map((cls, idx) => (
                        <tr key={cls._id}>
                          {idx === 0 && (
                            <td
                              rowSpan={timeClasses.length}
                              className="time-cell"
                            >
                              <div className="time-display">
                                <i className="fa-solid fa-clock"></i>
                                {formatTime(time)}
                              </div>
                            </td>
                          )}
                          <td>
                            <span className="day-badge">{cls.class_day}</span>
                          </td>
                          <td>
                            <span className="class-name">{cls.class_name}</span>
                          </td>
                          <td>
                            {cls.teacher_assigned ? (
                              <span className="teacher-name">
                                <i className="fa-solid fa-chalkboard-user"></i>
                                {cls.teacher_assigned}
                              </span>
                            ) : (
                              <span className="not-assigned">Not Assigned</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="edit-table-btn"
                              onClick={() => handleEditSchedule(cls)}
                              title="Edit Schedule"
                            >
                              <i className="fa-solid fa-pen"></i> Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="statistics-card">
            <h3>
              <i className="fa-solid fa-chart-bar"></i> Schedule Statistics
            </h3>
            <div className="stats-grid">
              <div className="stat-item">
                <i className="fa-solid fa-school"></i>
                <div>
                  <span className="stat-value">{classes.length}</span>
                  <span className="stat-label">Total Scheduled Classes</span>
                </div>
              </div>
              <div className="stat-item">
                <i className="fa-solid fa-chalkboard-user"></i>
                <div>
                  <span className="stat-value">
                    {
                      new Set(
                        classes
                          .filter((c) => c.teacher_assigned)
                          .map((c) => c.teacher_assigned)
                      ).size
                    }
                  </span>
                  <span className="stat-label">Teachers Assigned</span>
                </div>
              </div>
              <div className="stat-item">
                <i className="fa-solid fa-calendar-check"></i>
                <div>
                  <span className="stat-value">
                    {daysOfWeek.filter((day) => getClassesForDay(day).length > 0).length}
                  </span>
                  <span className="stat-label">Active Days</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <i className="fa-solid fa-calendar-xmark"></i>
          <p>No scheduled classes found</p>
          <span>Please set schedules for your classes in the TimeTable section</span>
        </div>
      )}

      {/* Edit Modal */}
      {editingClass && viewMode === "list" && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fa-solid fa-pen"></i> Edit Schedule - {editingClass.class_name}
              </h2>
              <button className="close-btn" onClick={handleCancelEdit}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="edit-day">
                  <i className="fa-solid fa-calendar-days"></i> Class Day:
                </label>
                <select
                  id="edit-day"
                  value={formData.class_day}
                  onChange={(e) =>
                    setFormData({ ...formData, class_day: e.target.value })
                  }
                >
                  {allDays.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="edit-time">
                  <i className="fa-solid fa-clock"></i> Class Time:
                </label>
                <input
                  type="time"
                  id="edit-time"
                  value={formData.class_timing}
                  onChange={(e) =>
                    setFormData({ ...formData, class_timing: e.target.value })
                  }
                />
              </div>

              <div className="form-actions">
                <button
                  className="submit-btn"
                  onClick={handleSaveSchedule}
                >
                  <i className="fa-solid fa-check"></i> Save Changes
                </button>
                <button
                  className="cancel-btn"
                  onClick={handleCancelEdit}
                >
                  <i className="fa-solid fa-times"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
