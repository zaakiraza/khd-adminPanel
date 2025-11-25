import { useState, useEffect } from "react";
import api from "../../../../utils/api";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./CreateExam.css";

export default function CreateExam() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showSuccess, showError } = useToast();
  
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  
  const [formData, setFormData] = useState({
    exam_name: "",
    class_id: "",
    exam_date: "",
    start_time: "",
    end_time: "",
    duration: "",
    total_marks: "100",
    passing_marks: "40",
  });

  useEffect(() => {
    console.log("CreateExam component mounted, fetching data...");
    fetchClasses();
    fetchExams();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const token = localStorage.getItem("token");
      console.log("Fetching classes from:", `${baseURL}/class/all?isActive=true`);
      const response = await api.get(`${baseURL}/class/all?isActive=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Classes response:", response.data);
      setClasses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      showError("Failed to fetch classes");
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.get(`${baseURL}/exam-schedule`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams(response.data.data || []);
    } catch (error) {
      showError("Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate time
    if (formData.start_time >= formData.end_time) {
      showError("End time must be after start time");
      return;
    }

    // Validate marks
    if (parseInt(formData.passing_marks) > parseInt(formData.total_marks)) {
      showError("Passing marks cannot be greater than total marks");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (editingExam) {
        await api.put(
          `${baseURL}/exam-schedule/${editingExam._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showSuccess("Exam updated successfully");
      } else {
        await api.post(`${baseURL}/exam-schedule`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showSuccess("Exam created successfully");
      }

      fetchExams();
      handleCloseModal();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to save exam");
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      exam_name: exam.exam_name,
      class_id: exam.class_id._id || exam.class_id,
      exam_date: exam.exam_date.split("T")[0],
      start_time: exam.start_time,
      end_time: exam.end_time,
      duration: exam.duration,
      total_marks: exam.total_marks,
      passing_marks: exam.passing_marks,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`${baseURL}/exam-schedule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess("Exam deleted successfully");
      fetchExams();
    } catch (error) {
      showError("Failed to delete exam");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExam(null);
    setFormData({
      exam_name: "",
      class_id: "",
      exam_date: "",
      start_time: "",
      end_time: "",
      duration: "",
      total_marks: "100",
      passing_marks: "40",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="create-exam-container">
      <div className="heading">
        <h1>
          <i className="fas fa-file-alt"></i> Create & Manage Exams
        </h1>
        <p className="subtitle">Create new exam schedules and manage existing ones</p>
      </div>

      <div className="toolbar">
        <button className="add-exam-btn" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus"></i> Create New Exam
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading exams...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-calendar-times"></i>
          <p>No exams created yet</p>
          <span>Click the button above to create your first exam</span>
        </div>
      ) : (
        <div className="exams-table-container">
          <table className="exams-table">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Marks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td>
                    <div className="exam-name-cell">
                      <i className="fas fa-graduation-cap"></i>
                      <span>{exam.exam_name}</span>
                    </div>
                  </td>
                  <td>{exam.class_id?.class_name || exam.class_name}</td>
                  <td>
                    <span className="subject-badge">{exam.subject}</span>
                  </td>
                  <td>
                    <div className="date-time-cell">
                      <div>{formatDate(exam.exam_date)}</div>
                      <small>
                        {formatTime(exam.start_time)} - {formatTime(exam.end_time)}
                      </small>
                    </div>
                  </td>
                  <td>{exam.duration} mins</td>
                  <td>
                    <div className="marks-cell">
                      <strong>{exam.total_marks}</strong>
                      <small>(Pass: {exam.passing_marks})</small>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${exam.status}`}>
                      {exam.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(exam)}
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(exam._id)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-calendar-plus"></i>
                {editingExam ? "Edit Exam" : "Create New Exam"}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Exam Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.exam_name}
                      onChange={(e) =>
                        setFormData({ ...formData, exam_name: e.target.value })
                      }
                      required
                      placeholder="e.g., Final Term Exam 2025"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Class <span className="required">*</span>
                    </label>
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
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Exam Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.exam_date}
                      onChange={(e) =>
                        setFormData({ ...formData, exam_date: e.target.value })
                      }
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Duration (minutes) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      required
                      min="1"
                      placeholder="e.g., 90"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      Start Time <span className="required">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      End Time <span className="required">*</span>
                    </label>
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
                    <label>
                      Total Marks <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.total_marks}
                      onChange={(e) =>
                        setFormData({ ...formData, total_marks: e.target.value })
                      }
                      required
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Passing Marks <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.passing_marks}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passing_marks: e.target.value,
                        })
                      }
                      required
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button type="submit" className="submit-btn">
                  <i className="fas fa-save"></i>
                  {editingExam ? "Update Exam" : "Create Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
