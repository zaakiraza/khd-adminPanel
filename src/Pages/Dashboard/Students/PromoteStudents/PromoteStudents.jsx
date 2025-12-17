import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./PromoteStudents.css";

export default function PromoteStudents() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showError, showSuccess, showWarning } = useToast();
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [promotionYear, setPromotionYear] = useState(new Date().getFullYear().toString());
  const [promotionSession, setPromotionSession] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [tab, setTab] = useState("passed"); // "passed" or "failed"
  const navigate = useNavigate();

  // Class progression order
  const classOrder = [
    "Atfaal-Awal",
    "Atfaal-doam",
    "Awwal",
    "Doam",
    "Soam",
    "Chaharum",
  ];

  const getNextClass = (currentClass) => {
    const currentIndex = classOrder.indexOf(currentClass);
    if (currentIndex === -1 || currentIndex === classOrder.length - 1) {
      return null; // No next class
    }
    return classOrder[currentIndex + 1];
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear + 1, currentYear - 1];

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${baseURL}/class/all?isActive=true`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.status === 200) {
        setClasses(response.data.data || []);
      }
    } catch (e) {
      showError("Failed to fetch classes");
    }
  };

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${baseURL}/session/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.status === 200) {
        setSessions(response.data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch sessions:", e);
    }
  };

  // Fetch students by class and result status
  const fetchStudents = async () => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${baseURL}/users/by-class-result?class_name=${selectedClass}&result_status=${tab}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.status === 200) {
        setStudents(response.data.data || []);
      }
    } catch (e) {
      if (e.response?.status === 404) {
        setStudents([]);
      } else {
        showError("Failed to fetch students");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      setSelectedStudents([]);
      // Set default target class to next class
      const next = getNextClass(selectedClass);
      setTargetClass(next || "");
    } else {
      setTargetClass("");
    }
  }, [selectedClass, tab]);

  // Get available classes for promotion (classes after current class)
  const getAvailableClasses = () => {
    const currentIndex = classOrder.indexOf(selectedClass);
    if (currentIndex === -1) return classOrder;
    return classOrder.slice(currentIndex + 1);
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s._id));
    }
  };

  const handleSelectStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handlePromoteStudents = async () => {
    if (selectedStudents.length === 0) {
      showWarning("Please select at least one student to promote");
      return;
    }

    if (!targetClass) {
      showWarning("Please select a target class for promotion");
      return;
    }

    if (!promotionSession) {
      showWarning("Please select a session for promotion");
      return;
    }

    setPromoting(true);
    try {
      const response = await axios.post(
        `${baseURL}/users/promote-students`,
        {
          student_ids: selectedStudents,
          from_class: selectedClass,
          to_class: targetClass,
          year: promotionYear,
          session: promotionSession,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 200) {
        showSuccess(`Successfully promoted ${selectedStudents.length} student(s) to ${targetClass}!`);
        setSelectedStudents([]);
        fetchStudents();
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to promote students");
    } finally {
      setPromoting(false);
    }
  };

  const openEditModal = (student) => {
    setEditingStudent({
      ...student,
      newStatus: student.currentClassHistory?.status || "fail",
      newResult: student.currentClassHistory?.result || "Fail",
      repeatCount: (student.currentClassHistory?.repeat_count || 0) + 1,
    });
    setEditModalOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;

    try {
      const response = await axios.put(
        `${baseURL}/users/update-class-status/${editingStudent._id}`,
        {
          class_name: selectedClass,
          status: editingStudent.newStatus,
          result: editingStudent.newResult,
          repeat_count: editingStudent.repeatCount,
          isCompleted: editingStudent.newStatus === "pass",
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 200) {
        showSuccess("Student status updated successfully!");
        setEditModalOpen(false);
        setEditingStudent(null);
        fetchStudents();
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to update student");
    }
  };

  const handleMarkAsPassed = async (studentId) => {
    try {
      const response = await axios.put(
        `${baseURL}/users/update-class-status/${studentId}`,
        {
          class_name: selectedClass,
          status: "pass",
          result: "Pass",
          isCompleted: true,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 200) {
        showSuccess("Student marked as passed!");
        fetchStudents();
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to update student");
    }
  };

  const handleBulkMarkAsPassed = async () => {
    if (selectedStudents.length === 0) {
      showWarning("Please select at least one student");
      return;
    }

    try {
      const promises = selectedStudents.map((studentId) =>
        axios.put(
          `${baseURL}/users/update-class-status/${studentId}`,
          {
            class_name: selectedClass,
            status: "pass",
            result: "Pass",
            isCompleted: true,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        )
      );

      await Promise.all(promises);
      showSuccess(`Successfully marked ${selectedStudents.length} student(s) as passed!`);
      setSelectedStudents([]);
      fetchStudents();
    } catch (e) {
      showError(e.response?.data?.message || "Failed to update students");
    }
  };

  return (
    <section className="promote-container">
      <div className="heading">
        <h1>
          <i className="fa-solid fa-graduation-cap"></i> Promote Students
        </h1>
        <p className="subtitle">Promote passed students to next class or manage failed students</p>
      </div>

      {/* Class Selection */}
      <div className="selection-card">
        <div className="form-row">
          <div className="form-group">
            <label><i className="fa-solid fa-users"></i> Select Class</label>
            <select
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

          {selectedClass && (
            <>
              <div className="form-group">
                <label><i className="fa-solid fa-arrow-right"></i> Promote To</label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="promote-to-select"
                >
                  <option value="">-- Select Target Class --</option>
                  {getAvailableClasses().map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label><i className="fa-solid fa-calendar"></i> Year</label>
                <select
                  value={promotionYear}
                  onChange={(e) => setPromotionYear(e.target.value)}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label><i className="fa-solid fa-clock"></i> Session</label>
                <select
                  value={promotionSession}
                  onChange={(e) => setPromotionSession(e.target.value)}
                >
                  <option value="">-- Select Session --</option>
                  {sessions.map((session) => (
                    <option key={session._id} value={session.session_name}>
                      {session.session_name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {selectedClass && getAvailableClasses().length === 0 && (
            <div className="final-class-notice">
              <i className="fa-solid fa-flag-checkered"></i>
              <span>This is the final class. Students completing this class graduate!</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      {selectedClass && (
        <div className="tabs">
          <button
            className={`tab ${tab === "passed" ? "active" : ""}`}
            onClick={() => setTab("passed")}
          >
            <i className="fa-solid fa-check-circle"></i> Passed Students
          </button>
          <button
            className={`tab ${tab === "failed" ? "active" : ""}`}
            onClick={() => setTab("failed")}
          >
            <i className="fa-solid fa-times-circle"></i> Failed / In Progress
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {selectedClass && (
        <div className="summary-cards">
          <div className="summary-card total">
            <i className="fa-solid fa-users"></i>
            <div>
              <span className="number">{students.length}</span>
              <span className="label">{tab === "passed" ? "Passed" : "Failed/In Progress"}</span>
            </div>
          </div>
          <div className="summary-card selected">
            <i className="fa-solid fa-check-square"></i>
            <div>
              <span className="number">{selectedStudents.length}</span>
              <span className="label">Selected</span>
            </div>
          </div>
          {targetClass && tab === "passed" && (
            <div className="summary-card promote">
              <i className="fa-solid fa-arrow-up"></i>
              <div>
                <span className="number">{targetClass}</span>
                <span className="label">Target Class</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      {selectedClass && (
        <div className="action-bar">
          <button
            className="select-all-btn"
            onClick={handleSelectAll}
            disabled={students.length === 0}
          >
            {selectedStudents.length === students.length && students.length > 0 ? (
              <><i className="fa-solid fa-times"></i> Unselect All</>
            ) : (
              <><i className="fa-solid fa-check-double"></i> Select All</>
            )}
          </button>
          
          {tab === "passed" && (
            <button
              className="promote-btn"
              onClick={handlePromoteStudents}
              disabled={selectedStudents.length === 0 || promoting || !targetClass}
            >
              {promoting ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Promoting...</>
              ) : (
                <><i className="fa-solid fa-arrow-up"></i> Promote {selectedStudents.length} Student(s) {targetClass ? `to ${targetClass}` : ""}</>
              )}
            </button>
          )}
          
          {tab === "failed" && (
            <button
              className="bulk-pass-btn"
              onClick={handleBulkMarkAsPassed}
              disabled={selectedStudents.length === 0}
            >
              <i className="fa-solid fa-check-circle"></i> Mark {selectedStudents.length} as Passed
            </button>
          )}
        </div>
      )}

      {/* Students Table */}
      {loading ? (
        <div className="loading-state">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading students...</p>
        </div>
      ) : selectedClass && students.length > 0 ? (
        <div className="table-container">
          <table className="students-table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll} 
                    checked={selectedStudents.length === students.length && students.length > 0} 
                    title="Select All"
                  />
                </th>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Father Name</th>
                <th>Current Class</th>
                <th>Status</th>
                <th>Result</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} className={selectedStudents.includes(student._id) ? "selected" : ""}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => handleSelectStudent(student._id)}
                    />
                  </td>
                  <td>{student.personal_info?.rollNo}</td>
                  <td>
                    <strong>{student.personal_info?.first_name} {student.personal_info?.last_name}</strong>
                  </td>
                  <td>{student.personal_info?.father_name}</td>
                  <td>
                    <span className="class-badge">{student.personal_info?.enrolled_class}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${student.currentClassHistory?.status}`}>
                      {student.currentClassHistory?.status || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className={`result-badge ${student.currentClassHistory?.result?.toLowerCase()}`}>
                      {student.currentClassHistory?.result || "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {tab === "failed" && (
                        <>
                          <button
                            className="edit-btn"
                            onClick={() => openEditModal(student)}
                            title="Edit Status"
                          >
                            <i className="fa-solid fa-edit"></i>
                          </button>
                          <button
                            className="pass-btn"
                            onClick={() => handleMarkAsPassed(student._id)}
                            title="Mark as Passed"
                          >
                            <i className="fa-solid fa-check"></i>
                          </button>
                        </>
                      )}
                      {tab === "passed" && getAvailableClasses().length === 0 && (
                        <span className="graduated-badge">
                          <i className="fa-solid fa-trophy"></i> Graduating
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedClass ? (
        <div className="empty-state">
          <i className="fa-solid fa-inbox"></i>
          <p>No {tab === "passed" ? "passed" : "failed/in-progress"} students found in {selectedClass}</p>
        </div>
      ) : (
        <div className="empty-state">
          <i className="fa-solid fa-graduation-cap"></i>
          <p>Please select a class to view students</p>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && editingStudent && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-edit"></i> Edit Student Status
              </h3>
              <button className="close-btn" onClick={() => setEditModalOpen(false)}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="student-info">
                <p><strong>Student:</strong> {editingStudent.personal_info?.first_name} {editingStudent.personal_info?.last_name}</p>
                <p><strong>Roll No:</strong> {editingStudent.personal_info?.rollNo}</p>
                <p><strong>Class:</strong> {selectedClass}</p>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingStudent.newStatus}
                  onChange={(e) => setEditingStudent({ ...editingStudent, newStatus: e.target.value })}
                >
                  <option value="inprogress">In Progress</option>
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                  <option value="left">Left</option>
                </select>
              </div>

              <div className="form-group">
                <label>Result</label>
                <select
                  value={editingStudent.newResult}
                  onChange={(e) => setEditingStudent({ ...editingStudent, newResult: e.target.value })}
                >
                  <option value="">Pending</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
              </div>

              {editingStudent.newStatus === "fail" && (
                <div className="form-group">
                  <label>Repeat Count</label>
                  <input
                    type="number"
                    min="0"
                    value={editingStudent.repeatCount}
                    onChange={(e) => setEditingStudent({ ...editingStudent, repeatCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setEditModalOpen(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleUpdateStudent}>
                <i className="fa-solid fa-save"></i> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

