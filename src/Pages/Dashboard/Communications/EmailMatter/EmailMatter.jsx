import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EmailMatter.css";
import { useToast } from "../../../../Components/Common/Toast/ToastContext";

const baseURL = import.meta.env.VITE_BASEURL;

const EmailMatter = () => {
  const [emailMatters, setEmailMatters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMatter, setEditingMatter] = useState(null);
  const [filters, setFilters] = useState({ type: "", isActive: "" });
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    type: "custom",
    variables: [],
  });

  const [variableInput, setVariableInput] = useState({ key: "", description: "" });

  useEffect(() => {
    fetchEmailMatters();
  }, [filters]);

  const fetchEmailMatters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.isActive) params.append("isActive", filters.isActive);

      const response = await axios.get(`${baseURL}/email-matter?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        setEmailMatters(response.data.data);
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to fetch email matters");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      if (editingMatter) {
        const response = await axios.put(
          `${baseURL}/email-matter/${editingMatter._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.status) {
          showSuccess("Email matter updated successfully");
          fetchEmailMatters();
        }
      } else {
        const response = await axios.post(
          `${baseURL}/email-matter`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.status) {
          showSuccess("Email matter created successfully");
          fetchEmailMatters();
        }
      }
      
      handleCloseModal();
    } catch (error) {
      showError(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (matter) => {
    setEditingMatter(matter);
    setFormData({
      name: matter.name,
      subject: matter.subject,
      body: matter.body,
      type: matter.type,
      variables: matter.variables || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this email matter?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${baseURL}/email-matter/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        showSuccess("Email matter deleted successfully");
        fetchEmailMatters();
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${baseURL}/email-matter/${id}/toggle-active`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        showSuccess("Status updated successfully");
        fetchEmailMatters();
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleAddVariable = () => {
    if (variableInput.key && variableInput.description) {
      setFormData({
        ...formData,
        variables: [...formData.variables, { ...variableInput }],
      });
      setVariableInput({ key: "", description: "" });
    }
  };

  const handleRemoveVariable = (index) => {
    const newVariables = formData.variables.filter((_, i) => i !== index);
    setFormData({ ...formData, variables: newVariables });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMatter(null);
    setFormData({
      name: "",
      subject: "",
      body: "",
      type: "custom",
      variables: [],
    });
    setVariableInput({ key: "", description: "" });
  };

  const getStatusBadge = (matter) => {
    return matter.isActive ? (
      <span className="status-badge active">ACTIVE</span>
    ) : (
      <span className="status-badge inactive">INACTIVE</span>
    );
  };

  const getTypeBadge = (type) => {
    const colors = {
      otp: "#007bff",
      welcome: "#28a745",
      notification: "#ffc107",
      announcement: "#17a2b8",
      reminder: "#fd7e14",
      custom: "#6c757d",
    };
    return (
      <span className="type-badge" style={{ backgroundColor: colors[type] }}>
        {type.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="email-matter-container">
      <div className="email-matter-header">
        <h1>Email Matters</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add Email Matter
        </button>
      </div>

      <div className="filters-section">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="otp">OTP</option>
          <option value="welcome">Welcome</option>
          <option value="notification">Notification</option>
          <option value="announcement">Announcement</option>
          <option value="reminder">Reminder</option>
          <option value="custom">Custom</option>
        </select>

        <select
          value={filters.isActive}
          onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {loading && <div className="loading">Loading...</div>}

      <div className="matters-grid">
        {emailMatters.map((matter) => (
          <div key={matter._id} className="matter-card">
            <div className="card-header">
              <h3>{matter.name}</h3>
              <div className="badges">
                {getTypeBadge(matter.type)}
                {getStatusBadge(matter)}
              </div>
            </div>

            <div className="card-body">
              <div className="subject">
                <strong>Subject:</strong> {matter.subject}
              </div>
              <div className="body-preview">
                <strong>Body:</strong>
                <p>{matter.body.substring(0, 150)}...</p>
              </div>

              {matter.variables?.length > 0 && (
                <div className="variables">
                  <strong>Variables:</strong>
                  <div className="variable-tags">
                    {matter.variables.map((v, i) => (
                      <span key={i} className="variable-tag">
                        {v.key}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card-actions">
              <button className="action-btn edit-btn" onClick={() => handleEdit(matter)}>
                Edit
              </button>
              <button
                className={`action-btn toggle-btn ${matter.isActive ? "deactivate" : "activate"}`}
                onClick={() => handleToggleActive(matter._id)}
              >
                {matter.isActive ? "Deactivate" : "Activate"}
              </button>
              <button className="action-btn delete-btn" onClick={() => handleDelete(matter._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMatter ? "Edit Email Matter" : "Add Email Matter"}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., OTP Email, Welcome Email"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="custom">Custom</option>
                    <option value="otp">OTP</option>
                    <option value="welcome">Welcome</option>
                    <option value="notification">Notification</option>
                    <option value="announcement">Announcement</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  placeholder="Email subject line"
                />
              </div>

              <div className="form-group">
                <label>Body *</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  required
                  rows="6"
                  placeholder="Email body content. Use {{variable_name}} for dynamic values."
                />
              </div>

              <div className="form-group">
                <label>Variables</label>
                <div className="variable-input-group">
                  <input
                    type="text"
                    placeholder="Variable key (e.g., name, otp)"
                    value={variableInput.key}
                    onChange={(e) =>
                      setVariableInput({ ...variableInput, key: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={variableInput.description}
                    onChange={(e) =>
                      setVariableInput({ ...variableInput, description: e.target.value })
                    }
                  />
                  <button type="button" className="add-variable-btn" onClick={handleAddVariable}>
                    Add
                  </button>
                </div>

                {formData.variables.length > 0 && (
                  <div className="variables-list">
                    {formData.variables.map((v, i) => (
                      <div key={i} className="variable-item">
                        <span>
                          <strong>{v.key}:</strong> {v.description}
                        </span>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => handleRemoveVariable(i)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Saving..." : editingMatter ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailMatter;
