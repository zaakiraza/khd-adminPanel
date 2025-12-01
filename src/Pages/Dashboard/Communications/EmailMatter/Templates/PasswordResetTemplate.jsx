import React, { useState } from "react";
import "./EmailTemplate.css";

const PasswordResetTemplate = () => {
  const [formData, setFormData] = useState({
    userName: "{{userName}}",
    resetLink: "{{resetLink}}",
    expiryTime: "{{expiryTime}}",
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
  <title>Password Reset Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 32px;">🔐</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Password Reset Request</h1>
      <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Khuddam Learning Account Security</p>
    </div>
    
    <!-- Main Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #293c5d; margin: 0; font-size: 22px;">Hello ${formData.userName},</h2>
        <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">We received a request to reset your password</p>
      </div>
      
      <!-- Security Alert -->
      <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 10px;">🚨</div>
        <h3 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">Password Reset Requested</h3>
        <p style="color: #991b1b; margin: 0; font-size: 14px;">
          If you didn't request this password reset, please ignore this email or contact support immediately.
        </p>
      </div>
      
      <!-- Reset Instructions -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin: 25px 0;">
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
          To reset your password, click the button below. This link will expire in <strong style="color: #ef4444;">${formData.expiryTime}</strong> for security purposes.
        </p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${formData.resetLink}" 
             style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: bold; 
                    font-size: 16px; 
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);">
            🔓 Reset My Password
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0; text-align: center;">
          Or copy and paste this link into your browser:<br>
          <a href="${formData.resetLink}" style="color: #ef4444; word-break: break-all; font-size: 12px;">
            ${formData.resetLink}
          </a>
        </p>
      </div>
      
      <!-- Security Guidelines -->
      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
        <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px;">🔒 Password Security Tips:</h3>
        <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.7; font-size: 14px;">
          <li>Use a combination of letters, numbers, and special characters</li>
          <li>Make it at least 8 characters long</li>
          <li>Don't use personal information or common words</li>
          <li>Don't share your password with anyone</li>
          <li>Use different passwords for different accounts</li>
        </ul>
      </div>
      
      <!-- Account Security Notice -->
      <div style="background: #f0f9ff; border: 2px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 25px 0;">
        <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px; display: flex; align-items: center;">
          🛡️ <span style="margin-left: 8px;">Account Security Notice</span>
        </h3>
        <div style="color: #1e40af; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 10px 0;">• This request was made from IP address: <strong>[IP_ADDRESS]</strong></p>
          <p style="margin: 0 0 10px 0;">• Request time: <strong>[TIMESTAMP]</strong></p>
          <p style="margin: 0;">• If this wasn't you, please secure your account immediately</p>
        </div>
      </div>
      
      <!-- Alternative Contact -->
      <div style="background: #ecfdf5; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
        <h3 style="color: #047857; margin: 0 0 10px 0; font-size: 16px;">🆘 Need Additional Help?</h3>
        <p style="color: #047857; margin: 0; font-size: 14px; line-height: 1.5;">
          If you're unable to reset your password using this link, or if you have any security concerns, 
          please contact our support team immediately at 
          <a href="mailto:${formData.supportEmail}" style="color: #047857; font-weight: bold;">${formData.supportEmail}</a>
        </p>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">
          Keep Your Account Safe! 🛡️
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
          This is an automated security email from Khuddam Learning.
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
        <h2><i className="fas fa-unlock-alt"></i> Password Reset Template</h2>
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
              <label>User Name:</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder="{{userName}}"
              />
            </div>
            <div className="form-group">
              <label>Reset Link:</label>
              <input
                type="url"
                name="resetLink"
                value={formData.resetLink}
                onChange={handleInputChange}
                placeholder="{{resetLink}}"
              />
            </div>
            <div className="form-group">
              <label>Expiry Time:</label>
              <input
                type="text"
                name="expiryTime"
                value={formData.expiryTime}
                onChange={handleInputChange}
                placeholder="{{expiryTime}}"
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

export default PasswordResetTemplate;