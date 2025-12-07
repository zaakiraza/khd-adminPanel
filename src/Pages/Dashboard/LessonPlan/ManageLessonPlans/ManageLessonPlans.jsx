import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageLessonPlans.css";
import {useToast} from "../../../../components/common/Toast/ToastContext";

export default function ManageLessonPlans() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const { showSuccess, showError } = useToast();

  const [lessonPlans, setLessonPlans] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [filters, setFilters] = useState({
    class_id: "",
    status: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    class_id: "",
    subject: "",
    week_number: "",
    year: new Date().getFullYear(),
    file_url: "",
    file_name: "",
    status: "draft",
  });

  useEffect(() => {
    fetchClasses();
    fetchLessonPlans();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${baseURL}/class/all?isActive=true`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setClasses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchLessonPlans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.class_id) params.append("class_id", filters.class_id);
      if (filters.status) params.append("status", filters.status);

      const response = await axios.get(`${baseURL}/lesson-plan?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLessonPlans(response.data.data || []);
    } catch (error) {
      showError("Failed to fetch lesson plans");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!allowedTypes.includes(file.type)) {
      showError("Please upload only PDF or PowerPoint files");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showError("File size must be less than 10MB");
      return;
    }

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', cloudinaryCloudName);
      formDataUpload.append('folder', 'khd/lesson-plans');

      // Use raw/upload endpoint for documents (PDF, PPT, PPTX)
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryUploadPreset}/raw/upload`,
        formDataUpload
      );

      setFormData({
        ...formData,
        file_url: response.data.secure_url,
        file_name: file.name
      });

      showSuccess("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error.response?.data || error);
      showError(error.response?.data?.error?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFormData({
      ...formData,
      file_url: "",
      file_name: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (editingPlan) {
        await axios.put(`${baseURL}/lesson-plan/${editingPlan._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showSuccess("Lesson plan updated successfully");
      } else {
        await axios.post(`${baseURL}/lesson-plan`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showSuccess("Lesson plan created successfully");
      }
      handleCloseModal();
      fetchLessonPlans();
    } catch (error) {
      showError(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lesson plan?")) return;
    try {
      await axios.delete(`${baseURL}/lesson-plan/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      showSuccess("Lesson plan deleted successfully");
      fetchLessonPlans();
    } catch (error) {
      showError("Failed to delete lesson plan");
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      class_id: plan.class_id,
      subject: plan.subject,
      week_number: plan.week_number,
      year: plan.year,
      file_url: plan.file_url || "",
      file_name: plan.file_name || "",
      status: plan.status,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFormData({
      title: "",
      description: "",
      class_id: "",
      subject: "",
      week_number: "",
      year: new Date().getFullYear(),
      file_url: "",
      file_name: "",
      status: "draft",
    });
  };

  return (
    <div className="manage-lesson-plans-container">
      <div className="heading">
        <h1><i className="fas fa-book-open"></i> Manage Lesson Plans</h1>
        <p className="subtitle">Create and organize weekly lesson plans for classes</p>
      </div>

      <div className="toolbar">
        <div className="filters-section">
          <div className="filter-group">
            <label>Class:</label>
            <select
              value={filters.class_id}
              onChange={(e) => setFilters({ ...filters, class_id: e.target.value })}
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>{cls.class_name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <button className="action-btn edit-btn" onClick={fetchLessonPlans}>
            <i className="fas fa-search"></i> Filter
          </button>
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <i className="fas fa-plus"></i> Create Lesson Plan
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading lesson plans...</p>
        </div>
      ) : lessonPlans.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-folder-open"></i>
          <p>No lesson plans found</p>
        </div>
      ) : (
        <div className="lesson-plans-grid">
          {lessonPlans.map((plan) => (
            <div key={plan._id} className="lesson-card">
              <div className="card-header">
                <div className="lesson-title">
                  <h3>{plan.title}</h3>
                  <span className="subject-badge">{plan.subject}</span>
                </div>
                <span className={`status-badge ${plan.status}`}>{plan.status}</span>
              </div>
              <div className="card-content">
                <div className="info-row">
                  <i className="fas fa-chalkboard"></i>
                  <span>{plan.class_name}</span>
                </div>
                <div className="info-row">
                  <i className="fas fa-calendar-week"></i>
                  <span>Week {plan.week_number}, {plan.year}</span>
                </div>
                {plan.file_url && (
                  <div className="info-row">
                    <i className="fas fa-file-pdf"></i>
                    <a href={plan.file_url} target="_blank" rel="noopener noreferrer" className="file-link">
                      {plan.file_name || "View File"}
                    </a>
                  </div>
                )}
                <p className="description-preview">{plan.description}</p>
              </div>
              <div className="card-actions">
                <button className="action-btn edit-btn" onClick={() => handleEdit(plan)}>
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(plan._id)}>
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlan ? "Edit Lesson Plan" : "Create Lesson Plan"}</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Subject *</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Class *</label>
                    <select
                      value={formData.class_id}
                      onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Week Number *</label>
                    <input
                      type="number"
                      value={formData.week_number}
                      onChange={(e) => setFormData({ ...formData, week_number: e.target.value })}
                      required
                      min="1"
                      max="52"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Brief summary of the lesson plan..."
                  />
                </div>

                <div className="form-group">
                  <label>Upload Lesson File (PDF or PPT) *</label>
                  <div className="file-upload-container">
                    {formData.file_url ? (
                      <div className="uploaded-file">
                        <div className="file-info">
                          <i className="fas fa-file-pdf"></i>
                          <span>{formData.file_name}</span>
                          <a href={formData.file_url} target="_blank" rel="noopener noreferrer" className="view-link">
                            <i className="fas fa-external-link-alt"></i> View
                          </a>
                        </div>
                        <button type="button" className="remove-file-btn" onClick={handleRemoveFile}>
                          <i className="fas fa-times"></i> Remove
                        </button>
                      </div>
                    ) : (
                      <div className="file-upload-input">
                        <input
                          type="file"
                          id="lessonFile"
                          accept=".pdf,.ppt,.pptx"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          required={!editingPlan}
                        />
                        <label htmlFor="lessonFile" className="file-upload-label">
                          {uploading ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i> Uploading...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-cloud-upload-alt"></i> Choose File (PDF or PPT)
                            </>
                          )}
                        </label>
                        <p className="file-hint">Maximum file size: 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="submit-btn">Save Lesson Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
