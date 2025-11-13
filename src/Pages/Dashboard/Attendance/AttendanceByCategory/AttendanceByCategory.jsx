import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./AttendanceByCategory.css";

export default function AttendanceByCategory() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showError, showSuccess, showWarning } = useToast();
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("single"); // single or range
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Fetch all active classes
  const fetchClasses = async () => {
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
    }
  };

  // Fetch attendance by class and date
  const fetchAttendanceByDate = async () => {
    if (!selectedClass || !selectedDate) {
      showWarning("Please select a class and date");
      return;
    }

    setLoading(true);
    try {
      const classData = classes.find(cls => cls.class_name === selectedClass);
      const response = await axios.get(
        `${baseURL}/attendance/class/date?class_id=${classData._id}&date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setAttendanceData(response.data.data);
        setAttendanceRecords([response.data.data]);
        calculateStatistics([response.data.data]);
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        showWarning("No attendance record found for this date");
        setAttendanceData(null);
        setAttendanceRecords([]);
        setStatistics(null);
      } else {
        showError(e.response?.data?.message || "Failed to fetch attendance");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance by class and date range
  const fetchAttendanceByRange = async () => {
    if (!selectedClass || !startDate || !endDate) {
      showWarning("Please select a class and date range");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showWarning("Start date must be before end date");
      return;
    }

    setLoading(true);
    try {
      const classData = classes.find(cls => cls.class_name === selectedClass);
      const response = await axios.get(
        `${baseURL}/attendance/class?class_id=${classData._id}&start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setAttendanceRecords(response.data.data);
        setAttendanceData(null);
        calculateStatistics(response.data.data);
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        showWarning("No attendance records found for this date range");
        setAttendanceRecords([]);
        setStatistics(null);
      } else {
        showError(e.response?.data?.message || "Failed to fetch attendance");
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall statistics
  const calculateStatistics = (records) => {
    if (!records || records.length === 0) {
      setStatistics(null);
      return;
    }

    const stats = {
      total_days: records.length,
      total_present: records.reduce((sum, r) => sum + r.total_present, 0),
      total_absent: records.reduce((sum, r) => sum + r.total_absent, 0),
      total_late: records.reduce((sum, r) => sum + r.total_late, 0),
      total_leave: records.reduce((sum, r) => sum + r.total_leave, 0),
      avg_present: 0,
      avg_absent: 0,
      attendance_percentage: 0,
    };

    stats.avg_present = (stats.total_present / records.length).toFixed(1);
    stats.avg_absent = (stats.total_absent / records.length).toFixed(1);
    
    const totalMarked = stats.total_present + stats.total_absent + stats.total_late + stats.total_leave;
    stats.attendance_percentage = totalMarked > 0 
      ? ((stats.total_present / totalMarked) * 100).toFixed(1)
      : 0;

    setStatistics(stats);
  };

  const handleSearch = () => {
    if (filterType === "single") {
      fetchAttendanceByDate();
    } else {
      fetchAttendanceByRange();
    }
  };

  const handleReset = () => {
    setSelectedClass("");
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setStartDate("");
    setEndDate("");
    setAttendanceData(null);
    setAttendanceRecords([]);
    setStatistics(null);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section className="attendance-category-container">
      <div className="heading">
        <h1>Attendance By Category</h1>
        <p className="subtitle">View attendance records with advanced filters</p>
      </div>

      {/* Filter Section */}
      <div className="filter-card">
        <div className="filter-type-toggle">
          <button
            className={`toggle-btn ${filterType === "single" ? "active" : ""}`}
            onClick={() => setFilterType("single")}
          >
            <i className="fa-solid fa-calendar-day"></i> Single Date
          </button>
          <button
            className={`toggle-btn ${filterType === "range" ? "active" : ""}`}
            onClick={() => setFilterType("range")}
          >
            <i className="fa-solid fa-calendar-week"></i> Date Range
          </button>
        </div>

        <div className="filter-inputs">
          {/* Class Selection */}
          <div className="filter-group">
            <label htmlFor="class-select">
              <i className="fa-solid fa-users"></i> Select Class:
            </label>
            <select
              id="class-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">-- Select Class --</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls.class_name}>
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filters */}
          {filterType === "single" ? (
            <div className="filter-group">
              <label htmlFor="date-select">
                <i className="fa-solid fa-calendar"></i> Date:
              </label>
              <input
                type="date"
                id="date-select"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          ) : (
            <>
              <div className="filter-group">
                <label htmlFor="start-date">
                  <i className="fa-solid fa-calendar-check"></i> Start Date:
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="filter-group">
                <label htmlFor="end-date">
                  <i className="fa-solid fa-calendar-xmark"></i> End Date:
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="filter-actions">
            <button
              className="search-btn"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Searching...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-search"></i> Search
                </>
              )}
            </button>
            <button className="reset-btn" onClick={handleReset}>
              <i className="fa-solid fa-rotate-right"></i> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Card */}
      {statistics && (
        <div className="statistics-card">
          <h3>
            <i className="fa-solid fa-chart-pie"></i> Overall Statistics
          </h3>
          <div className="stats-grid">
            <div className="stat-item">
              <i className="fa-solid fa-calendar-days"></i>
              <div>
                <span className="stat-label">Total Days</span>
                <span className="stat-value">{statistics.total_days}</span>
              </div>
            </div>
            <div className="stat-item success">
              <i className="fa-solid fa-check-circle"></i>
              <div>
                <span className="stat-label">Total Present</span>
                <span className="stat-value">{statistics.total_present}</span>
              </div>
            </div>
            <div className="stat-item danger">
              <i className="fa-solid fa-times-circle"></i>
              <div>
                <span className="stat-label">Total Absent</span>
                <span className="stat-value">{statistics.total_absent}</span>
              </div>
            </div>
            <div className="stat-item warning">
              <i className="fa-solid fa-clock"></i>
              <div>
                <span className="stat-label">Total Late</span>
                <span className="stat-value">{statistics.total_late}</span>
              </div>
            </div>
            <div className="stat-item info">
              <i className="fa-solid fa-umbrella"></i>
              <div>
                <span className="stat-label">Total Leave</span>
                <span className="stat-value">{statistics.total_leave}</span>
              </div>
            </div>
            <div className="stat-item primary">
              <i className="fa-solid fa-percent"></i>
              <div>
                <span className="stat-label">Attendance Rate</span>
                <span className="stat-value">{statistics.attendance_percentage}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {loading ? (
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading attendance data...</p>
        </div>
      ) : attendanceRecords.length > 0 ? (
        <div className="results-section">
          <h3>
            <i className="fa-solid fa-clipboard-list"></i> Attendance Records
            <span className="record-count">({attendanceRecords.length} {attendanceRecords.length === 1 ? 'record' : 'records'})</span>
          </h3>

          {attendanceRecords.map((record, index) => (
            <div key={record._id} className="attendance-record-card">
              <div className="record-header">
                <div className="record-info">
                  <h4>
                    <i className="fa-solid fa-calendar-day"></i> {formatDate(record.date)}
                  </h4>
                  <span className="class-badge">{record.class_name}</span>
                </div>
                <div className="record-summary">
                  <span className="summary-item present">
                    <i className="fa-solid fa-check"></i> {record.total_present}
                  </span>
                  <span className="summary-item absent">
                    <i className="fa-solid fa-times"></i> {record.total_absent}
                  </span>
                  <span className="summary-item late">
                    <i className="fa-solid fa-clock"></i> {record.total_late}
                  </span>
                  <span className="summary-item leave">
                    <i className="fa-solid fa-umbrella"></i> {record.total_leave}
                  </span>
                </div>
              </div>

              <div className="students-table-container">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Status</th>
                      <th>Marked At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.attendance_records.map((student) => (
                      <tr key={student.student_id}>
                        <td>{student.roll_no || "N/A"}</td>
                        <td>{student.student_name}</td>
                        <td>
                          <span className={`status-badge ${student.status}`}>
                            {student.status === "present" && <i className="fa-solid fa-check"></i>}
                            {student.status === "absent" && <i className="fa-solid fa-times"></i>}
                            {student.status === "late" && <i className="fa-solid fa-clock"></i>}
                            {student.status === "leave" && <i className="fa-solid fa-umbrella"></i>}
                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                          </span>
                        </td>
                        <td>{new Date(student.marked_at).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <i className="fa-solid fa-inbox"></i>
          <p>No attendance records found</p>
          <span>Use filters above to search for attendance data</span>
        </div>
      )}
    </section>
  );
}
