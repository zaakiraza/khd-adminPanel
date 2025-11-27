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
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("single"); // single or range
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, absent3, leaves, absent1
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: "",
    message: "",
  });

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
      const classData = classes.find((cls) => cls.class_name === selectedClass);
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
        setFilteredRecords([response.data.data]);
        calculateStatistics([response.data.data]);
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        showWarning("No attendance record found for this date");
        setAttendanceData(null);
        setAttendanceRecords([]);
        setFilteredRecords([]);
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
      const classData = classes.find((cls) => cls.class_name === selectedClass);
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
        setFilteredRecords(response.data.data);
        calculateStatistics(response.data.data);
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        showWarning("No attendance records found for this date range");
        setAttendanceRecords([]);
        setFilteredRecords([]);
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

    const totalMarked =
      stats.total_present +
      stats.total_absent +
      stats.total_late +
      stats.total_leave;
    stats.attendance_percentage =
      totalMarked > 0
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
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setStartDate("");
    setEndDate("");
    setAttendanceData(null);
    setAttendanceRecords([]);
    setFilteredRecords([]);
    setStatistics(null);
    setSelectedFilter("all");
  };

  // Apply student filter based on selected criteria
  const applyStudentFilter = (filterType) => {
    setSelectedFilter(filterType);

    if (filterType === "all") {
      setFilteredRecords(attendanceRecords);
      calculateStatistics(attendanceRecords);
      return;
    }

    const filtered = attendanceRecords.map((record) => {
      let filteredStudents = [];

      if (filterType === "absent1") {
        // Students who were absent in this specific class
        filteredStudents = record.attendance_records.filter(
          (student) => student.status === "absent"
        );
      } else if (filterType === "leaves") {
        // Students who were on leave
        filteredStudents = record.attendance_records.filter(
          (student) => student.status === "leave"
        );
      } else if (filterType === "absent3") {
        // Students who were absent in last 3 consecutive classes
        // This requires checking across multiple records
        const studentAbsenceCount = {};

        // Count absences for each student across all records (sorted by date)
        const sortedRecords = [...attendanceRecords].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        sortedRecords.forEach((rec) => {
          rec.attendance_records.forEach((student) => {
            if (!studentAbsenceCount[student.student_id]) {
              studentAbsenceCount[student.student_id] = {
                name: student.student_name,
                roll_no: student.roll_no,
                absences: [],
              };
            }
            studentAbsenceCount[student.student_id].absences.push({
              date: rec.date,
              status: student.status,
            });
          });
        });

        // Find students with 3 consecutive absences
        const studentsWithThreeAbsences = Object.keys(
          studentAbsenceCount
        ).filter((studentId) => {
          const absences = studentAbsenceCount[studentId].absences;
          let consecutiveAbsent = 0;

          for (let i = 0; i < absences.length; i++) {
            if (absences[i].status === "absent") {
              consecutiveAbsent++;
              if (consecutiveAbsent >= 3) {
                return true;
              }
            } else {
              consecutiveAbsent = 0;
            }
          }
          return false;
        });

        // Filter students from current record who have 3 consecutive absences
        filteredStudents = record.attendance_records.filter((student) =>
          studentsWithThreeAbsences.includes(student.student_id)
        );
      }

      return {
        ...record,
        attendance_records: filteredStudents,
        total_present: filteredStudents.filter((s) => s.status === "present")
          .length,
        total_absent: filteredStudents.filter((s) => s.status === "absent")
          .length,
        total_late: filteredStudents.filter((s) => s.status === "late").length,
        total_leave: filteredStudents.filter((s) => s.status === "leave")
          .length,
      };
    });

    setFilteredRecords(filtered);
    calculateStatistics(filtered);
  };

  // Get unique students from filtered records
  const getFilteredStudents = () => {
    const studentMap = new Map();

    filteredRecords.forEach((record) => {
      record.attendance_records.forEach((student) => {
        if (!studentMap.has(student.student_id)) {
          studentMap.set(student.student_id, {
            student_id: student.student_id,
            student_name: student.student_name,
            roll_no: student.roll_no,
          });
        }
      });
    });

    return Array.from(studentMap.values());
  };

  // Open email modal with pre-filled data
  const handleOpenEmailModal = () => {
    const students = getFilteredStudents();

    if (students.length === 0) {
      showWarning("No students to send email to");
      return;
    }

    // Pre-fill email data based on filter type
    let subject = "";
    let message = "";

    switch (selectedFilter) {
      case "absent1":
        subject = "Attendance Notice - Absence Recorded";
        message = `Dear Student/Guardian,\n\nThis is to inform you that attendance records show absence(s) for the selected class period(s).\n\nClass: ${selectedClass}\nDate Range: ${
          filterType === "single" ? selectedDate : `${startDate} to ${endDate}`
        }\n\nPlease contact the administration if you have any questions.\n\nBest Regards,\nKhuddam Learning Management`;
        break;

      case "leaves":
        subject = "Leave Record Notification";
        message = `Dear Student/Guardian,\n\nThis is a notification regarding leave record(s) for the selected period.\n\nClass: ${selectedClass}\nDate Range: ${
          filterType === "single" ? selectedDate : `${startDate} to ${endDate}`
        }\n\nIf you have any questions, please contact the administration.\n\nBest Regards,\nKhuddam Learning Management`;
        break;

      case "absent3":
        subject = "URGENT: Multiple Absences Recorded";
        message = `Dear Student/Guardian,\n\nThis is an URGENT notice regarding multiple consecutive absences recorded in our system.\n\nClass: ${selectedClass}\nDate Range: ${
          filterType === "single" ? selectedDate : `${startDate} to ${endDate}`
        }\n\nMultiple absences may affect academic progress. Please contact the administration immediately to discuss this matter.\n\nBest Regards,\nKhuddam Learning Management`;
        break;

      default:
        subject = "Attendance Update";
        message = `Dear Student/Guardian,\n\nThis is a notification regarding attendance records.\n\nClass: ${selectedClass}\nDate Range: ${
          filterType === "single" ? selectedDate : `${startDate} to ${endDate}`
        }\n\nPlease review your attendance records and contact us if you have any questions.\n\nBest Regards,\nKhuddam Learning Management`;
    }

    setEmailData({ subject, message });
    setShowEmailModal(true);
  };

  // Send email to filtered students
  const handleSendEmail = async () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      showWarning("Please fill in both subject and message");
      return;
    }

    const students = getFilteredStudents();
    const studentIds = students.map((s) => s.student_id);

    setSendingEmail(true);
    setShowEmailModal(false);

    try {
      let successCount = 0;
      let failedCount = 0;

      // Send emails individually to each student
      for (const studentId of studentIds) {
        try {
          // Get student email
          const studentResponse = await axios.get(
            `${baseURL}/users/single/${studentId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          const studentEmail = studentResponse.data.data?.personal_info?.email;

          if (studentEmail) {
            // Create and send message
            const messagePayload = {
              type: "email",
              recipients: {
                all: false,
                custom_emails: [studentEmail],
                filters: {},
              },
              subject: emailData.subject,
              message: emailData.message,
            };

            const createResponse = await axios.post(
              `${baseURL}/message`,
              messagePayload,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );

            if (createResponse.status === 201) {
              const messageId = createResponse.data.data._id;

              // Send the message
              await axios.post(
                `${baseURL}/message/${messageId}/send`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              successCount++;
            }
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(`Failed to send email to student ${studentId}:`, error);
          failedCount++;
        }
      }

      if (successCount > 0) {
        showSuccess(
          `Email sent successfully to ${successCount} student${
            successCount !== 1 ? "s" : ""
          }${failedCount > 0 ? `. Failed: ${failedCount}` : ""}`
        );
      } else {
        showError("Failed to send emails to students");
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to send email");
      console.error("Email sending error:", e);
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section className="attendance-category-container">
      <div className="heading">
        <h1>Attendance By Category</h1>
        <p className="subtitle">
          View attendance records with advanced filters
        </p>
      </div>

      {/* Filter Section */}
      <div className="filter-card">
        <div className="filter-type-toggle">
          <button
            className={`toggle-btn ${
              filterType === "single" ? "active" : "inactive"
            }`}
            onClick={() => setFilterType("single")}
          >
            <i className="fa-solid fa-calendar-day"></i> Single Date
          </button>
          <button
            className={`toggle-btn ${
              filterType === "range" ? "active" : "inactive"
            }`}
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
                max={new Date().toISOString().split("T")[0]}
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
                  max={new Date().toISOString().split("T")[0]}
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
                  max={new Date().toISOString().split("T")[0]}
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
                <span className="stat-value">
                  {statistics.attendance_percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Filter Section */}
      {attendanceRecords.length > 0 && (
        <div className="student-filter-card">
          <div className="filter-header">
            <h3>
              <i className="fa-solid fa-filter"></i> Filter Students
            </h3>
            {selectedFilter !== "all" && filteredRecords.length > 0 && (
              <button
                className="email-btn"
                onClick={handleOpenEmailModal}
                disabled={sendingEmail}
              >
                {sendingEmail ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Sending...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-envelope"></i> Email{" "}
                    {getFilteredStudents().length} Student
                    {getFilteredStudents().length !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            )}
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-badge ${
                selectedFilter === "all" ? "active" : ""
              }`}
              onClick={() => applyStudentFilter("all")}
            >
              <i className="fa-solid fa-users"></i> All Students
            </button>
            <button
              className={`filter-badge ${
                selectedFilter === "absent1" ? "active" : ""
              }`}
              onClick={() => applyStudentFilter("absent1")}
            >
              <i className="fa-solid fa-times-circle"></i> Absent in Class
            </button>
            <button
              className={`filter-badge ${
                selectedFilter === "leaves" ? "active" : ""
              }`}
              onClick={() => applyStudentFilter("leaves")}
            >
              <i className="fa-solid fa-umbrella"></i> On Leave
            </button>
            <button
              className={`filter-badge ${
                selectedFilter === "absent3" ? "active" : ""
              }`}
              onClick={() => applyStudentFilter("absent3")}
            >
              <i className="fa-solid fa-exclamation-triangle"></i> Absent 3+
              Times
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {loading ? (
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading attendance data...</p>
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="results-section">
          <h3>
            <i className="fa-solid fa-clipboard-list"></i> Attendance Records
            <span className="record-count">
              ({filteredRecords.length}{" "}
              {filteredRecords.length === 1 ? "record" : "records"})
            </span>
          </h3>

          {filteredRecords.map((record, index) => (
            <div key={record._id} className="attendance-record-card">
              <div className="record-header">
                <div className="record-info">
                  <h4>
                    <i className="fa-solid fa-calendar-day"></i>{" "}
                    {formatDate(record.date)}
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
                    <i className="fa-solid fa-umbrella"></i>{" "}
                    {record.total_leave}
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
                            {student.status === "present" && (
                              <i className="fa-solid fa-check"></i>
                            )}
                            {student.status === "absent" && (
                              <i className="fa-solid fa-times"></i>
                            )}
                            {student.status === "late" && (
                              <i className="fa-solid fa-clock"></i>
                            )}
                            {student.status === "leave" && (
                              <i className="fa-solid fa-umbrella"></i>
                            )}
                            {student.status.charAt(0).toUpperCase() +
                              student.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {new Date(student.marked_at).toLocaleTimeString()}
                        </td>
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

      {/* Email Modal */}
      {showEmailModal && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fa-solid fa-envelope"></i> Compose Email
              </h2>
              <button
                className="modal-close-btn"
                onClick={() => setShowEmailModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="recipient-info">
                <i className="fa-solid fa-users"></i>
                <span>
                  Sending to {getFilteredStudents().length} student
                  {getFilteredStudents().length !== 1 ? "s" : ""}:{" "}
                  {getFilteredStudents()
                    .slice(0, 3)
                    .map((s) => s.student_name)
                    .join(", ")}
                  {getFilteredStudents().length > 3 &&
                    ` and ${getFilteredStudents().length - 3} more`}
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="email-subject">
                  <i className="fa-solid fa-heading"></i> Subject *
                </label>
                <input
                  type="text"
                  id="email-subject"
                  className="form-input"
                  value={emailData.subject}
                  onChange={(e) =>
                    setEmailData({ ...emailData, subject: e.target.value })
                  }
                  placeholder="Enter email subject"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email-message">
                  <i className="fa-solid fa-message"></i> Message *
                </label>
                <textarea
                  id="email-message"
                  className="form-textarea"
                  rows="10"
                  value={emailData.message}
                  onChange={(e) =>
                    setEmailData({ ...emailData, message: e.target.value })
                  }
                  placeholder="Enter email message"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowEmailModal(false)}
              >
                <i className="fa-solid fa-times"></i> Cancel
              </button>
              <button className="send-btn" onClick={handleSendEmail}>
                <i className="fa-solid fa-paper-plane"></i> Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
