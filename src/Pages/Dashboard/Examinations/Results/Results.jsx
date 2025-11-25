import React, { useState, useEffect } from "react";
import axios from "axios";
import {useToast} from "../../../../components/common/Toast/ToastContext";
import "./Results.css";

export default function Results() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showSuccess, showError, showWarning } = useToast();

  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState({}); // Map student_id -> result object

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentExamDetails, setCurrentExamDetails] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchExams(selectedClass);
    } else {
      setExams([]);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${baseURL}/class/all?isActive=true`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setClasses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchExams = async (classId) => {
    try {
      const response = await axios.get(`${baseURL}/exam-schedule?class_id=${classId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setExams(response.data.data || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const handleFetchData = async () => {
    if (!selectedExam) {
      showWarning("Please select an exam");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Get Exam Details
      const examDetail = exams.find(e => e._id === selectedExam);
      setCurrentExamDetails(examDetail);

      // Get Students of the class
      const studentsRes = await axios.get(`${baseURL}/class/enrolled-students?class_id=${selectedClass}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const studentList = studentsRes.data.data || [];
      setStudents(studentList);

      // Get Existing Results
      const resultsRes = await axios.get(`${baseURL}/result/exam/${selectedExam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Map results by student_id for easy access
      const resultMap = {};
      resultsRes.data.data.forEach(r => {
        resultMap[r.student_id] = r;
      });
      setResults(resultMap);

    } catch (error) {
      showError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (studentId, field, value) => {
    setResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
        isModified: true // Flag to track changes
      }
    }));
  };

  const saveResult = async (studentId) => {
    const resultData = results[studentId];
    if (!resultData || !resultData.marks_obtained) {
      showWarning("Please enter marks");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        student_id: studentId,
        exam_id: selectedExam,
        exam_name: currentExamDetails.exam_name,
        class_id: selectedClass,
        subject: currentExamDetails.subject,
        marks_obtained: resultData.marks_obtained,
        total_marks: currentExamDetails.total_marks,
        remarks: resultData.remarks || ""
      };

      if (resultData._id) {
        // Update
        await axios.put(`${baseURL}/result/${resultData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create
        const res = await axios.post(`${baseURL}/result`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Update local state with new ID
        setResults(prev => ({
          ...prev,
          [studentId]: { ...res.data.data, isModified: false }
        }));
      }
      showSuccess("Result saved");

      // Clear modified flag
      setResults(prev => ({
        ...prev,
        [studentId]: { ...prev[studentId], isModified: false }
      }));

    } catch (error) {
      showError(error.response?.data?.message || "Failed to save result");
    }
  };

  const handlePublish = async () => {
    if (!window.confirm("Are you sure you want to publish these results? Students will be able to see them.")) return;

    try {
      await axios.post(`${baseURL}/result/publish`, { exam_id: selectedExam }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      showSuccess("Results published successfully");
    } catch (error) {
      showError("Failed to publish results");
    }
  };

  const calculateGrade = (marks, total) => {
    if (!marks || !total) return "-";
    const percentage = (marks / total) * 100;
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  return (
    <div className="results-container">
      <div className="heading">
        <h1><i className="fas fa-poll"></i> Exam Results</h1>
        <p className="subtitle">Enter and manage student exam results</p>
      </div>

      <div className="selection-panel">
        <div className="selection-group">
          <label>Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedExam("");
              setStudents([]);
              setCurrentExamDetails(null);
            }}
          >
            <option value="">-- Select Class --</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>{c.class_name}</option>
            ))}
          </select>
        </div>

        <div className="selection-group">
          <label>Select Exam</label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            disabled={!selectedClass}
          >
            <option value="">-- Select Exam --</option>
            {exams.map(e => (
              <option key={e._id} value={e._id}>{e.exam_name} ({e.subject})</option>
            ))}
          </select>
        </div>

        <button
          className="fetch-btn"
          onClick={handleFetchData}
          disabled={!selectedExam}
        >
          Load Data
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading student data...</p>
        </div>
      ) : currentExamDetails && students.length > 0 ? (
        <div className="results-content">
          <div className="content-header">
            <div className="exam-info">
              <h2>{currentExamDetails.exam_name}</h2>
              <p>Subject: {currentExamDetails.subject} | Total Marks: {currentExamDetails.total_marks}</p>
            </div>
            <button className="publish-btn" onClick={handlePublish}>
              <i className="fas fa-bullhorn"></i> Publish Results
            </button>
          </div>

          <table className="results-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Marks Obtained</th>
                <th>Grade</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const result = results[student._id] || {};
                const grade = calculateGrade(result.marks_obtained, currentExamDetails.total_marks);

                return (
                  <tr key={student._id}>
                    <td>{student.roll_no || "-"}</td>
                    <td>{student.name}</td>
                    <td>
                      <input
                        type="number"
                        className="marks-input"
                        value={result.marks_obtained || ""}
                        onChange={(e) => handleInputChange(student._id, "marks_obtained", e.target.value)}
                        max={currentExamDetails.total_marks}
                        min="0"
                      />
                    </td>
                    <td>
                      <span className={`grade-badge grade-${grade.replace('+', '-plus')}`}>
                        {grade}
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="remarks-input"
                        value={result.remarks || ""}
                        onChange={(e) => handleInputChange(student._id, "remarks", e.target.value)}
                        placeholder="Optional remarks"
                      />
                    </td>
                    <td>
                      <button
                        className="save-row-btn"
                        onClick={() => saveResult(student._id)}
                        title="Save Result"
                      >
                        <i className={`fas fa-${result.isModified ? 'save' : 'check-circle'}`}></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : currentExamDetails ? (
        <div className="empty-state">
          <i className="fas fa-users-slash"></i>
          <p>No students found in this class</p>
        </div>
      ) : (
        <div className="empty-state">
          <i className="fas fa-clipboard-list"></i>
          <p>Select a class and exam to manage results</p>
        </div>
      )}
    </div>
  );
}
