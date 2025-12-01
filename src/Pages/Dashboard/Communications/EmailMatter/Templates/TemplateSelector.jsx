import React, { useState } from "react";
import OTPTemplate from "./OTPTemplate";
import NewsletterVerificationTemplate from "./NewsletterVerificationTemplate";
import WelcomeTemplate from "./WelcomeTemplate";
import AnnouncementTemplate from "./AnnouncementTemplate";
import ExamNotificationTemplate from "./ExamNotificationTemplate";
import AssignmentReminderTemplate from "./AssignmentReminderTemplate";
import PasswordResetTemplate from "./PasswordResetTemplate";
import "./EmailTemplate.css";

const TemplateSelector = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    {
      id: 'otp',
      name: 'OTP Verification',
      icon: '<i className="fas fa-lock"></i>',
      description: 'Email template for sending OTP verification codes to new users during registration',
      component: OTPTemplate,
      category: 'Authentication'
    },
    {
      id: 'newsletter-verification',
      name: 'Newsletter Verification',
      icon: '<i className="fas fa-envelope-open-text"></i>',
      description: 'Email template for verifying newsletter subscriptions with confirmation link',
      component: NewsletterVerificationTemplate,
      category: 'Newsletter'
    },
    {
      id: 'welcome',
      name: 'Welcome Email',
      icon: '<i className="fas fa-hand-wave"></i>',
      description: 'Welcome email template for new students with dashboard access and getting started guide',
      component: WelcomeTemplate,
      category: 'Onboarding'
    },
    {
      id: 'announcement',
      name: 'Announcements',
      icon: '<i className="fas fa-bullhorn"></i>',
      description: 'General announcement template for important class notifications and updates',
      component: AnnouncementTemplate,
      category: 'Communication'
    },
    {
      id: 'exam-notification',
      name: 'Exam Notification',
      icon: '<i className="fas fa-file-alt"></i>',
      description: 'Email template for notifying students about upcoming exams with details and instructions',
      component: ExamNotificationTemplate,
      category: 'Academic'
    },
    {
      id: 'assignment-reminder',
      name: 'Assignment Reminder',
      icon: '<i className="fas fa-clock"></i>',
      description: 'Reminder template for pending assignments with deadline alerts and submission links',
      component: AssignmentReminderTemplate,
      category: 'Academic'
    },
    {
      id: 'password-reset',
      name: 'Password Reset',
      icon: '<i className="fas fa-unlock-alt"></i>',
      description: 'Security email template for password reset requests with secure reset links',
      component: PasswordResetTemplate,
      category: 'Security'
    }
  ];

  const categories = [...new Set(templates.map(t => t.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const SelectedComponent = selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.component : null;

  if (SelectedComponent) {
    return (
      <div>
        <div style={{ padding: '1rem', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
          <button
            onClick={() => setSelectedTemplate(null)}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            ← Back to Templates
          </button>
        </div>
        <SelectedComponent />
      </div>
    );
  }

  return (
    <div className="email-template-container">
      <div className="template-header">
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#293c5d' }}><i className="fas fa-envelope"></i> Email Templates Library</h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '1rem' }}>
            Pre-designed email templates for all system communications
          </p>
        </div>
      </div>
      
      {/* Category Filter */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            onClick={() => setSelectedCategory('All')}
            style={{
              padding: '0.5rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '20px',
              background: selectedCategory === 'All' ? '#293c5d' : 'white',
              color: selectedCategory === 'All' ? 'white' : '#374151',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}
          >
            All Templates ({templates.length})
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '20px',
                background: selectedCategory === category ? '#293c5d' : 'white',
                color: selectedCategory === category ? 'white' : '#374151',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
            >
              {category} ({templates.filter(t => t.category === category).length})
            </button>
          ))}
        </div>
      </div>
      
      {/* Templates Grid */}
      <div className="template-selector">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="template-card"
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="template-card-icon" dangerouslySetInnerHTML={{ __html: template.icon }}></div>
            <h3>{template.name}</h3>
            <p>{template.description}</p>
            <div style={{
              marginTop: '1rem',
              padding: '0.25rem 0.75rem',
              background: '#f3f4f6',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#374151',
              display: 'inline-block'
            }}>
              {template.category}
            </div>
          </div>
        ))}
      </div>
      
      {/* Usage Instructions */}
      <div style={{
        marginTop: '3rem',
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ color: '#293c5d', margin: '0 0 1rem 0', fontSize: '1.3rem' }}>
          <i className="fas fa-book"></i> How to Use These Templates
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h4 style={{ color: '#374151', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
              <i className="fas fa-mouse-pointer"></i> 1. Select a Template
            </h4>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
              Click on any template card to view and customize it. Each template includes preview and variables.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#374151', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
              <i className="fas fa-cog"></i> 2. Customize Variables
            </h4>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
              Modify the template variables like names, dates, and links to match your content needs.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#374151', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
              <i className="fas fa-copy"></i> 3. Copy HTML Code
            </h4>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
              Use the "Copy HTML" button to get the complete email template code for your email campaigns.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#374151', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
              <i className="fas fa-rocket"></i> 4. Implement in System
            </h4>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
              Add the template to your Email Matters system or use directly in your email sending service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;