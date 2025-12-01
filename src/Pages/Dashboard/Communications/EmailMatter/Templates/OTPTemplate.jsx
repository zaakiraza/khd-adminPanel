import React, { useState } from "react";
import "./EmailTemplate.css";

const OTPTemplate = () => {
  const [formData, setFormData] = useState({
    studentName: "{{name}}",
    otp: "{{otp}}",
    expiryTime: "1 minute"
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
  <title>Account Verification - OTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #293c5d 0%, #4a5f8f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🔐 Account Verification</h1>
      <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Khuddam Learning Online Classes</p>
    </div>
    
    <!-- Main Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: #f0f9ff; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 32px;">🔑</span>
        </div>
        <h2 style="color: #293c5d; margin: 0; font-size: 24px;">Your Verification Code</h2>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 25px; text-align: center;">
        Dear <strong>${formData.studentName}</strong>,<br><br>
        Thank you for registering with Khuddam Learning Online Classes. Your registration is successful! 
        Please use the verification code below to complete your account setup.
      </p>
      
      <!-- OTP Display -->
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px dashed #293c5d; border-radius: 15px; padding: 30px; text-align: center; margin: 30px 0;">
        <p style="margin: 0 0 15px 0; color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your OTP Code</p>
        <div style="background: #293c5d; color: white; font-size: 36px; font-weight: bold; padding: 15px 25px; border-radius: 10px; display: inline-block; letter-spacing: 8px; font-family: 'Courier New', monospace;">
          ${formData.otp}
        </div>
        <p style="margin: 15px 0 0 0; color: #ef4444; font-size: 14px; font-weight: 600;">
          ⏱️ This code expires in ${formData.expiryTime}
        </p>
      </div>
      
      <!-- Instructions -->
      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
        <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📋 Instructions:</h3>
        <ol style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
          <li>Enter this code in the verification form</li>
          <li>Code is valid for ${formData.expiryTime} only</li>
          <li>Do not share this code with anyone</li>
          <li>If code expires, request a new one</li>
        </ol>
      </div>
      
      <!-- Security Notice -->
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 25px 0;">
        <p style="color: #dc2626; margin: 0; font-size: 14px; text-align: center;">
          🔒 <strong>Security Notice:</strong> If you didn't register for this account, please ignore this email.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
          Need help? Contact our support team at 
          <a href="mailto:support@khuddamlearning.com" style="color: #293c5d;">support@khuddamlearning.com</a>
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
        <h2><i className="fas fa-lock"></i> OTP Verification Template</h2>
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
                placeholder="{{name}}"
              />
            </div>
            <div className="form-group">
              <label>OTP Code:</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="{{otp}}"
              />
            </div>
            <div className="form-group">
              <label>Expiry Time:</label>
              <input
                type="text"
                name="expiryTime"
                value={formData.expiryTime}
                onChange={handleInputChange}
                placeholder="1 minute"
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

export default OTPTemplate;