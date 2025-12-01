import React, { useState } from "react";
import "./EmailTemplate.css";

const ExamNotificationTemplate = () => {
  const [formData, setFormData] = useState({
    studentName: "{{studentName}}",
    examName: "{{examName}}",
    subject: "{{subject}}",
    examDate: "{{examDate}}",
    startTime: "{{startTime}}",
    endTime: "{{endTime}}",
    duration: "{{duration}}",
    totalMarks: "{{totalMarks}}",
    instructions: "{{instructions}}"
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
  <title>Exam Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">📋</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Exam Notification</h1>
      <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 16px;">Khuddam Learning Online Classes</p>
    </div>
    
    <!-- Main Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #293c5d; margin: 0; font-size: 22px;">Dear ${formData.studentName},</h2>
        <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">Your upcoming exam details</p>
      </div>
      
      <!-- Exam Details Card -->
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 15px; padding: 30px; margin: 25px 0; border: 2px solid #f59e0b;">
        <h3 style="color: #92400e; margin: 0 0 20px 0; font-size: 20px; text-align: center; font-weight: bold;">
          📝 ${formData.examName}
        </h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">SUBJECT</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">${formData.subject}</div>
          </div>
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">DATE</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">${formData.examDate}</div>
          </div>
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">TIME</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">${formData.startTime} - ${formData.endTime}</div>
          </div>
          <div style="background: rgba(255,255,255,0.8); padding: 15px; border-radius: 8px; text-align: center;">
            <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">DURATION</div>
            <div style="color: #a16207; font-size: 16px; font-weight: 600;">${formData.duration}</div>
          </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.9); padding: 15px; border-radius: 8px; text-align: center;">
          <div style="color: #92400e; font-weight: bold; font-size: 14px; margin-bottom: 5px;">TOTAL MARKS</div>
          <div style="color: #a16207; font-size: 20px; font-weight: bold;">${formData.totalMarks} Points</div>
        </div>
      </div>
      
      <!-- Instructions -->
      <div style="background: #f0f9ff; border: 2px solid #bfdbfe; border-radius: 12px; padding: 25px; margin: 25px 0;">
        <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
          📜 <span style="margin-left: 8px;">Exam Instructions:</span>
        </h3>
        <div style="color: #1e40af; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">
          ${formData.instructions || `• Be present 10 minutes before the exam starts
• Bring necessary stationery and ID card
• Mobile phones and electronic devices are not allowed
• Follow all exam hall rules and regulations
• Read all questions carefully before answering
• Manage your time effectively`}
        </div>
      </div>
      
      <!-- Preparation Tips -->
      <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
        <h3 style="color: #047857; margin: 0 0 15px 0; font-size: 16px;">🎯 Preparation Tips:</h3>
        <ul style="color: #047857; margin: 0; padding-left: 20px; line-height: 1.7;">
          <li>Review your notes and study materials</li>
          <li>Practice past exam questions</li>
          <li>Get adequate rest before the exam</li>
          <li>Arrive early to avoid stress</li>
          <li>Stay calm and confident</li>
        </ul>
      </div>
      
      <!-- Contact Support -->
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 25px 0; text-align: center;">
        <p style="color: #dc2626; margin: 0; font-size: 14px;">
          🆘 <strong>Need Help?</strong> Contact our support team at 
          <a href="mailto:support@khuddamlearning.com" style="color: #dc2626; font-weight: bold;">support@khuddamlearning.com</a>
        </p>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">
          Good Luck with Your Exam! 🎆
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
        <h2><i className="fas fa-file-alt"></i> Exam Notification Template</h2>
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
              <label>Exam Name:</label>
              <input
                type="text"
                name="examName"
                value={formData.examName}
                onChange={handleInputChange}
                placeholder="{{examName}}"
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
              <label>Exam Date:</label>
              <input
                type="text"
                name="examDate"
                value={formData.examDate}
                onChange={handleInputChange}
                placeholder="{{examDate}}"
              />
            </div>
            <div className="form-group">
              <label>Start Time:</label>
              <input
                type="text"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                placeholder="{{startTime}}"
              />
            </div>
            <div className="form-group">
              <label>End Time:</label>
              <input
                type="text"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                placeholder="{{endTime}}"
              />
            </div>
            <div className="form-group">
              <label>Duration:</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="{{duration}}"
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

export default ExamNotificationTemplate;