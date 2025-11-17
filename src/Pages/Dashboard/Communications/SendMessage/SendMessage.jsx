import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SendMessage.css";
import { useToast } from "../../../../Components/Common/Toast/ToastContext";

const baseURL = import.meta.env.VITE_BASEURL;

const SendMessage = () => {
  const [messages, setMessages] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [emailMatters, setEmailMatters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [filters, setFilters] = useState({ type: "", status: "" });
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    type: "email",
    recipients: {
      all: false,
      filters: {
        class_ids: [],
        session_ids: [],
        roles: [],
      },
      custom_emails: [],
      custom_phones: [],
    },
    subject: "",
    message: "",
    email_matter_id: "",
  });

  const [customInput, setCustomInput] = useState("");

  useEffect(() => {
    fetchMessages();
    fetchClasses();
    fetchSessions();
    fetchEmailMatters();
  }, [filters]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filters.type) params.append("type", filters.type);
      if (filters.status) params.append("status", filters.status);

      const response = await axios.get(`${baseURL}/message?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        setMessages(response.data.data);
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseURL}/class`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status) {
        setClasses(response.data.data.filter(c => c.isActive));
      }
    } catch (error) {
      console.error("Failed to fetch classes");
    }
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseURL}/session`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status) {
        setSessions(response.data.data.filter(s => s.isActive));
      }
    } catch (error) {
      console.error("Failed to fetch sessions");
    }
  };

  const fetchEmailMatters = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseURL}/email-matter?isActive=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status) {
        setEmailMatters(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch email matters");
    }
  };

  const handleSubmit = async (send = false) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${baseURL}/message`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.status) {
        const messageId = response.data.data._id;
        
        if (send) {
          const sendResponse = await axios.post(
            `${baseURL}/message/${messageId}/send`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (sendResponse.data.status) {
            showSuccess(sendResponse.data.message);
          }
        } else {
          showSuccess("Message saved as draft");
        }
        
        fetchMessages();
        handleCloseModal();
      }
    } catch (error) {
      showError(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (id) => {
    if (!window.confirm("Are you sure you want to send this message?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${baseURL}/message/${id}/send`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        showSuccess(response.data.message);
        fetchMessages();
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to send message");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${baseURL}/message/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        showSuccess("Message deleted successfully");
        fetchMessages();
      }
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete");
    }
  };

  const handleToggleClass = (classId) => {
    const currentClasses = formData.recipients.filters.class_ids;
    const newClasses = currentClasses.includes(classId)
      ? currentClasses.filter(id => id !== classId)
      : [...currentClasses, classId];
    
    setFormData({
      ...formData,
      recipients: {
        ...formData.recipients,
        filters: {
          ...formData.recipients.filters,
          class_ids: newClasses,
        },
      },
    });
  };

  const handleToggleSession = (sessionId) => {
    const currentSessions = formData.recipients.filters.session_ids;
    const newSessions = currentSessions.includes(sessionId)
      ? currentSessions.filter(id => id !== sessionId)
      : [...currentSessions, sessionId];
    
    setFormData({
      ...formData,
      recipients: {
        ...formData.recipients,
        filters: {
          ...formData.recipients.filters,
          session_ids: newSessions,
        },
      },
    });
  };

  const handleToggleRole = (role) => {
    const currentRoles = formData.recipients.filters.roles;
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    
    setFormData({
      ...formData,
      recipients: {
        ...formData.recipients,
        filters: {
          ...formData.recipients.filters,
          roles: newRoles,
        },
      },
    });
  };

  const handleAddCustomRecipient = () => {
    if (!customInput.trim()) return;

    const field = formData.type === "email" ? "custom_emails" : "custom_phones";
    
    setFormData({
      ...formData,
      recipients: {
        ...formData.recipients,
        [field]: [...formData.recipients[field], customInput.trim()],
      },
    });
    setCustomInput("");
  };

  const handleRemoveCustomRecipient = (index) => {
    const field = formData.type === "email" ? "custom_emails" : "custom_phones";
    const newList = formData.recipients[field].filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      recipients: {
        ...formData.recipients,
        [field]: newList,
      },
    });
  };

  const handleLoadEmailMatter = (matterId) => {
    const matter = emailMatters.find(m => m._id === matterId);
    if (matter) {
      setFormData({
        ...formData,
        subject: matter.subject,
        message: matter.body,
        email_matter_id: matterId,
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentStep(1);
    setFormData({
      type: "email",
      recipients: {
        all: false,
        filters: {
          class_ids: [],
          session_ids: [],
          roles: [],
        },
        custom_emails: [],
        custom_phones: [],
      },
      subject: "",
      message: "",
      email_matter_id: "",
    });
    setCustomInput("");
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: "#6c757d",
      sent: "#28a745",
      scheduled: "#007bff",
      failed: "#dc3545",
    };
    return (
      <span className="status-badge" style={{ backgroundColor: colors[status] }}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    return type === "email" ? (
      <span className="type-badge email">EMAIL</span>
    ) : (
      <span className="type-badge sms">SMS</span>
    );
  };

  return (
    <div className="send-message-container">
      <div className="send-message-header">
        <h1>Send Messages</h1>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + New Message
        </button>
      </div>

      <div className="filters-section">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="scheduled">Scheduled</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading && <div className="loading">Loading...</div>}

      <div className="messages-grid">
        {messages.map((msg) => (
          <div key={msg._id} className="message-card">
            <div className="card-header">
              <div className="badges">
                {getTypeBadge(msg.type)}
                {getStatusBadge(msg.status)}
              </div>
            </div>

            <div className="card-body">
              {msg.type === "email" && (
                <div className="subject">
                  <strong>Subject:</strong> {msg.subject}
                </div>
              )}
              <div className="message-preview">
                <strong>Message:</strong>
                <p>{msg.message.substring(0, 100)}...</p>
              </div>

              <div className="message-info">
                <div className="info-item">
                  <span className="label">Recipients:</span>
                  <span className="value">
                    {msg.recipients.all ? "All" : "Filtered"}
                  </span>
                </div>
                {msg.status === "sent" && (
                  <>
                    <div className="info-item">
                      <span className="label">Sent:</span>
                      <span className="value">{msg.sent_count}</span>
                    </div>
                    {msg.failed_count > 0 && (
                      <div className="info-item">
                        <span className="label">Failed:</span>
                        <span className="value">{msg.failed_count}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="card-actions">
              {msg.status === "draft" && (
                <button className="action-btn send-btn" onClick={() => handleSendMessage(msg._id)}>
                  Send
                </button>
              )}
              <button className="action-btn delete-btn" onClick={() => handleDelete(msg._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Message - Step {currentStep} of 2</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            {currentStep === 1 && (
              <div className="modal-body">
                <div className="form-group">
                  <label>Message Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                <div className="recipients-section">
                  <h3>Select Recipients</h3>
                  
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.recipients.all}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recipients: {
                              ...formData.recipients,
                              all: e.target.checked,
                            },
                          })
                        }
                      />
                      Send to All Users
                    </label>
                  </div>

                  {!formData.recipients.all && (
                    <>
                      <div className="filter-group">
                        <label>Filter by Classes</label>
                        <div className="checkbox-grid">
                          {classes.map((cls) => (
                            <label key={cls._id} className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={formData.recipients.filters.class_ids.includes(cls._id)}
                                onChange={() => handleToggleClass(cls._id)}
                              />
                              {cls.class_name}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="filter-group">
                        <label>Filter by Sessions</label>
                        <div className="checkbox-grid">
                          {sessions.map((session) => (
                            <label key={session._id} className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={formData.recipients.filters.session_ids.includes(session._id)}
                                onChange={() => handleToggleSession(session._id)}
                              />
                              {session.session_name}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="filter-group">
                        <label>Filter by Roles</label>
                        <div className="checkbox-grid">
                          {["student", "teacher", "admin"].map((role) => (
                            <label key={role} className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={formData.recipients.filters.roles.includes(role)}
                                onChange={() => handleToggleRole(role)}
                              />
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Add Custom {formData.type === "email" ? "Emails" : "Phone Numbers"}</label>
                        <div className="custom-input-group">
                          <input
                            type={formData.type === "email" ? "email" : "tel"}
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder={formData.type === "email" ? "email@example.com" : "+1234567890"}
                            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomRecipient())}
                          />
                          <button type="button" onClick={handleAddCustomRecipient}>
                            Add
                          </button>
                        </div>

                        {formData.recipients[formData.type === "email" ? "custom_emails" : "custom_phones"].length > 0 && (
                          <div className="custom-list">
                            {formData.recipients[formData.type === "email" ? "custom_emails" : "custom_phones"].map((item, i) => (
                              <div key={i} className="custom-item">
                                <span>{item}</span>
                                <button onClick={() => handleRemoveCustomRecipient(i)}>×</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="next-btn" onClick={() => setCurrentStep(2)}>
                    Next: Compose Message
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="modal-body">
                {formData.type === "email" && (
                  <>
                    <div className="form-group">
                      <label>Use Email Matter Template (Optional)</label>
                      <select
                        value={formData.email_matter_id}
                        onChange={(e) => handleLoadEmailMatter(e.target.value)}
                      >
                        <option value="">Select a template</option>
                        {emailMatters.map((matter) => (
                          <option key={matter._id} value={matter._id}>
                            {matter.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Subject *</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        placeholder="Email subject"
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows="8"
                    placeholder={formData.type === "email" ? "Email body content" : "SMS message content"}
                  />
                </div>

                <div className="modal-footer">
                  <button className="back-btn" onClick={() => setCurrentStep(1)}>
                    Back
                  </button>
                  <button className="save-btn" onClick={() => handleSubmit(false)} disabled={loading}>
                    Save as Draft
                  </button>
                  <button className="send-btn" onClick={() => handleSubmit(true)} disabled={loading}>
                    {loading ? "Sending..." : "Send Now"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SendMessage;
