import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EmailMatter.css";
import { useToast } from "../../../../components/common/Toast/ToastContext"
import TemplateSelector from "./Templates/TemplateSelector";

const baseURL = import.meta.env.VITE_BASEURL;

const EmailMatter = () => {
  const [emailMatters, setEmailMatters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMatter, setEditingMatter] = useState(null);
  const [filters, setFilters] = useState({ type: "", isActive: "", search: "" });
  const [activeTab, setActiveTab] = useState('templates');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [sortBy, setSortBy] = useState({ field: 'createdAt', order: 'desc' });
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
  }, [filters, pagination.page, pagination.limit, sortBy]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [filters.search, filters.type, filters.isActive]);

  const fetchEmailMatters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.isActive) params.append("isActive", filters.isActive);
      if (filters.search) params.append("search", filters.search);
      params.append("page", pagination.page);
      params.append("limit", pagination.limit);
      params.append("sortBy", sortBy.field);
      params.append("sortOrder", sortBy.order);

      const response = await axios.get(`${baseURL}/email-matter?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        setEmailMatters(response.data.data.emailMatters || response.data.data);
        if (response.data.data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.data.data.pagination.total
          }));
        }
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

  const handleDuplicate = (matter) => {
    setFormData({
      name: `${matter.name} (Copy)`,
      subject: matter.subject,
      body: matter.body,
      type: matter.type,
      variables: [...(matter.variables || [])],
    });
    setShowModal(true);
  };

  const handleBulkDelete = async () => {
    const selectedIds = emailMatters
      .filter(matter => matter.selected)
      .map(matter => matter._id);
    
    if (selectedIds.length === 0) {
      showError("Please select email matters to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected email matters?`)) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${baseURL}/email-matter/bulk`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids: selectedIds }
      });

      if (response.data.status) {
        showSuccess(`${selectedIds.length} email matters deleted successfully`);
        fetchEmailMatters();
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to bulk delete");
    }
  };

  const toggleSelectAll = () => {
    const allSelected = emailMatters.every(matter => matter.selected);
    const updatedMatters = emailMatters.map(matter => ({
      ...matter,
      selected: !allSelected
    }));
    setEmailMatters(updatedMatters);
  };

  const toggleSelectMatter = (id) => {
    const updatedMatters = emailMatters.map(matter => 
      matter._id === id ? { ...matter, selected: !matter.selected } : matter
    );
    setEmailMatters(updatedMatters);
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
        <h1>Email Communications</h1>
        <div className="header-actions">
          <button className="add-btn" onClick={() => setShowModal(true)}>
            + Add Email Matter
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <i className="fas fa-envelope"></i> Email Templates
        </button>
        <button 
          className={`tab-btn ${activeTab === 'matters' ? 'active' : ''}`}
          onClick={() => setActiveTab('matters')}
        >
          <i className="fas fa-clipboard-list"></i> Email Matters
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'templates' ? (
        <TemplateSelector />
      ) : (
        <>
          <div className="filters-section">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search email matters..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            
            <div className="filter-controls">
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

              <select
                value={`${sortBy.field}-${sortBy.order}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy({ field, order });
                }}
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="type-asc">Type A-Z</option>
              </select>
            </div>

            <div className="bulk-actions">
              <button className="bulk-btn" onClick={toggleSelectAll}>
                <i className="fas fa-check-square"></i> Select All
              </button>
              <button 
                className="bulk-btn delete-bulk" 
                onClick={handleBulkDelete}
                disabled={!emailMatters.some(matter => matter.selected)}
              >
                <i className="fas fa-trash"></i> Delete Selected
              </button>
            </div>
          </div>

          {loading && <div className="loading">Loading...</div>}

          <div className="matters-grid">
            {emailMatters.length > 0 ? emailMatters.map((matter) => (
              <div key={matter._id} className={`matter-card ${matter.selected ? 'selected' : ''}`}>
                <div className="card-header">
                  <div className="card-title-section">
                    <input
                      type="checkbox"
                      checked={matter.selected || false}
                      onChange={() => toggleSelectMatter(matter._id)}
                      className="matter-checkbox"
                    />
                    <h3>{matter.name}</h3>
                  </div>
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
                  <button className="action-btn view-btn" title="View Details">
                    <i className="fas fa-eye"></i>
                  </button>
                  <button className="action-btn edit-btn" onClick={() => handleEdit(matter)} title="Edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="action-btn duplicate-btn" onClick={() => handleDuplicate(matter)} title="Duplicate">
                    <i className="fas fa-copy"></i>
                  </button>
                  <button
                    className={`action-btn toggle-btn ${matter.isActive ? "deactivate" : "activate"}`}
                    onClick={() => handleToggleActive(matter._id)}
                    title={matter.isActive ? "Deactivate" : "Activate"}
                  >
                    <i className={`fas ${matter.isActive ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                  </button>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(matter._id)} title="Delete">
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            )) : (
              <div className="empty-state">
                <div className="empty-icon"><i className="fas fa-edit"></i></div>
                <h3>No Email Matters Found</h3>
                <p>Create your first email matter to get started with email communications.</p>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                  + Create Email Matter
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>
              
              <div className="pagination-info">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                <span className="total-count">({pagination.total} total)</span>
              </div>
              
              <button
                className="pagination-btn"
                onClick={() => setPagination(prev => ({ 
                  ...prev, 
                  page: Math.min(Math.ceil(pagination.total / pagination.limit), prev.page + 1) 
                }))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}

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
