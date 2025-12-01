import React, { useState } from "react";
import "./EmailTemplate.css";

const WelcomeTemplate = () => {
  const [formData, setFormData] = useState({
    studentName: "{{studentName}}",
    className: "{{className}}",
    loginUrl: "{{loginUrl}}",
    supportEmail: "support@khuddamlearning.com"
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
  <title>Welcome to Khuddam Learning</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #293c5d 0%, #4a5f8f 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">🎉 Welcome to Khuddam Learning!</h1>
      <p style="color: #e2e8f0; margin: 15px 0 0 0; font-size: 18px;">Your Learning Journey Begins Here</p>
    </div>
    
    <!-- Main Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: #ecfdf5; border-radius: 50%; width: 100px; height: 100px; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; border: 3px solid #10b981;">
          <span style="font-size: 40px;">🎓</span>
        </div>
        <h2 style="color: #293c5d; margin: 0; font-size: 26px;">Welcome ${formData.studentName}!</h2>
        <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">You've successfully joined <strong>${formData.className}</strong></p>
      </div>
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 15px; padding: 30px; margin: 30px 0; text-align: center;">
        <h3 style="color: #293c5d; margin: 0 0 20px 0; font-size: 20px;">🚀 Ready to Get Started?</h3>
        <p style="color: #475569; margin: 0 0 25px 0; line-height: 1.6;">
          Your account is now active and ready to use. Access your student dashboard to explore courses, 
          view assignments, check your attendance, and much more!
        </p>
        <a href="${formData.loginUrl}" 
           style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 25px; 
                  font-weight: bold; 
                  font-size: 16px; 
                  display: inline-block;
                  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
          🔑 Access Dashboard
        </a>
      </div>
      
      <!-- Features Grid -->
      <div style="margin: 40px 0;">
        <h3 style="color: #293c5d; text-align: center; margin: 0 0 30px 0; font-size: 22px;">📚 What You Can Do:</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
          <div style="background: #fef3c7; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">📖</div>
            <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">Study Materials</h4>
            <p style="color: #a16207; margin: 0; font-size: 12px;">Access course content and resources</p>
          </div>
          <div style="background: #dbeafe; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">📝</div>
            <h4 style="color: #1e40af; margin: 0 0 8px 0; font-size: 14px;">Assignments</h4>
            <p style="color: #2563eb; margin: 0; font-size: 12px;">Submit and track your assignments</p>
          </div>
          <div style="background: #f3e8ff; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">📊</div>
            <h4 style="color: #7c3aed; margin: 0 0 8px 0; font-size: 14px;">Progress Tracking</h4>
            <p style="color: #8b5cf6; margin: 0; font-size: 12px;">Monitor your academic progress</p>
          </div>
          <div style="background: #fce7f3; padding: 20px; border-radius: 10px; text-align: center;">
            <div style="font-size: 24px; margin-bottom: 10px;">👥</div>
            <h4 style="color: #be185d; margin: 0 0 8px 0; font-size: 14px;">Community</h4>
            <p style="color: #db2777; margin: 0; font-size: 12px;">Connect with classmates and teachers</p>
          </div>
        </div>
      </div>
      
      <!-- Quick Tips -->
      <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 25px; margin: 30px 0;">
        <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
          💡 <span style="margin-left: 8px;">Quick Tips for Success:</span>
        </h3>
        <ul style="color: #166534; margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Check your dashboard daily for new announcements</li>
          <li>Submit assignments before the due date</li>
          <li>Attend all scheduled classes and exams</li>
          <li>Use the messaging system to communicate with teachers</li>
          <li>Keep your profile information updated</li>
        </ul>
      </div>
      
      <!-- Support Section -->
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
        <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 16px;">🆘 Need Help?</h3>
        <p style="color: #991b1b; margin: 0; line-height: 1.6;">
          Our support team is here to help you succeed. Contact us anytime at 
          <a href="mailto:${formData.supportEmail}" style="color: #dc2626; font-weight: bold;">${formData.supportEmail}</a>
          or through the help section in your dashboard.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 40px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
          Welcome to the Khuddam Learning Family! 🏡
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
          Follow us for updates and educational content:
        </p>
        <div style="margin: 15px 0;">
          <a href="#" style="color: #293c5d; text-decoration: none; margin: 0 10px; font-size: 20px;">📘</a>
          <a href="#" style="color: #293c5d; text-decoration: none; margin: 0 10px; font-size: 20px;">📷</a>
          <a href="#" style="color: #293c5d; text-decoration: none; margin: 0 10px; font-size: 20px;">🐦</a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
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
        <h2><i className="fas fa-hand-wave"></i> Welcome Email Template</h2>
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
              <label>Login URL:</label>
              <input
                type="url"
                name="loginUrl"
                value={formData.loginUrl}
                onChange={handleInputChange}
                placeholder="{{loginUrl}}"
              />
            </div>
            <div className="form-group">
              <label>Support Email:</label>
              <input
                type="email"
                name="supportEmail"
                value={formData.supportEmail}
                onChange={handleInputChange}
                placeholder="support@khuddamlearning.com"
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

export default WelcomeTemplate;