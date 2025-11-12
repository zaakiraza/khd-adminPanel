import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./StudentByCategory.css";

export default function StudentByCategoryDetailView() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Helper function to format date to yyyy-MM-dd
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    try {
      // Handle different date formats
      let date;
      
      // If date contains slashes (2009/01/15), convert to ISO format
      if (dateString.includes("/")) {
        const parts = dateString.split("/");
        // Assuming format is YYYY/MM/DD
        date = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) return "";
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

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
        setEditedData(api.data.data);
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

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedData(student);
  };

  const handleInputChange = (section, field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const uploadImage = async (fileInput, folderName) => {
    console.log(fileInput);
    if (!fileInput || !folderName) {
      showWarning("Please select an image file");
      return null;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (fileInput.size > maxSize) {
      showError("File size must be less than 5MB");
      return null;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(fileInput.type)) {
      showError("Please upload a valid image (JPEG, PNG, or WebP)");
      return null;
    }

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      showError("Cloudinary configuration is missing");
      return null;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", fileInput);
    formData.append("upload_preset", `${CLOUD_NAME}`);
    formData.append("folder", folderName);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${UPLOAD_PRESET}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        setEditedData((prev) => ({
          ...prev,
          personal_info: {
            ...prev.personal_info,
            img_URL: data.secure_url,
          },
        }));
        showSuccess("Image uploaded successfully!");
      }
      return data.secure_url;
    } catch (error) {
      showError("Failed to upload image. Please try again.");
      console.error("Cloudinary upload error:", error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

//   const handleImageUpload = async (e, imageType) => {
//     const imageUrl = await uploadImage(e.target, "student_images");
//     if (imageUrl) {
//       setEditedData((prev) => ({
//         ...prev,
//         personal_info: {
//           ...prev.personal_info,
//           [imageType]: imageUrl,
//         },
//       }));
//     }
//   };

  const handleSaveChanges = async () => {
    try {
      const api = await axios.put(
        `${baseURL}/users/update_personal/${id}`,
        editedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (api.status === 200) {
        showSuccess("Student data updated successfully!");
        setStudent(editedData);
        setIsEditMode(false);
        fetchStudentDetails();
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to update student data");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading student details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container">
        <div className="error">Student not found</div>
      </div>
    );
  }

  return (
    <section className="container">
      <div className="detail-view-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i> Back
        </button>
        <h1>Student Details</h1>
        {!isEditMode ? (
          <button className="edit-btn" onClick={handleEdit}>
            <i className="fa-solid fa-pen"></i> Edit
          </button>
        ) : (
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSaveChanges}>
              <i className="fa-solid fa-check"></i> Save
            </button>
            <button className="cancel-btn" onClick={handleCancelEdit}>
              <i className="fa-solid fa-times"></i> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Image Section */}
      <div className="profile-section">
        <div className="profile-image-container">
          <img
            src={editedData.personal_info.img_URL || "/default-avatar.png"}
            alt="Student Profile"
            className="profile-image"
          />
          {isEditMode && (
            <div className="image-upload-btn">
              <label htmlFor="profile-upload">
                <i className="fa-solid fa-camera"></i> Change Photo
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={(e) => uploadImage(e.target.files[0], "User Pics")}
                style={{ display: "none" }}
                disabled={uploadingImage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="detail-section">
        <h2>Personal Information</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Roll No:</label>
            <span>{editedData.personal_info.rollNo || "N/A"}</span>
          </div>
          <div className="detail-item">
            <label>First Name:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.personal_info.first_name}
                onChange={(e) =>
                  handleInputChange(
                    "personal_info",
                    "first_name",
                    e.target.value
                  )
                }
              />
            ) : (
              <span>{editedData.personal_info.first_name}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Last Name:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.personal_info.last_name}
                onChange={(e) =>
                  handleInputChange(
                    "personal_info",
                    "last_name",
                    e.target.value
                  )
                }
              />
            ) : (
              <span>{editedData.personal_info.last_name}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Father Name:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.personal_info.father_name}
                onChange={(e) =>
                  handleInputChange(
                    "personal_info",
                    "father_name",
                    e.target.value
                  )
                }
              />
            ) : (
              <span>{editedData.personal_info.father_name}</span>
            )}
          </div>
          <div className="detail-item">
            <label>CNIC:</label>
            <span>{editedData.personal_info.CNIC || "N/A"}</span>
          </div>
          <div className="detail-item">
            <label>Email:</label>
            <span>{editedData.personal_info.email || "N/A"}</span>
          </div>
          <div className="detail-item">
            <label>Gender:</label>
            {isEditMode ? (
              <select
                value={editedData.personal_info.gender}
                onChange={(e) =>
                  handleInputChange("personal_info", "gender", e.target.value)
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            ) : (
              <span>{editedData.personal_info.gender}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Date of Birth:</label>
            {isEditMode ? (
              <input
                type="date"
                value={formatDateForInput(editedData.personal_info.dob)}
                onChange={(e) =>
                  handleInputChange("personal_info", "dob", e.target.value)
                }
              />
            ) : (
              <span>
                {editedData.personal_info.dob
                  ? new Date(editedData.personal_info.dob).toLocaleDateString()
                  : "N/A"}
              </span>
            )}
          </div>
          <div className="detail-item">
            <label>Age:</label>
            {isEditMode ? (
              <input
                type="number"
                value={editedData.personal_info.age}
                onChange={(e) =>
                  handleInputChange(
                    "personal_info",
                    "age",
                    parseInt(e.target.value)
                  )
                }
              />
            ) : (
              <span>{editedData.personal_info.age}</span>
            )}
          </div>
          <div className="detail-item">
            <label>WhatsApp No:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.personal_info.whatsapp_no}
                onChange={(e) =>
                  handleInputChange(
                    "personal_info",
                    "whatsapp_no",
                    e.target.value
                  )
                }
              />
            ) : (
              <span>{editedData.personal_info.whatsapp_no}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Alternative No:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.personal_info.alternative_no}
                onChange={(e) =>
                  handleInputChange(
                    "personal_info",
                    "alternative_no",
                    e.target.value
                  )
                }
              />
            ) : (
              <span>{editedData.personal_info.alternative_no}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Address:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.personal_info.address}
                onChange={(e) =>
                  handleInputChange("personal_info", "address", e.target.value)
                }
              />
            ) : (
              <span>{editedData.personal_info.address}</span>
            )}
          </div>
          <div className="detail-item">
            <label>City:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.personal_info.city}
                onChange={(e) =>
                  handleInputChange("personal_info", "city", e.target.value)
                }
              />
            ) : (
              <span>{editedData.personal_info.city}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Country:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.personal_info.country}
                onChange={(e) =>
                  handleInputChange("personal_info", "country", e.target.value)
                }
              />
            ) : (
              <span>{editedData.personal_info.country}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Marj-e-Taqleed:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.personal_info.marj_e_taqleed}
                onChange={(e) =>
                  handleInputChange(
                    "personal_info",
                    "marj_e_taqleed",
                    e.target.value
                  )
                }
              />
            ) : (
              <span>{editedData.personal_info.marj_e_taqleed}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Enrolled Year:</label>
            <span>{editedData.personal_info.enrolled_year || "N/A"}</span>
          </div>
          <div className="detail-item">
            <label>Enrolled Class:</label>
            <span>{editedData.personal_info.enrolled_class || "N/A"}</span>
          </div>
          <div className="detail-item">
            <label>Status:</label>
            <span className={`status-badge ${editedData.personal_info.status}`}>
              {editedData.personal_info.status}
            </span>
          </div>
          <div className="detail-item">
            <label>Application Status:</label>
            <span
              className={`status-badge ${editedData.personal_info.application_status}`}
            >
              {editedData.personal_info.application_status}
            </span>
          </div>
          <div className="detail-item">
            <label>Verified:</label>
            <span
              className={`status-badge ${
                editedData.personal_info.verified ? "verified" : "not-verified"
              }`}
            >
              {editedData.personal_info.verified ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>

      {/* Document Image */}
      <div className="detail-section">
        <h2>Document Image</h2>
        <div className="document-image-container">
          {editedData.personal_info.doc_img ? (
            <img
              src={editedData.personal_info.doc_img}
              alt="Document"
              className="document-image"
            />
          ) : (
            <div className="no-document-message">
              <i className="fa-solid fa-file-circle-xmark"></i>
              <p>No Document</p>
            </div>
          )}
          {isEditMode && (
            <div className="image-upload-btn">
              <label htmlFor="doc-upload">
                <i className="fa-solid fa-upload"></i> Upload Document
              </label>
              <input
                id="doc-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "doc_img")}
                style={{ display: "none" }}
                disabled={uploadingImage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Guardian Information */}
      <div className="detail-section">
        <h2>Guardian Information</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Name:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.guardian_info.name}
                onChange={(e) =>
                  handleInputChange("guardian_info", "name", e.target.value)
                }
              />
            ) : (
              <span>{editedData.guardian_info.name}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Relationship:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.guardian_info.relationship}
                onChange={(e) =>
                  handleInputChange(
                    "guardian_info",
                    "relationship",
                    e.target.value
                  )
                }
              />
            ) : (
              <span>{editedData.guardian_info.relationship}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Email:</label>
            <span>{editedData.guardian_info.email}</span>
          </div>
          <div className="detail-item">
            <label>CNIC:</label>
            <span>{editedData.guardian_info.CNIC}</span>
          </div>
          <div className="detail-item">
            <label>WhatsApp No:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.guardian_info.whatsapp_no}
                onChange={(e) =>
                  handleInputChange(
                    "guardian_info",
                    "whatsapp_no",
                    e.target.value
                  )
                }
              />
            ) : (
              <span>{editedData.guardian_info.whatsapp_no}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Address:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.guardian_info.address}
                onChange={(e) =>
                  handleInputChange("guardian_info", "address", e.target.value)
                }
              />
            ) : (
              <span>{editedData.guardian_info.address}</span>
            )}
          </div>
        </div>
      </div>

      {/* Academic Progress */}
      <div className="detail-section">
        <h2>Academic Progress</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Academic Class:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.academic_progress.academic_class}
                onChange={(e) =>
                  handleInputChange(
                    "academic_progress",
                    "academic_class",
                    e.target.value
                  )
                }
              />
            ) : (
              <span>{editedData.academic_progress.academic_class}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Institute Name:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.academic_progress.institute_name}
                onChange={(e) =>
                  handleInputChange(
                    "academic_progress",
                    "institute_name",
                    e.target.value
                  )
                }
              />
            ) : (
              <span>{editedData.academic_progress.institute_name}</span>
            )}
          </div>
          <div className="detail-item">
            <label>In Progress:</label>
            {isEditMode ? (
              <select
                value={editedData.academic_progress.inProgress}
                onChange={(e) =>
                  handleInputChange(
                    "academic_progress",
                    "inProgress",
                    e.target.value === "true"
                  )
                }
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            ) : (
              <span>
                {editedData.academic_progress.inProgress ? "Yes" : "No"}
              </span>
            )}
          </div>
          <div className="detail-item">
            <label>Result:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.academic_progress.result || ""}
                onChange={(e) =>
                  handleInputChange(
                    "academic_progress",
                    "result",
                    e.target.value
                  )
                }
              />
            ) : (
              <span>{editedData.academic_progress.result || "N/A"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Previous Madrassa */}
      <div className="detail-section">
        <h2>Previous Madrassa</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Name:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.previous_madrassa?.name || ""}
                onChange={(e) =>
                  handleInputChange("previous_madrassa", "name", e.target.value)
                }
              />
            ) : (
              <span>{editedData.previous_madrassa?.name || "N/A"}</span>
            )}
          </div>
          <div className="detail-item">
            <label>Topic:</label>
            {isEditMode ? (
              <input
                type="text"
                value={editedData.previous_madrassa?.topic || ""}
                onChange={(e) =>
                  handleInputChange(
                    "previous_madrassa",
                    "topic",
                    e.target.value
                  )
                }
              />
            ) : (
              <span>{editedData.previous_madrassa?.topic || "N/A"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Bank Information */}
      <div className="detail-section">
        <h2>Bank Information</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Bank Name:</label>
            <span>{editedData.bank_info.bank_name}</span>
          </div>
          <div className="detail-item">
            <label>Account Number:</label>
            <span>{editedData.bank_info.account_number}</span>
          </div>
          <div className="detail-item">
            <label>Account Title:</label>
            <span>{editedData.bank_info.account_title}</span>
          </div>
          <div className="detail-item">
            <label>Branch:</label>
            <span>{editedData.bank_info.branch}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
