import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./StudentDetails.css";

export default function StudentDetailView() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = await axios.get(`${baseURL}/users/single/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (api.status === 200) {
        setStudent(api.data.data);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to fetch student details");
      if (e.response && e.response.status === 403) {
        showError(e.response.data.message);
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  if (loading) {
    return (
      <section className="container">
        <div className="heading">
          <h1>Student Details</h1>
        </div>
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container">
        <div className="heading">
          <h1>Student Details</h1>
        </div>
        <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>
          {error}
        </div>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </section>
    );
  }

  if (!student) {
    return (
      <section className="container">
        <div className="heading">
          <h1>Student Details</h1>
        </div>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Student not found
        </div>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </section>
    );
  }

  return (
    <section className="container">
      <div className="heading">
        <h1>Student Details</h1>
        <button onClick={() => navigate(-1)} style={{ marginLeft: "auto" }}>
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
      </div>

      <div className="student-detail-view">
        {/* Profile Image */}
        {student.personal_info?.img_URL && (
          <div className="detail-section">
            <h2>Profile Picture</h2>
            <div className="profile-image-container">
              <img 
                src={student.personal_info.img_URL} 
                alt={`${student.personal_info.first_name} ${student.personal_info.last_name}`}
                className="profile-image"
              />
            </div>
          </div>
        )}

        {/* Personal Information */}
        <div className="detail-section">
          <h2>Personal Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <strong>Roll No:</strong>
              <span>{student.personal_info?.rollNo || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>First Name:</strong>
              <span>{student.personal_info?.first_name || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>Last Name:</strong>
              <span>{student.personal_info?.last_name || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>Father Name:</strong>
              <span>{student.personal_info?.father_name || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>Gender:</strong>
              <span>{student.personal_info?.gender || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>Date of Birth:</strong>
              <span>{student.personal_info?.dob || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>Age:</strong>
              <span>{student.personal_info?.age || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>CNIC:</strong>
              <span>{student.personal_info?.CNIC || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>WhatsApp No:</strong>
              <span>{student.personal_info?.whatsapp_no || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>Alternative No:</strong>
              <span>{student.personal_info?.alternative_no || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>Email:</strong>
              <span>{student.personal_info?.email || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>Marj-e-Taqleed:</strong>
              <span>{student.personal_info?.marj_e_taqleed || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>Enrolled Year:</strong>
              <span>{student.personal_info?.enrolled_year || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>Enrolled Class:</strong>
              <span>{student.personal_info?.enrolled_class || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>Status:</strong>
              <span className={`status-badge ${student.personal_info?.status}`}>
                {student.personal_info?.status || "N/A"}
              </span>
            </div>
            <div className="detail-item">
              <strong>Application Status:</strong>
              <span className={`status-badge ${student.personal_info?.application_status}`}>
                {student.personal_info?.application_status || "N/A"}
              </span>
            </div>
            <div className="detail-item">
              <strong>Verified:</strong>
              <span>{student.personal_info?.verified ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="detail-section">
          <h2>Address Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <strong>Address:</strong>
              <span>{student.personal_info?.address || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>City:</strong>
              <span>{student.personal_info?.city || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>Country:</strong>
              <span>{student.personal_info?.country || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        {student.guardian_info && (
          <div className="detail-section">
            <h2>Guardian Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Name:</strong>
                <span>{student.guardian_info?.name || "N/A"}</span>
              </div>
              <div className="detail-item">
                <strong>Relationship:</strong>
                <span>{student.guardian_info?.relationship || "N/A"}</span>
              </div>
              <div className="detail-item">
                <strong>Email:</strong>
                <span>{student.guardian_info?.email || "N/A"}</span>
              </div>
              <div className="detail-item">
                <strong>WhatsApp No:</strong>
                <span>{student.guardian_info?.whatsapp_no || "N/A"}</span>
              </div>
              <div className="detail-item">
                <strong>CNIC:</strong>
                <span>{student.guardian_info?.CNIC || "N/A"}</span>
              </div>
              <div className="detail-item">
                <strong>Address:</strong>
                <span>{student.guardian_info?.address || "N/A"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Academic Progress */}
        {student.academic_progress && (
          <div className="detail-section">
            <h2>Academic Progress</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Academic Class:</strong>
                <span>{student.academic_progress?.academic_class || "N/A"}</span>
              </div>
              <div className="detail-item">
                <strong>Institute Name:</strong>
                <span>{student.academic_progress?.institute_name || "N/A"}</span>
              </div>
              <div className="detail-item">
                <strong>In Progress:</strong>
                <span>{student.academic_progress?.inProgress ? "Yes" : "No"}</span>
              </div>
              <div className="detail-item">
                <strong>Result:</strong>
                <span>{student.academic_progress?.result || "N/A"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Previous Madrassa */}
        {student.previous_madrassa && (
          <div className="detail-section">
            <h2>Previous Madrassa Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Name:</strong>
                <span>{student.previous_madrassa?.name || "N/A"}</span>
              </div>
              <div className="detail-item">
                <strong>Topic:</strong>
                <span>{student.previous_madrassa?.topic || "N/A"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bank Information */}
        {student.bank_info && (
          <div className="detail-section">
            <h2>Bank Information</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Bank Name:</strong>
                <span>{student.bank_info?.bank_name || "N/A"}</span>
              </div>
              <div className="detail-item">
                <strong>Account Number:</strong>
                <span>{student.bank_info?.account_number || "N/A"}</span>
              </div>
              <div className="detail-item">
                <strong>Account Title:</strong>
                <span>{student.bank_info?.account_title || "N/A"}</span>
              </div>
              <div className="detail-item">
                <strong>Branch:</strong>
                <span>{student.bank_info?.branch || "N/A"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Class History */}
        {student.class_history && student.class_history.length > 0 && (
          <div className="detail-section">
            <h2>Class History</h2>
            <div className="class-history-list">
              {student.class_history.map((classItem, index) => (
                <div key={index} className="class-history-item">
                  <p>{classItem}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
