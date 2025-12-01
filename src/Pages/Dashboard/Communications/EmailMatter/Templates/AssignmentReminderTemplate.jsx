import React, { useState } from "react";
import "./EmailTemplate.css";

const AssignmentReminderTemplate = () => {
  const [formData, setFormData] = useState({
    studentName: "{{studentName}}",
    assignmentTitle: "{{assignmentTitle}}",
    subject: "{{subject}}",
    dueDate: "{{dueDate}}",
    dueTime: "{{dueTime}}",
    totalMarks: "{{totalMarks}}",
    submissionUrl: "{{submissionUrl}}",
    timeLeft: "{{timeLeft}}"
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
  <title>Assignment Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">⏰</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Assignment Reminder</h1>
      <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">Don't Miss Your Deadline!</p>
    </div>
    
    <!-- Main Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #293c5d; margin: 0; font-size: 22px;">Hi ${formData.studentName}!</h2>
        <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">This is a friendly reminder about your upcoming assignment</p>
      </div>
      
      <!-- Urgency Alert -->
      <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #ef4444; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
        <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">Assignment Due Soon!</h3>
        <p style="color: #991b1b; margin: 0; font-size: 16px; font-weight: 600;">
          Time Remaining: <span style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px;">${formData.timeLeft}</span>
        </p>
      </div>
      
      <!-- Assignment Details -->
      <div style="background: #fffbeb; border-radius: 15px; padding: 30px; margin: 25px 0; border: 2px solid #fbbf24;">
        <h3 style="color: #92400e; margin: 0 0 20px 0; font-size: 20px; text-align: center; font-weight: bold;">
          📝 ${formData.assignmentTitle}
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">SUBJECT</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">${formData.subject}</div>
          </div>
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">DUE DATE</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">${formData.dueDate}</div>
          </div>
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">DUE TIME</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">${formData.dueTime}</div>
          </div>
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">TOTAL MARKS</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">${formData.totalMarks}</div>
          </div>
        </div>
      </div>
      
      <!-- Submit Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${formData.submissionUrl}" 
           style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 25px; 
                  font-weight: bold; 
                  font-size: 16px; 
                  display: inline-block;
                  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
          🚀 Submit Assignment Now
        </a>
      </div>
      
      <!-- Quick Tips -->
      <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
        <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">💡 Last-Minute Tips:</h3>
        <ul style="color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.7;">
          <li>Review assignment requirements carefully</li>
          <li>Check your work for completeness</li>
          <li>Ensure proper formatting and citations</li>
          <li>Submit early to avoid technical issues</li>
          <li>Keep a backup copy of your work</li>
        </ul>
      </div>
      
      <!-- Technical Requirements -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #475569; margin: 0 0 15px 0; font-size: 16px;">💻 Submission Guidelines:</h3>
        <div style="color: #64748b; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 10px 0;">• Accepted formats: PDF, DOC, DOCX</p>
          <p style="margin: 0 0 10px 0;">• Maximum file size: 10 MB</p>
          <p style="margin: 0 0 10px 0;">• Include your name and student ID in filename</p>
          <p style="margin: 0;">• Late submissions may receive grade penalties</p>
        </div>
      </div>
      
      <!-- Support Contact -->
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 25px 0; text-align: center;">
        <p style="color: #dc2626; margin: 0; font-size: 14px;">
          🆘 <strong>Need Technical Help?</strong> Contact IT support at 
          <a href="mailto:support@khuddamlearning.com" style="color: #dc2626; font-weight: bold;">support@khuddamlearning.com</a>
        </p>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
          You've Got This! 💪
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
          Good luck with your assignment submission!
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
        <h2><i className="fas fa-clock"></i> Assignment Reminder Template</h2>
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
              <label>Student Name:</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                placeholder="{{studentName}}"
              />
            </div>
            <div className="form-group">
              <label>Assignment Title:</label>
              <input
                type="text"
                name="assignmentTitle"
                value={formData.assignmentTitle}
                onChange={handleInputChange}
                placeholder="{{assignmentTitle}}"
              />
            </div>
            <div className="form-group">
              <label>Subject:</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="{{subject}}"
              />
            </div>
            <div className="form-group">
              <label>Due Date:</label>
              <input
                type="text"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                placeholder="{{dueDate}}"
              />
            </div>
            <div className="form-group">
              <label>Due Time:</label>
              <input
                type="text"
                name="dueTime"
                value={formData.dueTime}
                onChange={handleInputChange}
                placeholder="{{dueTime}}"
              />
            </div>
            <div className="form-group">
              <label>Total Marks:</label>
              <input
                type="text"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleInputChange}
                placeholder="{{totalMarks}}"
              />
            </div>
            <div className="form-group">
              <label>Submission URL:</label>
              <input
                type="url"
                name="submissionUrl"
                value={formData.submissionUrl}
                onChange={handleInputChange}
                placeholder="{{submissionUrl}}"
              />
            </div>
            <div className="form-group">
              <label>Time Left:</label>
              <input
                type="text"
                name="timeLeft"
                value={formData.timeLeft}
                onChange={handleInputChange}
                placeholder="{{timeLeft}}"
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

export default AssignmentReminderTemplate;