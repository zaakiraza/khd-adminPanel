import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import "./ManageStatus.css";

export default function ManageStatus() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showError, showSuccess, showWarning } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [fromClass, setFromClass] = useState("");
  const [toClass, setToClass] = useState("");
  const [promotionYear, setPromotionYear] = useState("");
  const [promotionSession, setPromotionSession] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [ageCriteria, setAgeCriteria] = useState([]);
  const navigate = useNavigate();

  const classOptions = [
    "Atfaal-Awal",
    "Atfaal-doam",
    "Awwal",
    "Doam",
    "Soam",
    "Chaharum",
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear + 1, currentYear + 2];

  // Fetch sessions from backend
  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${baseURL}/session/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 200) {
        setSessions(response.data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch sessions:", e);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Initialize default age criteria
  const initializeAgeCriteria = () => {
    setAgeCriteria([
      { id: 1, minAge: "", maxAge: "", targetClass: "", enabled: true },
    ]);
  };

  const addAgeCriteria = () => {
    setAgeCriteria([
      ...ageCriteria,
      { id: Date.now(), minAge: "", maxAge: "", targetClass: "", enabled: true },
    ]);
  };

  const removeAgeCriteria = (id) => {
    setAgeCriteria(ageCriteria.filter((criteria) => criteria.id !== id));
  };

  const updateAgeCriteria = (id, field, value) => {
    setAgeCriteria(
      ageCriteria.map((criteria) =>
        criteria.id === id ? { ...criteria, [field]: value } : criteria
      )
    );
  };

  const handleFromClassChange = (value) => {
    setFromClass(value);
    if (value === "null") {
      initializeAgeCriteria();
      setToClass("");
      setPromotionYear(currentYear.toString()); // Auto-select current year
    } else {
      setAgeCriteria([]);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${baseURL}/users/all?search=${searchInput}&verified=true&status=active&application_status=accepted&limit=${limit}&page=${page}`;
      
      // Add enrolled_class filter if fromClass is selected
      if (fromClass && fromClass !== "") {
        url += `&enrolled_class=${fromClass}`;
      }
      
      const api = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (api.status === 200) {
        setStudents(api.data.data.users);
        setTotalPages(api.data.data.pagination.totalPages);
        setTotalUsers(api.data.data.pagination.totalUsers);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to fetch students");
      if (e.response && e.response.status === 403) {
        showError(e.response.data.message);
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, limit, fromClass]);

  const handlePromoteStudents = async () => {
    // Check if it's age-based promotion (Not Assigned students)
    if (fromClass === "null") {
      // Validate age criteria
      if (ageCriteria.length === 0) {
        showWarning("Please add at least one age criteria");
        return;
      }

      const invalidCriteria = ageCriteria.find(
        (criteria) =>
          !criteria.minAge ||
          !criteria.maxAge ||
          !criteria.targetClass ||
          parseInt(criteria.minAge) > parseInt(criteria.maxAge)
      );

      if (invalidCriteria) {
        showWarning("Please fill all age criteria fields correctly (Min age should be less than or equal to Max age)");
        return;
      }

      if (!promotionYear || promotionYear === "") {
        showWarning("Please select a promotion year");
        return;
      }

      if (!promotionSession || promotionSession === "") {
        showWarning("Please select a promotion session");
        return;
      }

      if (selectedStudents.length === 0) {
        showWarning("Please select at least one student to promote");
        return;
      }

      try {
        // Group students by age and assign appropriate class
        const promises = selectedStudents.map(async (studentId) => {
          const student = students.find((s) => s._id === studentId);
          const studentAge = student.personal_info.age;

          console.log("Student data:", student);

          // Find matching age criteria
          const matchingCriteria = ageCriteria.find(
            (criteria) =>
              studentAge >= parseInt(criteria.minAge) &&
              studentAge <= parseInt(criteria.maxAge)
          );

          if (!matchingCriteria) {
            throw new Error(`No age criteria matched for student age ${studentAge}`);
          }

          // Ensure all required fields have values with defaults for missing data
          const payload = {
            personal_info: {
              first_name: student.personal_info.first_name,
              last_name: student.personal_info.last_name,
              father_name: student.personal_info.father_name,
              gender: student.personal_info.gender,
              whatsapp_no: student.personal_info.whatsapp_no,
              dob: student.personal_info.dob,
              age: student.personal_info.age,
              alternative_no: student.personal_info.alternative_no || student.personal_info.whatsapp_no,
              address: student.personal_info.address,
              city: student.personal_info.city,
              country: student.personal_info.country,
              img_URL: student.personal_info.img_URL,
              doc_img: student.personal_info.doc_img,
              marj_e_taqleed: student.personal_info.marj_e_taqleed,
              enrolled_class: matchingCriteria.targetClass,
              enrolled_year: promotionYear,
            },
            guardian_info: student.guardian_info || {
              name: "Not Provided",
              relationship: "Guardian",
              email: "notprovided@example.com",
              whatsapp_no: student.personal_info.whatsapp_no,
              address: student.personal_info.address,
              CNIC: "00000-0000000-0"
            },
            academic_progress: {
              academic_class: student.academic_progress?.academic_class || "Not Assigned",
              institute_name: student.academic_progress?.institute_name || "Khuddam Learning",
              inProgress: false,
              result: student.academic_progress?.result || "Pending"
            },
            previous_madrassa: student.previous_madrassa || { name: "N/A", topic: "N/A" },
            bank_info: student.bank_info || {
              bank_name: "Not Provided",
              account_number: "0000000000",
              account_title: "Not Provided",
              branch: "N/A"
            },
          };

          console.log("Payload being sent:", payload);

          // Update personal info
          await axios.put(
            `${baseURL}/users/update_personal/${studentId}`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          // Add to class history
          const classHistoryPayload = {
            class_name: matchingCriteria.targetClass,
            year: promotionYear,
            status: "inprogress",
            session: promotionSession,
            result: "",
            repeat_count: 0,
            isCompleted: false,
          };

          console.log("Class history payload:", classHistoryPayload);

          return axios.put(
            `${baseURL}/users/update_class_history/${studentId}`,
            classHistoryPayload,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          ).catch(err => {
            console.error("Class history error:", err.response?.data || err.message);
            throw err;
          });
        });

        await Promise.all(promises);
        showSuccess(`Successfully promoted ${selectedStudents.length} student(s) based on age criteria!`);
        setSelectedStudents([]);
        fetchStudents();
      } catch (e) {
        showError(e.response?.data?.message || e.message || "Failed to promote students");
      }
    } else {
      // Normal class-to-class promotion
      if (!toClass || toClass === "") {
        showWarning("Please select a 'To Class'");
        return;
      }

      if (!promotionYear || promotionYear === "") {
        showWarning("Please select a promotion year");
        return;
      }

      if (!promotionSession || promotionSession === "") {
        showWarning("Please select a promotion session");
        return;
      }

      if (selectedStudents.length === 0) {
        showWarning("Please select at least one student to promote");
        return;
      }

      try {
        // Promote each selected student
        const promises = selectedStudents.map(async (studentId) => {
          const student = students.find((s) => s._id === studentId);

          const payload = {
            personal_info: {
              first_name: student.personal_info.first_name,
              last_name: student.personal_info.last_name,
              father_name: student.personal_info.father_name,
              gender: student.personal_info.gender,
              whatsapp_no: student.personal_info.whatsapp_no,
              dob: student.personal_info.dob,
              age: student.personal_info.age,
              alternative_no: student.personal_info.alternative_no,
              address: student.personal_info.address,
              city: student.personal_info.city,
              country: student.personal_info.country,
              img_URL: student.personal_info.img_URL,
              doc_img: student.personal_info.doc_img,
              marj_e_taqleed: student.personal_info.marj_e_taqleed,
              enrolled_class: toClass,
              enrolled_year: promotionYear,
            },
            guardian_info: student.guardian_info,
            academic_progress: student.academic_progress,
            previous_madrassa: student.previous_madrassa || { name: "", topic: "" },
            bank_info: student.bank_info,
          };

          // Update personal info
          await axios.put(
            `${baseURL}/users/update_personal/${studentId}`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          // Add to class history
          const classHistoryPayload = {
            class_name: toClass,
            year: promotionYear,
            status: "inprogress",
            session: promotionSession,
            result: "",
            repeat_count: 0,
            isCompleted: false,
          };
          console.log(classHistoryPayload);
          return axios.put(
            `${baseURL}/users/update_class_history/${studentId}`,
            classHistoryPayload,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        });

        await Promise.all(promises);
        showSuccess(`Successfully promoted ${selectedStudents.length} student(s)!`);
        setSelectedStudents([]);
        fetchStudents();
      } catch (e) {
        showError(e.response?.data?.message || "Failed to promote students");
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(students.map((student) => student._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const checkforEmpty = (value) => {
    if (
      value === null ||
      value === undefined ||
      value.trim() === ""
    ) {
      // Reset filter - fetch all students without search
      setSearchInput("");
      fetchStudents();
      return true;
    }
    if (value.trim().length < 3) {
      showWarning("Please enter at least 3 characters to search");
      return true;
    }
    fetchStudents();
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // If input is cleared, reset the filter
    if (value.trim() === "") {
      fetchStudents();
    }
  };

  return (
    <section className="container">
      <div className="heading">
        <h1>Manage Student Status</h1>
      </div>
      <div className="status-info">
        <p className="info-badge">
          <i className="fa-solid fa-info-circle"></i>
          Showing students with: <strong>Application Accepted</strong>, <strong>Active</strong>, and <strong>Verified</strong>
        </p>
      </div>

      {/* Promotion Section */}
      <div className="promotion-section">
        <h2>
          <i className="fa-solid fa-graduation-cap"></i> Promote Students
        </h2>
        <div className="promotion-controls">
          <div className="promotion-filter">
            <label htmlFor="fromClass">From Class:</label>
            <select
              id="fromClass"
              value={fromClass}
              onChange={(e) => handleFromClassChange(e.target.value)}
            >
              <option value="">-- All Classes --</option>
              <option value="null">Not Assigned</option>
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Show age criteria when "Not Assigned" is selected */}
          {fromClass === "null" ? (
            <>
              <button
                className="promote-btn"
                onClick={handlePromoteStudents}
                disabled={selectedStudents.length === 0}
              >
                <i className="fa-solid fa-arrow-up"></i> Promote Selected ({selectedStudents.length})
              </button>
            </>
          ) : (
            <>
              <div className="promotion-filter">
                <label htmlFor="toClass">To Class:</label>
                <select
                  id="toClass"
                  value={toClass}
                  onChange={(e) => setToClass(e.target.value)}
                >
                  <option value="">-- Select Class --</option>
                  {classOptions.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="promotion-filter">
                <label htmlFor="promotionYear">Year:</label>
                <select
                  id="promotionYear"
                  value={promotionYear}
                  onChange={(e) => setPromotionYear(e.target.value)}
                >
                  <option value="">-- Select Year --</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="promotion-filter">
                <label htmlFor="promotionSession">Session:</label>
                <select
                  id="promotionSession"
                  value={promotionSession}
                  onChange={(e) => setPromotionSession(e.target.value)}
                >
                  <option value="">-- Select Session --</option>
                  {sessions.map((session) => (
                    <option key={session._id} value={session.session_name}>
                      {session.session_name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="promote-btn"
                onClick={handlePromoteStudents}
                disabled={selectedStudents.length === 0}
              >
                <i className="fa-solid fa-arrow-up"></i> Promote Selected ({selectedStudents.length})
              </button>
            </>
          )}
        </div>

        {/* Age Criteria Section - Only show when "Not Assigned" is selected */}
        {fromClass === "null" && (
          <div className="age-criteria-section">
            <h3>
              <i className="fa-solid fa-calendar"></i> Age-Based Promotion Criteria
            </h3>
            
            {/* Year Selection for Age-Based Promotion */}
            <div className="promotion-filter">
              <label>Promotion Year:</label>
              <select
                value={promotionYear}
                onChange={(e) => setPromotionYear(e.target.value)}
              >
                <option value="">Select Year</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Selection for Age-Based Promotion */}
            <div className="promotion-filter">
              <label>Promotion Session:</label>
              <select
                value={promotionSession}
                onChange={(e) => setPromotionSession(e.target.value)}
              >
                <option value="">Select Session</option>
                {sessions.map((session) => (
                  <option key={session._id} value={session.session_name}>
                    {session.session_name}
                  </option>
                ))}
              </select>
            </div>
            
            {ageCriteria.map((criteria, index) => (
              <div key={criteria.id} className="age-criteria-row">
                <div className="age-input-group">
                  <label>From Age:</label>
                  <input
                    type="number"
                    min="9"
                    max="19"
                    value={criteria.minAge}
                    onChange={(e) => updateAgeCriteria(criteria.id, "minAge", e.target.value)}
                    placeholder="e.g., 9"
                  />
                </div>
                <div className="age-input-group">
                  <label>To Age:</label>
                  <input
                    type="number"
                    min="9"
                    max="19"
                    value={criteria.maxAge}
                    onChange={(e) => updateAgeCriteria(criteria.id, "maxAge", e.target.value)}
                    placeholder="e.g., 13"
                  />
                </div>
                <div className="age-input-group">
                  <label>Target Class:</label>
                  <select
                    value={criteria.targetClass}
                    onChange={(e) => updateAgeCriteria(criteria.id, "targetClass", e.target.value)}
                  >
                    <option value="">-- Select Class --</option>
                    {classOptions.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                {ageCriteria.length > 1 && (
                  <button
                    className="remove-criteria-btn"
                    onClick={() => removeAgeCriteria(criteria.id)}
                    title="Remove this criteria"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                )}
              </div>
            ))}
            <button className="add-criteria-btn" onClick={addAgeCriteria}>
              <i className="fa-solid fa-plus"></i> Add Age Criteria
            </button>
          </div>
        )}
        
        {/* Selection Controls */}
        <div className="selection-controls">
          <button
            className="select-all-btn"
            onClick={() => setSelectedStudents(students.map((student) => student._id))}
            disabled={students.length === 0}
          >
            <i className="fa-solid fa-check-double"></i> Select All
          </button>
          <button
            className="unselect-all-btn"
            onClick={() => setSelectedStudents([])}
            disabled={selectedStudents.length === 0}
          >
            <i className="fa-solid fa-times"></i> Unselect All
          </button>
        </div>
      </div>

      <div className="extras">
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            style={{ cursor: page === 1 ? "not-allowed" : "pointer" }}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page === totalPages}
            style={{ cursor: page === totalPages ? "not-allowed" : "pointer" }}
          >
            Next
          </button>
        </div>
        <div className="limithandle">
          <p>
            records: <strong>{totalUsers}</strong>
          </p>
          <label htmlFor="limit">Records per page: </label>
          <select
            name="limit"
            id="limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={80}>80</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      <div className="search">
        <input
          type="text"
          placeholder="Search by Name, Email, Phone Number"
          value={searchInput}
          onChange={handleSearchInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") checkforEmpty(searchInput);
          }}
        />
        <button onClick={() => checkforEmpty(searchInput)}>
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedStudents.length === students.length && students.length > 0}
              />
            </th>
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Father Name</th>
            <th>Age</th>
            <th>Phone</th>
            <th>Current Class</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", color: "red" }}>
                {error}
              </td>
            </tr>
          ) : students.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No students found matching the criteria
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student.personal_info.rollNo}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student._id)}
                    onChange={() => handleSelectStudent(student._id)}
                  />
                </td>
                <td>{student.personal_info.rollNo}</td>
                <td>
                  {student.personal_info.first_name}{" "}
                  {student.personal_info.last_name}
                </td>
                <td>{student.personal_info.father_name}</td>
                <td>{student.personal_info.age}</td>
                <td>{student.personal_info.whatsapp_no}</td>
                <td>
                  {student.personal_info.enrolled_class === "null" ? (
                    <span className="no-class-badge">Not Assigned</span>
                  ) : (
                    <span className="class-badge">
                      {student.personal_info.enrolled_class}
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}
