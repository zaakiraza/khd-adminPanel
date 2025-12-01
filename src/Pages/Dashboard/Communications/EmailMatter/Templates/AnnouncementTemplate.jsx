import React, { useState } from "react";
import "./EmailTemplate.css";

const AnnouncementTemplate = () => {
  const [formData, setFormData] = useState({
    title: "{{title}}",
    message: "{{message}}",
    actionText: "{{actionText}}",
    actionUrl: "{{actionUrl}}",
    className: "{{className}}",
    date: "{{date}}"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = () => {
    const template = getEmailHTML();
    navigator.clipboard.writeText(template);
    alert("Template copied to clipboard!");
  };

  const getEmailHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Important Announcement</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #293c5d 0%, #4a5f8f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">📢</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Important Announcement</h1>
      <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Khuddam Learning - ${formData.className}</p>
    </div>
    
    <!-- Main Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <!-- Date Badge -->
      <div style="text-align: center; margin-bottom: 25px;">
        <span style="background: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block;">
          📅 ${formData.date}
        </span>
      </div>
      
      <!-- Title -->
      <h2 style="color: #293c5d; text-align: center; margin: 0 0 25px 0; font-size: 24px; line-height: 1.3;">
        ${formData.title}
      </h2>
      
      <!-- Message Content -->
      <div style="background: #f8fafc; border-left: 4px solid #293c5d; padding: 25px; border-radius: 0 8px 8px 0; margin: 25px 0;">
        <div style="color: #374151; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">
          ${formData.message}
        </div>
      </div>
      
      <!-- Action Button (if provided) -->
      ${formData.actionText && formData.actionUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${formData.actionUrl}" 
           style="background: linear-gradient(135deg, #293c5d 0%, #4a5f8f 100%); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 25px; 
                  font-weight: bold; 
                  font-size: 16px; 
                  display: inline-block;
                  box-shadow: 0 4px 15px rgba(41, 60, 93, 0.3);">
          ${formData.actionText}
        </a>
      </div>
      ` : ''}
      
      <!-- Priority Notice -->
      <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #fecaca; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
        <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">Important Notice</h3>
        <p style="color: #991b1b; margin: 0; font-size: 14px; line-height: 1.5;">
          Please read this announcement carefully. If you have any questions or concerns, 
          don't hesitate to contact your teacher or the administration office.
        </p>
      </div>
      
      <!-- Contact Information -->
      <div style="background: #f0f9ff; border-radius: 10px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px; display: flex; align-items: center;">
          📞 <span style="margin-left: 8px;">Need Help or Have Questions?</span>
        </h3>
        <div style="color: #1e40af; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 8px 0;">📧 Email: support@khuddamlearning.com</p>
          <p style="margin: 0 0 8px 0;">💬 Student Dashboard: Message your teacher</p>
          <p style="margin: 0;">🏢 Office Hours: Monday - Friday, 9:00 AM - 5:00 PM</p>
        </div>
      </div>
      
      <!-- Additional Resources -->
      <div style="border-top: 2px dashed #e5e7eb; padding-top: 25px; margin-top: 30px;">
        <h3 style="color: #374151; text-align: center; margin: 0 0 20px 0; font-size: 16px;">📚 Quick Access Links</h3>
        <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 10px;">
          <a href="#" style="background: #f3f4f6; color: #374151; padding: 10px 15px; text-decoration: none; border-radius: 8px; font-size: 12px; font-weight: 600; display: inline-block;">
            🏠 Dashboard
          </a>
          <a href="#" style="background: #f3f4f6; color: #374151; padding: 10px 15px; text-decoration: none; border-radius: 8px; font-size: 12px; font-weight: 600; display: inline-block;">
            📅 Schedule
          </a>
          <a href="#" style="background: #f3f4f6; color: #374151; padding: 10px 15px; text-decoration: none; border-radius: 8px; font-size: 12px; font-weight: 600; display: inline-block;">
            📝 Assignments
          </a>
          <a href="#" style="background: #f3f4f6; color: #374151; padding: 10px 15px; text-decoration: none; border-radius: 8px; font-size: 12px; font-weight: 600; display: inline-block;">
            📊 Grades
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
          This announcement was sent to all students in <strong>${formData.className}</strong>
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2024 Khuddam Learning. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  return (
    <div className="email-template-container">
      <div className="template-header">
        <h2><i className="fas fa-bullhorn"></i> Announcement Email Template</h2>
        <div className="template-actions">
          <button className="copy-btn" onClick={copyToClipboard}>
            <i className="fas fa-copy"></i> Copy HTML
          </button>
        </div>
      </div>
      
      <div className="template-editor">
        <div className="editor-section">
          <h3>Template Variables</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="{{title}}"
              />
            </div>
            <div className="form-group">
              <label>Message:</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="{{message}}"
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Action Text:</label>
              <input
                type="text"
                name="actionText"
                value={formData.actionText}
                onChange={handleInputChange}
                placeholder="{{actionText}} (optional)"
              />
            </div>
            <div className="form-group">
              <label>Action URL:</label>
              <input
                type="url"
                name="actionUrl"
                value={formData.actionUrl}
                onChange={handleInputChange}
                placeholder="{{actionUrl}} (optional)"
              />
            </div>
            <div className="form-group">
              <label>Class Name:</label>
              <input
                type="text"
                name="className"
                value={formData.className}
                onChange={handleInputChange}
                placeholder="{{className}}"
              />
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                placeholder="{{date}}"
              />
            </div>
          </div>
        </div>
        
        <div className="preview-section">
          <h3>Email Preview</h3>
          <div className="email-preview" dangerouslySetInnerHTML={{ __html: getEmailHTML() }} />
        </div>
      </div>
    </div>
  );
};

export default AnnouncementTemplate;