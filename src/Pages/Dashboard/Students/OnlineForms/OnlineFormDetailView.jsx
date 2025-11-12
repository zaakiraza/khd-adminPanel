import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./OnlineForms.css";

export default function OnlineFormDetailView() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleAccept = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to accept the application for ${student.personal_info.first_name} ${student.personal_info.last_name}?`
    );

    if (!confirmed) return;

    try {
      const api = await axios.put(
        `${baseURL}/users/update_application_status/${id}`,
        { application_status: "accepted" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (api.status === 200) {
        showSuccess("Application accepted successfully!");
        navigate("/dashboard/students/online-forms");
      }
    } catch (error) {
      console.error("Error accepting application:", error);
      showError("Error accepting application. Please try again.");
    }
  };

  const handleReject = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to reject the application for ${student.personal_info.first_name} ${student.personal_info.last_name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const api = await axios.put(
        `${baseURL}/users/update_application_status/${id}`,
        { application_status: "rejected" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (api.status === 200) {
        showSuccess("Application rejected successfully!");
        navigate("/dashboard/students/online-forms");
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      showError("Error rejecting application. Please try again.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(student); // Reset to original data
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

  const handleSaveChanges = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to save these changes?"
    );

    if (!confirmed) return;

    try {
      const api = await axios.put(`${baseURL}/users/update_personal/${id}`, editedData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (api.status === 200) {
        showSuccess("Student data updated successfully!");
        setStudent(editedData);
        setIsEditing(false);
        fetchStudentDetails(); // Refresh data
      }
    } catch (error) {
      console.error("Error updating student data:", error);
      showError(
        error.response?.data?.message ||
          "Error updating student data. Please try again."
      );
    }
  };

  const uploadImage = async (fileInput, folderName) => {
    if (!fileInput) return null;

    // Check if environment variables are loaded
    if (!UPLOAD_PRESET || !CLOUD_NAME) {
      console.error("Cloudinary credentials not found:", {
        UPLOAD_PRESET,
        CLOUD_NAME,
      });
      showError(
        "Cloudinary configuration is missing. Please check environment variables."
      );
      return null;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(fileInput.type)) {
      showError("Please upload a valid image file (JPEG, PNG, or GIF)");
      return null;
    }

    // Validate file size (max 5MB)
    if (fileInput.size > 5 * 1024 * 1024) {
      showError("Image size should be less than 5MB");
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
        return data.secure_url;
      } else if (data.error) {
        console.error("Cloudinary error:", data.error);
        showError(`Upload failed: ${data.error.message}`);
        return null;
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showError("Failed to upload image. Please try again.");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  if (loading) {
    return (
      <section className="container">
        <div className="heading">
          <h1>Application Details</h1>
        </div>
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container">
        <div className="heading">
          <h1>Application Details</h1>
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
          <h1>Application Details</h1>
        </div>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Application not found
        </div>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </section>
    );
  }

  return (
    <section className="container">
      <div className="heading">
        <h1>Application Details - Review</h1>
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="action-button edit-button"
              >
                <i className="fa-solid fa-edit"></i> Edit
              </button>
              <button
                onClick={handleAccept}
                className="action-button accept-button"
              >
                <i className="fa-solid fa-check"></i> Accept
              </button>
              <button
                onClick={handleReject}
                className="action-button reject-button"
              >
                <i className="fa-solid fa-times"></i> Reject
              </button>
              <button
                onClick={() => navigate(-1)}
                className="action-button back-button"
              >
                <i className="fa-solid fa-arrow-left"></i> Back
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSaveChanges}
                className="action-button save-button"
              >
                <i className="fa-solid fa-save"></i> Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="action-button cancel-button"
              >
                <i className="fa-solid fa-times"></i> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="student-detail-view">
        {/* Profile Image */}
        <div className="detail-section">
          <h2>Profile Picture</h2>
          <div className="profile-image-container">
            {editedData?.personal_info?.img_URL ? (
              <img
                src={editedData.personal_info.img_URL}
                alt={`${editedData.personal_info.first_name} ${editedData.personal_info.last_name}`}
                className="profile-image"
              />
            ) : (
              <div className="no-image-placeholder">
                <i
                  className="fa-solid fa-user"
                  style={{ fontSize: "80px", color: "#ccc" }}
                ></i>
              </div>
            )}
            {isEditing && (
              <div className="image-upload-controls">
                <label htmlFor="image-upload" className="upload-button">
                  <i className="fa-solid fa-camera"></i>
                  {uploadingImage ? "Uploading..." : "Change Photo"}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => uploadImage(e.target.files[0], "User Pics")}
                  disabled={uploadingImage}
                  style={{ display: "none" }}
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
              <strong>Roll No:</strong>
              <span>{student.personal_info?.rollNo || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>First Name:</strong>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.personal_info?.first_name || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "personal_info",
                      "first_name",
                      e.target.value
                    )
                  }
                  className="edit-input"
                />
              ) : (
                <span>{student.personal_info?.first_name || "N/A"}</span>
              )}
            </div>
            <div className="detail-item">
              <strong>Last Name:</strong>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.personal_info?.last_name || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "personal_info",
                      "last_name",
                      e.target.value
                    )
                  }
                  className="edit-input"
                />
              ) : (
                <span>{student.personal_info?.last_name || "N/A"}</span>
              )}
            </div>
            <div className="detail-item">
              <strong>Father Name:</strong>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.personal_info?.father_name || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "personal_info",
                      "father_name",
                      e.target.value
                    )
                  }
                  className="edit-input"
                />
              ) : (
                <span>{student.personal_info?.father_name || "N/A"}</span>
              )}
            </div>
            <div className="detail-item">
              <strong>Gender:</strong>
              {isEditing ? (
                <select
                  value={editedData.personal_info?.gender || ""}
                  onChange={(e) =>
                    handleInputChange("personal_info", "gender", e.target.value)
                  }
                  className="edit-input"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              ) : (
                <span>{student.personal_info?.gender || "N/A"}</span>
              )}
            </div>
            <div className="detail-item">
              <strong>Date of Birth:</strong>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.personal_info?.dob || ""}
                  onChange={(e) =>
                    handleInputChange("personal_info", "dob", e.target.value)
                  }
                  className="edit-input"
                  placeholder="YYYY/MM/DD"
                />
              ) : (
                <span>{student.personal_info?.dob || "N/A"}</span>
              )}
            </div>
            <div className="detail-item">
              <strong>Age:</strong>
              {isEditing ? (
                <input
                  type="number"
                  value={editedData.personal_info?.age || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "personal_info",
                      "age",
                      Number(e.target.value)
                    )
                  }
                  className="edit-input"
                />
              ) : (
                <span
                  style={{
                    backgroundColor:
                      student.personal_info?.age > 19 ||
                      student.personal_info?.age < 9
                        ? "#f8d7da"
                        : "white",
                    color:
                      student.personal_info?.age > 19 ||
                      student.personal_info?.age < 9
                        ? "#721c24"
                        : "#333",
                    fontWeight:
                      student.personal_info?.age > 19 ||
                      student.personal_info?.age < 9
                        ? "bold"
                        : "normal",
                  }}
                >
                  {student.personal_info?.age || "N/A"}
                  {(student.personal_info?.age > 19 ||
                    student.personal_info?.age < 9) &&
                    " ⚠️"}
                </span>
              )}
            </div>
            <div className="detail-item">
              <strong>CNIC:</strong>
              <span>{student.personal_info?.CNIC || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>WhatsApp No:</strong>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.personal_info?.whatsapp_no || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "personal_info",
                      "whatsapp_no",
                      e.target.value
                    )
                  }
                  className="edit-input"
                />
              ) : (
                <span>{student.personal_info?.whatsapp_no || "N/A"}</span>
              )}
            </div>
            <div className="detail-item">
              <strong>Alternative No:</strong>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.personal_info?.alternative_no || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "personal_info",
                      "alternative_no",
                      e.target.value
                    )
                  }
                  className="edit-input"
                />
              ) : (
                <span>{student.personal_info?.alternative_no || "N/A"}</span>
              )}
            </div>
            <div className="detail-item">
              <strong>Email:</strong>
              <span>{student.personal_info?.email || "N/A"}</span>
            </div>
            <div className="detail-item">
              <strong>Marj-e-Taqleed:</strong>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.personal_info?.marj_e_taqleed || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "personal_info",
                      "marj_e_taqleed",
                      e.target.value
                    )
                  }
                  className="edit-input"
                />
              ) : (
                <span>{student.personal_info?.marj_e_taqleed || "N/A"}</span>
              )}
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
              <span
                className={`status-badge ${student.personal_info?.application_status}`}
              >
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
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.personal_info?.address || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "personal_info",
                      "address",
                      e.target.value
                    )
                  }
                  className="edit-input"
                />
              ) : (
                <span>{student.personal_info?.address || "N/A"}</span>
              )}
            </div>
            <div className="detail-item">
              <strong>City:</strong>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.personal_info?.city || ""}
                  onChange={(e) =>
                    handleInputChange("personal_info", "city", e.target.value)
                  }
                  className="edit-input"
                />
              ) : (
                <span>{student.personal_info?.city || "N/A"}</span>
              )}
            </div>
            <div className="detail-item">
              <strong>Country:</strong>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.personal_info?.country || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "personal_info",
                      "country",
                      e.target.value
                    )
                  }
                  className="edit-input"
                />
              ) : (
                <span>{student.personal_info?.country || "N/A"}</span>
              )}
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
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.guardian_info?.name || ""}
                    onChange={(e) =>
                      handleInputChange("guardian_info", "name", e.target.value)
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>{student.guardian_info?.name || "N/A"}</span>
                )}
              </div>
              <div className="detail-item">
                <strong>Relationship:</strong>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.guardian_info?.relationship || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "guardian_info",
                        "relationship",
                        e.target.value
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>{student.guardian_info?.relationship || "N/A"}</span>
                )}
              </div>
              <div className="detail-item">
                <strong>Email:</strong>
                <span>{student.guardian_info?.email || "N/A"}</span>
              </div>
              <div className="detail-item">
                <strong>WhatsApp No:</strong>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.guardian_info?.whatsapp_no || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "guardian_info",
                        "whatsapp_no",
                        e.target.value
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>{student.guardian_info?.whatsapp_no || "N/A"}</span>
                )}
              </div>
              <div className="detail-item">
                <strong>CNIC:</strong>
                <span>{student.guardian_info?.CNIC || "N/A"}</span>
              </div>
              <div className="detail-item">
                <strong>Address:</strong>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.guardian_info?.address || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "guardian_info",
                        "address",
                        e.target.value
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>{student.guardian_info?.address || "N/A"}</span>
                )}
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
                {isEditing ? (
                  <input
                    type="number"
                    value={editedData.academic_progress?.academic_class || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "academic_progress",
                        "academic_class",
                        Number(e.target.value)
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>
                    {student.academic_progress?.academic_class || "N/A"}
                  </span>
                )}
              </div>
              <div className="detail-item">
                <strong>Institute Name:</strong>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.academic_progress?.institute_name || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "academic_progress",
                        "institute_name",
                        e.target.value
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>
                    {student.academic_progress?.institute_name || "N/A"}
                  </span>
                )}
              </div>
              <div className="detail-item">
                <strong>In Progress:</strong>
                {isEditing ? (
                  <select
                    value={
                      editedData.academic_progress?.inProgress
                        ? "true"
                        : "false"
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "academic_progress",
                        "inProgress",
                        e.target.value === "true"
                      )
                    }
                    className="edit-input"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <span>
                    {student.academic_progress?.inProgress ? "Yes" : "No"}
                  </span>
                )}
              </div>
              <div className="detail-item">
                <strong>Result:</strong>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.academic_progress?.result || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "academic_progress",
                        "result",
                        e.target.value
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>{student.academic_progress?.result || "N/A"}</span>
                )}
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
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.previous_madrassa?.name || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "previous_madrassa",
                        "name",
                        e.target.value
                      )
                    }
                    className="edit-input"
                  />
                ) : (
                  <span>{student.previous_madrassa?.name || "N/A"}</span>
                )}
              </div>
              <div className="detail-item">
                <strong>Topic:</strong>
                {isEditing ? (
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
                    className="edit-input"
                  />
                ) : (
                  <span>{student.previous_madrassa?.topic || "N/A"}</span>
                )}
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
