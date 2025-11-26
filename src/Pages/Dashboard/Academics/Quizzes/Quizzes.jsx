import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./Quizzes.css";

export default function Quizzes() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showSuccess, showError, showWarning } = useToast();
  
  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Basic Info, 2: Questions
  
  const [filters, setFilters] = useState({
    class_id: "",
    status: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    class_id: "",
    subject: "",
    description: "",
    quiz_date: "",
    start_time: "",
    end_time: "",
    duration: "30",
    passing_marks: "40",
    questions: [],
    status: "draft",
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: "",
    question_type: "multiple_choice",
    options: [
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ],
    correct_answer: "",
    marks: "1",
  });

  useEffect(() => {
    fetchClasses();
    fetchQuizzes();
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

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filters.class_id) params.append("class_id", filters.class_id);
      if (filters.status) params.append("status", filters.status);

      const response = await axios.get(
        `${baseURL}/quiz?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setQuizzes(response.data.data || []);
    } catch (error) {
      showError("Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.questions.length === 0) {
      showWarning("Please add at least one question");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (editingQuiz) {
        await axios.put(
          `${baseURL}/quiz/${editingQuiz._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showSuccess("Quiz updated successfully");
      } else {
        await axios.post(
          `${baseURL}/quiz`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showSuccess("Quiz created successfully");
      }

      fetchQuizzes();
      handleCloseModal();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to save quiz");
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question_text) {
      showWarning("Please enter question text");
      return;
    }

    if (currentQuestion.question_type === "multiple_choice") {
      const hasCorrect = currentQuestion.options.some(opt => opt.is_correct);
      if (!hasCorrect) {
        showWarning("Please select at least one correct answer");
        return;
      }
    } else if (currentQuestion.question_type === "true_false") {
      if (!currentQuestion.correct_answer) {
        showWarning("Please select the correct answer");
        return;
      }
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, { ...currentQuestion }],
    });

    // Reset current question
    setCurrentQuestion({
      question_text: "",
      question_type: "multiple_choice",
      options: [
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ],
      correct_answer: "",
      marks: "1",
    });

    showSuccess("Question added successfully");
  };

  const removeQuestion = (index) => {
    const updated = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updated });
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      class_id: quiz.class_id._id || quiz.class_id,
      subject: quiz.subject,
      description: quiz.description,
      quiz_date: quiz.quiz_date.split("T")[0],
      start_time: quiz.start_time,
      end_time: quiz.end_time || "",
      duration: quiz.duration,
      passing_marks: quiz.passing_marks,
      status: quiz.status || "draft",
      questions: [],
    });
    // Load existing questions into the questions array for display in Step 2
    if (quiz.questions && quiz.questions.length > 0) {
      const loadedQuestions = quiz.questions.map(q => ({
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options || [],
        correct_answer: q.correct_answer || "",
        marks: q.marks,
      }));
      setFormData(prev => ({ ...prev, questions: loadedQuestions }));
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quiz?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${baseURL}/quiz/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess("Quiz deleted successfully");
      fetchQuizzes();
    } catch (error) {
      showError("Failed to delete quiz");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${baseURL}/quiz/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showSuccess(`Quiz status updated to ${newStatus}`);
      fetchQuizzes();
    } catch (error) {
      showError("Failed to update quiz status");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuiz(null);
    setCurrentStep(1);
    setFormData({
      title: "",
      class_id: "",
      subject: "",
      description: "",
      quiz_date: "",
      start_time: "",
      end_time: "",
      duration: "30",
      passing_marks: "40",
      questions: [],
      status: "draft",
    });
    setCurrentQuestion({
      question_text: "",
      question_type: "multiple_choice",
      options: [
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ],
      correct_answer: "",
      marks: "1",
    });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    fetchQuizzes();
  };

  const resetFilters = () => {
    setFilters({
      class_id: "",
      status: "",
    });
    setTimeout(() => fetchQuizzes(), 100);
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
        return "#28a745";
      case "close":
        return "#6c757d";
      case "draft":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  const totalQuizzes = quizzes.length;
  const publishedQuizzes = quizzes.filter(q => q.status === "published").length;
  const draftQuizzes = quizzes.filter(q => q.status === "draft").length;
  const totalMarks = formData.questions.reduce((sum, q) => sum + parseInt(q.marks || 0), 0);

  return (
    <div className="quizzes-container">
      <div className="quizzes-header">
        <h1>Quizzes Management</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Create Quiz
        </button>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card">
          <h3>{totalQuizzes}</h3>
          <p>Total Quizzes</p>
        </div>
        <div className="stat-card">
          <h3>{publishedQuizzes}</h3>
          <p>Published</p>
        </div>
        <div className="stat-card">
          <h3>{draftQuizzes}</h3>
          <p>Drafts</p>
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
            <option value="close">Close</option>
          </select>

          <button className="filter-btn" onClick={applyFilters}>
            Apply Filters
          </button>
          <button className="reset-btn" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      {/* Quizzes Grid */}
      {loading ? (
        <div className="loading">Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="no-data">No quizzes found</div>
      ) : (
        <div className="quizzes-grid">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <div className="card-header">
                <h3>{quiz.title}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(quiz.status) }}
                >
                  {quiz.status}
                </span>
              </div>

              <div className="card-body">
                <p className="class-name">{quiz.class_name}</p>
                <p className="subject">Subject: {quiz.subject}</p>
                <p className="description">{quiz.description}</p>
                
                <div className="quiz-info">
                  <div className="info-item">
                    <span className="label">Date:</span>
                    <span className="value">{formatDate(quiz.quiz_date)}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Time:</span>
                    <span className="value">{quiz.start_time}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Duration:</span>
                    <span className="value">{quiz.duration} mins</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Questions:</span>
                    <span className="value">{quiz.questions?.length || 0}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Total Marks:</span>
                    <span className="value">{quiz.total_marks}</span>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                {quiz.status === "draft" && (
                  <button
                    className="action-btn publish-btn"
                    onClick={() => handleStatusUpdate(quiz._id, "published")}
                  >
                    Publish
                  </button>
                )}
                {quiz.status === "published" && (
                  <>
                    <button
                      className="action-btn unpublish-btn"
                      onClick={() => handleStatusUpdate(quiz._id, "draft")}
                    >
                      Unpublish
                    </button>
                    <button
                      className="action-btn start-btn"
                      onClick={() => handleStatusUpdate(quiz._id, "ongoing")}
                    >
                      Start
                    </button>
                  </>
                )}
                {quiz.status === "ongoing" && (
                  <button
                    className="action-btn complete-btn"
                    onClick={() => handleStatusUpdate(quiz._id, "close")}
                  >
                    Close
                  </button>
                )}
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEdit(quiz)}
                >
                  Edit
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(quiz._id)}
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
              <h2>{editingQuiz ? "Edit Quiz" : "Create Quiz"}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            {/* Step Indicator */}
            <div className="steps-indicator">
              <div className={`step ${currentStep === 1 ? "active" : ""}`}>
                <span>1</span>
                <p>Basic Info</p>
              </div>
              <div className={`step ${currentStep === 2 ? "active" : ""}`}>
                <span>2</span>
                <p>Questions</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="step-content">
                  <div className="form-group">
                    <label>Quiz Title *</label>
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
                      rows="3"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Quiz Date *</label>
                      <input
                        type="date"
                        value={formData.quiz_date}
                        onChange={(e) =>
                          setFormData({ ...formData, quiz_date: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Start Time *</label>
                      <input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => {
                          const newStartTime = e.target.value;
                          setFormData({ ...formData, start_time: newStartTime });
                          // Auto-calculate duration if end_time exists
                          if (formData.end_time && newStartTime) {
                            const start = new Date(`2000-01-01T${newStartTime}`);
                            const end = new Date(`2000-01-01T${formData.end_time}`);
                            const diffMinutes = Math.round((end - start) / 60000);
                            if (diffMinutes > 0) {
                              setFormData(prev => ({ ...prev, start_time: newStartTime, duration: diffMinutes.toString() }));
                            }
                          }
                        }}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>End Time *</label>
                      <input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => {
                          const newEndTime = e.target.value;
                          setFormData({ ...formData, end_time: newEndTime });
                          // Auto-calculate duration if start_time exists
                          if (formData.start_time && newEndTime) {
                            const start = new Date(`2000-01-01T${formData.start_time}`);
                            const end = new Date(`2000-01-01T${newEndTime}`);
                            const diffMinutes = Math.round((end - start) / 60000);
                            if (diffMinutes > 0) {
                              setFormData(prev => ({ ...prev, end_time: newEndTime, duration: diffMinutes.toString() }));
                            }
                          }
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Duration (minutes) *</label>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        min="5"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Passing Marks *</label>
                      <input
                        type="number"
                        value={formData.passing_marks}
                        onChange={(e) =>
                          setFormData({ ...formData, passing_marks: e.target.value })
                        }
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Status *</label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        required
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-actions">\n                    <button type="button" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="button" className="next-btn" onClick={() => setCurrentStep(2)}>
                      Next: Add Questions →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Questions */}
              {currentStep === 2 && (
                <div className="step-content">
                  <div className="questions-summary">
                    <h3>Questions Added: {formData.questions.length}</h3>
                    <p>Total Marks: {totalMarks}</p>
                  </div>

                  {/* Added Questions List */}
                  {formData.questions.length > 0 && (
                    <div className="added-questions">
                      <h4>Added Questions</h4>
                      {formData.questions.map((q, index) => (
                        <div key={index} className="question-item">
                          <div className="question-header">
                            <span className="question-number">Q{index + 1}</span>
                            <span className="question-type">{q.question_type}</span>
                            <span className="question-marks">{q.marks} marks</span>
                            <button
                              type="button"
                              className="remove-question"
                              onClick={() => removeQuestion(index)}
                            >
                              ×
                            </button>
                          </div>
                          <p className="question-text">{q.question_text}</p>
                          {q.options && q.options.length > 0 && (
                            <div className="question-options">
                              {q.options.map((opt, i) => (
                                <div
                                  key={i}
                                  className={`option ${opt.is_correct ? "correct" : ""}`}
                                >
                                  {opt.option_text} {opt.is_correct && "✓"}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Question Form */}
                  <div className="add-question-form">
                    <h4>Add New Question</h4>
                    
                    <div className="form-group">
                      <label>Question Type *</label>
                      <select
                        value={currentQuestion.question_type}
                        onChange={(e) =>
                          setCurrentQuestion({ ...currentQuestion, question_type: e.target.value })
                        }
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                        <option value="essay">Essay</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Question Text *</label>
                      <textarea
                        value={currentQuestion.question_text}
                        onChange={(e) =>
                          setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })
                        }
                        rows="2"
                      />
                    </div>

                    {currentQuestion.question_type === "multiple_choice" && (
                      <div className="options-section">
                        <label>Options *</label>
                        {currentQuestion.options.map((opt, idx) => (
                          <div key={idx} className="option-row">
                            <input
                              type="text"
                              placeholder={`Option ${idx + 1}`}
                              value={opt.option_text}
                              onChange={(e) => {
                                const updated = [...currentQuestion.options];
                                updated[idx].option_text = e.target.value;
                                setCurrentQuestion({ ...currentQuestion, options: updated });
                              }}
                            />
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={opt.is_correct}
                                onChange={(e) => {
                                  const updated = [...currentQuestion.options];
                                  updated[idx].is_correct = e.target.checked;
                                  setCurrentQuestion({ ...currentQuestion, options: updated });
                                }}
                              />
                              Correct
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentQuestion.question_type === "true_false" && (
                      <div className="form-group">
                        <label>Correct Answer *</label>
                        <select
                          value={currentQuestion.correct_answer}
                          onChange={(e) =>
                            setCurrentQuestion({ ...currentQuestion, correct_answer: e.target.value })
                          }
                        >
                          <option value="">Select Answer</option>
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      </div>
                    )}

                    <div className="form-group">
                      <label>Marks *</label>
                      <input
                        type="number"
                        value={currentQuestion.marks}
                        onChange={(e) =>
                          setCurrentQuestion({ ...currentQuestion, marks: e.target.value })
                        }
                        min="1"
                      />
                    </div>

                    <button type="button" className="add-question-btn" onClick={addQuestion}>
                      + Add Question
                    </button>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => setCurrentStep(1)}>
                      ← Back
                    </button>
                    <button type="submit" className="submit-btn">
                      {editingQuiz ? "Update" : "Create"} Quiz
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
