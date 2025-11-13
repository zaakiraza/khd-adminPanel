import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./StudentAttendance.css";

export default function StudentAttendance() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showError, showSuccess, showWarning } = useToast();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Fetch active classes
  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${baseURL}/class/all?isActive=true`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 200) {
        const classesData = response.data.data;
        console.log("Classes fetched:", classesData);
        
        // Fetch student count for each class using users API
        const classesWithCounts = await Promise.all(
          classesData.map(async (cls) => {
            try {
              console.log(`Fetching students for class: ${cls.class_name}`);
              const studentsResponse = await axios.get(
                `${baseURL}/users/all?enrolled_class=${cls.class_name}&status=active&application_status=accepted&verified=true`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              console.log(`Students response for ${cls.class_name}:`, studentsResponse.data);
              const count = studentsResponse.data?.data?.users?.length || 0;
              console.log(`Student count for ${cls.class_name}: ${count}`);
              return {
                ...cls,
                actual_students_count: count
              };
            } catch (error) {
              console.log(`Error fetching students for ${cls.class_name}:`, error.response?.data || error.message);
              return {
                ...cls,
                actual_students_count: 0
              };
            }
          })
        );
        
        console.log("Classes with counts:", classesWithCounts);
        setClasses(classesWithCounts);
      }
    } catch (e) {
      showError("Failed to fetch classes");
      if (e.response && e.response.status === 403) {
        navigate("/");
      }
    }
  };

  // Fetch students by class
  const fetchStudents = async () => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${baseURL}/users/all?enrolled_class=${selectedClass}&status=active&application_status=accepted&verified=true&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setStudents(response.data.data.users);
        // Initialize attendance state
        const initialAttendance = {};
        response.data.data.users.forEach(student => {
          initialAttendance[student._id] = "present"; // Default to present
        });
        setAttendance(initialAttendance);
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        setStudents([]);
        showWarning("No students found in this class");
      } else {
        showError("Failed to fetch students");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSelectAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student._id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass) {
      showWarning("Please select a class");
      return;
    }

    if (!selectedDate) {
      showWarning("Please select a date");
      return;
    }

    if (students.length === 0) {
      showWarning("No students to mark attendance for");
      return;
    }

    setSaving(true);
    try {
      // Get class_id from the selected class
      const selectedClassData = classes.find(cls => cls.class_name === selectedClass);
      
      const attendanceData = {
        class_id: selectedClassData._id,
        class_name: selectedClass,
        date: selectedDate,
        attendance: Object.entries(attendance).map(([studentId, status]) => ({
          student_id: studentId,
          status: status
        }))
      };

      const response = await axios.post(
        `${baseURL}/attendance`,
        attendanceData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        showSuccess(response.data.message || "Attendance saved successfully!");
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="attendance-container">
      <div className="heading">
        <h1>Student Attendance</h1>
        <p className="subtitle">Mark daily attendance for active classes</p>
      </div>

      {/* Filters */}
      <div className="attendance-filters">
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
                {cls.class_name} ({cls.actual_students_count || 0} students)
              </option>
            ))}
          </select>
        </div>

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

        {selectedClass && (
          <div className="quick-actions">
            <button
              className="action-btn present-all"
              onClick={() => handleSelectAll("present")}
              disabled={students.length === 0}
            >
              <i className="fa-solid fa-check-circle"></i> Mark All Present
            </button>
            <button
              className="action-btn absent-all"
              onClick={() => handleSelectAll("absent")}
              disabled={students.length === 0}
            >
              <i className="fa-solid fa-times-circle"></i> Mark All Absent
            </button>
          </div>
        )}
      </div>

      {/* Info Card */}
      {selectedClass && (
        <div className="info-card">
          <div className="info-item">
            <i className="fa-solid fa-users"></i>
            <span>Total Students: <strong>{students.length}</strong></span>
          </div>
          <div className="info-item">
            <i className="fa-solid fa-check-circle"></i>
            <span>Present: <strong>{Object.values(attendance).filter(s => s === "present").length}</strong></span>
          </div>
          <div className="info-item">
            <i className="fa-solid fa-times-circle"></i>
            <span>Absent: <strong>{Object.values(attendance).filter(s => s === "absent").length}</strong></span>
          </div>
          <div className="info-item">
            <i className="fa-solid fa-clock"></i>
            <span>Late: <strong>{Object.values(attendance).filter(s => s === "late").length}</strong></span>
          </div>
        </div>
      )}

      {/* Student List */}
      {loading ? (
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading students...</p>
        </div>
      ) : selectedClass && students.length > 0 ? (
        <>
          <div className="attendance-table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Father Name</th>
                  <th>Class</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.personal_info.rollNo}</td>
                    <td>
                      <div className="student-name">
                        {/* <img
                          src={student.personal_info.img_URL}
                          alt={student.personal_info.first_name}
                          className="student-avatar"
                        /> */}
                        {student.personal_info.first_name} {student.personal_info.last_name}
                      </div>
                    </td>
                    <td>{student.personal_info.father_name}</td>
                    <td>
                      <span className="class-badge">{student.personal_info.enrolled_class}</span>
                    </td>
                    <td>
                      <div className="attendance-controls">
                        <button
                          className={`attendance-btn present ${attendance[student._id] === "present" ? "active" : ""}`}
                          onClick={() => handleAttendanceChange(student._id, "present")}
                          title="Present"
                        >
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button
                          className={`attendance-btn absent ${attendance[student._id] === "absent" ? "active" : ""}`}
                          onClick={() => handleAttendanceChange(student._id, "absent")}
                          title="Absent"
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                        <button
                          className={`attendance-btn late ${attendance[student._id] === "late" ? "active" : ""}`}
                          onClick={() => handleAttendanceChange(student._id, "late")}
                          title="Late"
                        >
                          <i className="fa-solid fa-clock"></i>
                        </button>
                        <button
                          className={`attendance-btn leave ${attendance[student._id] === "leave" ? "active" : ""}`}
                          onClick={() => handleAttendanceChange(student._id, "leave")}
                          title="On Leave"
                        >
                          <i className="fa-solid fa-umbrella"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="save-section">
            <button
              className="save-attendance-btn"
              onClick={handleSaveAttendance}
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-save"></i> Save Attendance
                </>
              )}
            </button>
          </div>
        </>
      ) : selectedClass ? (
        <div className="empty-state">
          <i className="fa-solid fa-inbox"></i>
          <p>No students found in this class</p>
        </div>
      ) : (
        <div className="empty-state">
          <i className="fa-solid fa-users"></i>
          <p>Please select a class to mark attendance</p>
        </div>
      )}
    </section>
  );
}
