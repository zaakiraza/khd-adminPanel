import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./ExamSchedule.css";

export default function ExamSchedule() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showSuccess, showError, showWarning } = useToast();
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({
    class_id: "",
    status: "",
    exam_type: "",
  });

  const [formData, setFormData] = useState({
    exam_name: "",
    class_id: "",
    subject: "",
    exam_date: "",
    start_time: "",
    end_time: "",
    duration: "",
    total_marks: "100",
    passing_marks: "40",
    exam_type: "final",
  });

  useEffect(() => {
    // Auto-calculate duration when start_time and end_time change
    if (formData.start_time && formData.end_time) {
      const start = new Date(`1970-01-01T${formData.start_time}:00`);
      const end = new Date(`1970-01-01T${formData.end_time}:00`);
      const diffMs = end - start;
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins > 0) {
        setFormData(prev => ({ ...prev, duration: diffMins.toString() }));
      }
    }
  }, [formData.start_time, formData.end_time]);

  useEffect(() => {
    fetchClasses();
    fetchExams();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseURL}/class/all?isActive=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Classes fetched:", response.data.data);
      setClasses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      showError("Failed to fetch classes");
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filters.class_id) params.append("class_id", filters.class_id);
      if (filters.status) params.append("status", filters.status);
      if (filters.exam_type) params.append("exam_type", filters.exam_type);

      const response = await axios.get(
        `${baseURL}/exam-schedule?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExams(response.data.data || []);
    } catch (error) {
      showError("Failed to fetch exam schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (editingExam) {
        // Update exam
        await axios.put(
          `${baseURL}/exam-schedule/${editingExam._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showSuccess("Exam schedule updated successfully");
      } else {
        // Create new exam
        await axios.post(
          `${baseURL}/exam-schedule`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showSuccess("Exam schedule created successfully");
      }

      fetchExams();
      handleCloseModal();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to save exam schedule");
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      exam_name: exam.exam_name,
      class_id: exam.class_id._id || exam.class_id,
      subject: exam.subject,
      exam_date: exam.exam_date.split("T")[0],
      start_time: exam.start_time,
      end_time: exam.end_time,
      duration: exam.duration,
      total_marks: exam.total_marks,
      passing_marks: exam.passing_marks,
      exam_type: exam.exam_type,
    });
    setShowModal(true);
  };

  const handleManageQuestions = (exam) => {
    setSelectedExam(exam);
    setQuestions(exam.questions || []);
    setShowQuestionsModal(true);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question_text: "",
      question_type: "mcq",
      options: ["", "", "", ""],
      correct_answer: "",
      marks: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleUpdateOption = (qIndex, optIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSaveQuestions = async () => {
    try {
      const token = localStorage.getItem("token");

      // Calculate total marks from questions
      const calculatedTotalMarks = questions.reduce((sum, q) => sum + parseFloat(q.marks || 0), 0);

      // Calculate passing marks as half of total marks
      const calculatedPassingMarks = Math.floor(calculatedTotalMarks / 2);

      await axios.put(
        `${baseURL}/exam-schedule/${selectedExam._id}`,
        {
          questions,
          total_marks: calculatedTotalMarks,
          passing_marks: calculatedPassingMarks
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showSuccess(`Questions saved successfully. Total marks: ${calculatedTotalMarks}, Passing marks: ${calculatedPassingMarks}`);
      setShowQuestionsModal(false);
      fetchExams();
    } catch (error) {
      showError("Failed to save questions");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam schedule?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${baseURL}/exam-schedule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess("Exam schedule deleted successfully");
      fetchExams();
    } catch (error) {
      showError("Failed to delete exam schedule");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${baseURL}/exam-schedule/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showSuccess(`Exam status updated to ${newStatus}`);
      fetchExams();
    } catch (error) {
      showError("Failed to update exam status");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExam(null);
    setFormData({
      exam_name: "",
      class_id: "",
      subject: "",
      exam_date: "",
      start_time: "",
      end_time: "",
      duration: "",
      total_marks: "",
      passing_marks: "",
      exam_type: "final",
    });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchExams();
  };

  const resetFilters = () => {
    setFilters({
      class_id: "",
      status: "",
      exam_type: "",
    });
    setTimeout(() => fetchExams(), 100);
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

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      scheduled: "status-scheduled",
      ongoing: "status-ongoing",
      completed: "status-completed",
      cancelled: "status-cancelled",
    };
    return statusMap[status] || "";
  };

  const getExamTypeIcon = (type) => {
    const iconMap = {
      final: "fa-graduation-cap",
    };
    return iconMap[type] || "fa-graduation-cap";
  };

  const stats = {
    total: exams.length,
    scheduled: exams.filter((e) => e.status === "scheduled").length,
    ongoing: exams.filter((e) => e.status === "ongoing").length,
    completed: exams.filter((e) => e.status === "completed").length,
  };

  return (
    <div className="exam-schedule-container">
      {/* Header */}
      <div className="heading">
        <h1>
          <i className="fas fa-calendar-alt"></i> Exam Schedule Management
        </h1>
        <p className="subtitle">Create and manage examination schedules</p>
      </div>

      {/* Summary Stats */}
      <div className="summary-section">
        <div className="summary-card">
          <div className="stat-box total">
            <i className="fas fa-calendar-check"></i>
            <div className="stat-box-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Exams</div>
            </div>
          </div>
          <div className="stat-box scheduled">
            <i className="fas fa-clock"></i>
            <div className="stat-box-content">
              <div className="stat-number">{stats.scheduled}</div>
              <div className="stat-label">Scheduled</div>
            </div>
          </div>
          <div className="stat-box ongoing">
            <i className="fas fa-hourglass-half"></i>
            <div className="stat-box-content">
              <div className="stat-number">{stats.ongoing}</div>
              <div className="stat-label">Ongoing</div>
            </div>
          </div>
          <div className="stat-box completed">
            <i className="fas fa-check-circle"></i>
            <div className="stat-box-content">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="toolbar">
        <div className="filters-section">
          <div className="filter-group">
            <label>
              <i className="fas fa-chalkboard"></i> Class
            </label>
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
          </div>

          <div className="filter-group">
            <label>
              <i className="fas fa-info-circle"></i> Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <i className="fas fa-tag"></i> Exam Type
            </label>
            <select
              name="exam_type"
              value={filters.exam_type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="final">Final Term</option>
            </select>
          </div>

          <div className="btnss">

            <button className="filter-btn" onClick={applyFilters}>
              <i className="fas fa-search"></i> Apply
            </button>
            <button className="reset-btn" onClick={resetFilters}>
              <i className="fas fa-redo"></i> Reset
            </button>
          </div>
        </div>

        <button className="add-exam-btn" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus"></i> Add Exam Schedule
        </button>
      </div>

      {/* Exam List */}
      {loading ? (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading exam schedules...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-calendar-times"></i>
          <p>No exam schedules found</p>
          <span>Create your first exam schedule to get started</span>
        </div>
      ) : (
        <div className="exams-grid">
          {exams.map((exam) => (
            <div key={exam._id} className="exam-card">
              <div className="card-header">
                <div className="exam-title">
                  <h3>
                    <i className={`fas ${getExamTypeIcon(exam.exam_type)}`}></i>
                    {exam.exam_name}
                  </h3>
                  <span className="subject-badge">{exam.subject}</span>
                </div>
                <span className={`status-badge ${getStatusBadgeClass(exam.status)}`}>
                  {exam.status}
                </span>
              </div>

              <div className="exam-details">
                <div className="detail-row">
                  <i className="fas fa-chalkboard"></i>
                  <span className="label">Class:</span>
                  <span className="value">
                    {exam.class_id?.class_name || exam.class_name}
                  </span>
                </div>

                <div className="detail-row">
                  <i className="fas fa-calendar"></i>
                  <span className="label">Date:</span>
                  <span className="value">{formatDate(exam.exam_date)}</span>
                </div>

                <div className="detail-row">
                  <i className="fas fa-clock"></i>
                  <span className="label">Time:</span>
                  <span className="value">
                    {formatTime(exam.start_time)} - {formatTime(exam.end_time)}
                  </span>
                </div>

                <div className="detail-row">
                  <i className="fas fa-hourglass-half"></i>
                  <span className="label">Duration:</span>
                  <span className="value">{exam.duration} mins</span>
                </div>

                <div className="detail-row">
                  <i className="fas fa-star"></i>
                  <span className="label">Marks:</span>
                  <span className="value">
                    {exam.total_marks} (Pass: {exam.passing_marks})
                  </span>
                </div>

                <div className="detail-row">
                  <i className="fas fa-question-circle"></i>
                  <span className="label">Questions:</span>
                  <span className="value">
                    {exam.questions?.length || 0} questions
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="action-btn questions-btn"
                  onClick={() => handleManageQuestions(exam)}
                  title="Manage exam questions"
                >
                  <i className="fas fa-question-circle"></i> Questions
                </button>

                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEdit(exam)}
                >
                  <i className="fas fa-edit"></i> Edit
                </button>

                {exam.status === "scheduled" && (
                  <>
                    <button
                      className="action-btn ongoing-btn"
                      onClick={() => handleStatusUpdate(exam._id, "ongoing")}
                    >
                      <i className="fas fa-play"></i> Start
                    </button>
                    <button
                      className="action-btn cancel-btn"
                      onClick={() => handleStatusUpdate(exam._id, "cancelled")}
                    >
                      <i className="fas fa-ban"></i> Cancel
                    </button>
                  </>
                )}

                {exam.status === "ongoing" && (
                  <button
                    className="action-btn complete-btn"
                    onClick={() => handleStatusUpdate(exam._id, "completed")}
                  >
                    <i className="fas fa-check"></i> Complete
                  </button>
                )}

                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(exam._id)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Questions Modal */}
      {showQuestionsModal && (
        <div className="modal-overlay" onClick={() => setShowQuestionsModal(false)}>
          <div className="modal-content questions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-question-circle"></i>
                Manage Questions - {selectedExam?.exam_name}
              </h2>
              <button className="close-btn" onClick={() => setShowQuestionsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="questions-container">
              {questions.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-clipboard-list"></i>
                  <p>No questions added yet</p>
                  <span>Click "Add Question" to create your first question</span>
                </div>
              ) : (
                questions.map((q, qIndex) => (
                  <div key={q.id} className="question-card">
                    <div className="question-header">
                      <span className="question-number">Question {qIndex + 1}</span>
                      <button
                        className="delete-question-btn"
                        onClick={() => handleDeleteQuestion(qIndex)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>

                    <div className="form-group">
                      <label>Question Text</label>
                      <textarea
                        value={q.question_text}
                        onChange={(e) =>
                          handleUpdateQuestion(qIndex, "question_text", e.target.value)
                        }
                        placeholder="Enter your question here..."
                        rows="3"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Question Type</label>
                        <select
                          value={q.question_type}
                          onChange={(e) =>
                            handleUpdateQuestion(qIndex, "question_type", e.target.value)
                          }
                        >
                          <option value="mcq">Multiple Choice</option>
                          <option value="true_false">True/False</option>
                          <option value="short_answer">Short Answer</option>
                          <option value="essay">Essay</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Marks</label>
                        <input
                          type="number"
                          value={q.marks}
                          onChange={(e) =>
                            handleUpdateQuestion(qIndex, "marks", e.target.value)
                          }
                          min="1"
                        />
                      </div>
                    </div>

                    {q.question_type === "mcq" && (
                      <div className="options-section">
                        <label>Options</label>
                        {q.options.map((opt, optIndex) => (
                          <div key={optIndex} className="option-input">
                            <span className="option-label">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) =>
                                handleUpdateOption(qIndex, optIndex, e.target.value)
                              }
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                            />
                          </div>
                        ))}
                        <div className="form-group">
                          <label>Correct Answer</label>
                          <select
                            value={q.correct_answer}
                            onChange={(e) =>
                              handleUpdateQuestion(qIndex, "correct_answer", e.target.value)
                            }
                          >
                            <option value="">Select correct option</option>
                            {q.options.map((_, i) => (
                              <option key={i} value={String.fromCharCode(65 + i)}>
                                Option {String.fromCharCode(65 + i)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {q.question_type === "true_false" && (
                      <div className="form-group">
                        <label>Correct Answer</label>
                        <select
                          value={q.correct_answer}
                          onChange={(e) =>
                            handleUpdateQuestion(qIndex, "correct_answer", e.target.value)
                          }
                        >
                          <option value="">Select answer</option>
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="modal-actions">
              <button className="add-question-btn" onClick={handleAddQuestion}>
                <i className="fas fa-plus"></i> Add Question
              </button>
              <button className="save-questions-btn" onClick={handleSaveQuestions}>
                <i className="fas fa-save"></i> Save Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-calendar-plus"></i>
                {editingExam ? "Edit Exam Schedule" : "Add Exam Schedule"}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <i className="fas fa-heading"></i> Exam Name{" "}
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.exam_name}
                    onChange={(e) =>
                      setFormData({ ...formData, exam_name: e.target.value })
                    }
                    required
                    placeholder="e.g., Mid Term Exam 2025"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-chalkboard"></i> Class{" "}
                    <span className="required">*</span>
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
                    <i className="fas fa-book"></i> Subject{" "}
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                    placeholder="e.g., Mathematics"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-tag"></i> Exam Type{" "}
                    <span className="required">*</span>
                  </label>
                  <select
                    value={formData.exam_type}
                    onChange={(e) =>
                      setFormData({ ...formData, exam_type: e.target.value })
                    }
                    required
                  >
                    <option value="final">Final Term</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <i className="fas fa-calendar"></i> Exam Date{" "}
                    <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) =>
                      setFormData({ ...formData, exam_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-hourglass-half"></i> Duration (mins){" "}
                    <span style={{ color: "#666", fontWeight: "normal", fontSize: "0.85rem" }}>
                      (Auto-calculated)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    readOnly
                    style={{ background: "#f1f5f9", cursor: "not-allowed" }}
                    placeholder="Set start & end time"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <i className="fas fa-clock"></i> Start Time{" "}
                    <span className="required">*</span>
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
                    <i className="fas fa-clock"></i> End Time{" "}
                    <span className="required">*</span>
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
                    <i className="fas fa-trophy"></i> Total Marks{" "}
                    <span style={{ color: "#666", fontWeight: "normal", fontSize: "0.85rem" }}>
                      (Auto-calculated from questions)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={formData.total_marks}
                    readOnly
                    style={{ background: "#f1f5f9", cursor: "not-allowed" }}
                    placeholder="Add questions to calculate"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <i className="fas fa-check"></i> Passing Marks{" "}
                    <span style={{ color: "#666", fontWeight: "normal", fontSize: "0.85rem" }}>
                      (50% of total marks)
                    </span>
                  </label>
                  <input
                    type="number"
                    value={formData.passing_marks}
                    readOnly
                    style={{ background: "#f1f5f9", cursor: "not-allowed" }}
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  <i className="fas fa-save"></i>
                  {editingExam ? "Update Exam" : "Create Exam"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
