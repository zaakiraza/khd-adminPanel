import React, { useState } from "react";
import "./EmailTemplate.css";

const NewsletterVerificationTemplate = () => {
  const [formData, setFormData] = useState({
    verificationLink: "{{verificationLink}}",
    frontendUrl: "{{frontendUrl}}"
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
  <title>Verify Newsletter Subscription</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #293c5d 0%, #4a5f8f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Khuddam Learning!</h1>
      <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">📧 Newsletter Subscription</p>
    </div>
    
    <!-- Main Content -->
    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: #f0fdf4; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 32px;">📬</span>
        </div>
        <h2 style="color: #293c5d; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h2>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 25px; text-align: center;">
        Thank you for subscribing to our newsletter! Please click the button below to verify your email address and start receiving updates about:
      </p>
      
      <!-- Benefits List -->
      <div style="background: #f8fafc; border-radius: 10px; padding: 25px; margin: 25px 0;">
        <ul style="color: #475569; line-height: 1.8; margin: 0; padding-left: 20px; list-style-type: none;">
          <li style="margin-bottom: 8px;">📚 New course announcements and updates</li>
          <li style="margin-bottom: 8px;">📅 Class schedules and important dates</li>
          <li style="margin-bottom: 8px;">🎉 Educational events and activities</li>
          <li style="margin-bottom: 8px;">🏆 Student achievements and success stories</li>
          <li style="margin-bottom: 8px;">📝 Exam schedules and results</li>
          <li>🎓 Graduation ceremonies and celebrations</li>
        </ul>
      </div>
      
      <!-- Verification Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${formData.verificationLink}" 
           style="background: linear-gradient(135deg, #293c5d 0%, #4a5f8f 100%); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 25px; 
                  font-weight: bold; 
                  font-size: 16px; 
                  display: inline-block;
                  box-shadow: 0 4px 15px rgba(41, 60, 93, 0.3);
                  transition: all 0.3s ease;">
          ✅ Verify My Email
        </a>
      </div>
      
      <!-- Alternative Link -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px;">
        <p style="color: #666; font-size: 14px; margin: 0; text-align: center;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${formData.verificationLink}" style="color: #293c5d; word-break: break-all; font-size: 12px;">
            ${formData.verificationLink}
          </a>
        </p>
      </div>
      
      <!-- Security Notice -->
      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin: 25px 0;">
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          🔒 <strong>Privacy Note:</strong> We respect your privacy and will never spam you. 
          You can unsubscribe at any time using the link in our emails.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">
          If you didn't subscribe to this newsletter, you can safely ignore this email.
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
          Questions? Contact us at 
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
        <h2><i className="fas fa-envelope-open-text"></i> Newsletter Verification Template</h2>
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
              <label>Verification Link:</label>
              <input
                type="url"
                name="verificationLink"
                value={formData.verificationLink}
                onChange={handleInputChange}
                placeholder="{{verificationLink}}"
              />
            </div>
            <div className="form-group">
              <label>Frontend URL:</label>
              <input
                type="url"
                name="frontendUrl"
                value={formData.frontendUrl}
                onChange={handleInputChange}
                placeholder="{{frontendUrl}}"
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

export default NewsletterVerificationTemplate;