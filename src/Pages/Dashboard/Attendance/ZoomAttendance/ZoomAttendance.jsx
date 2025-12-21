import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../../../../components/common/Toast/ToastContext";
import * as XLSX from "xlsx";
import "./ZoomAttendance.css";

export default function ZoomAttendance() {
  const baseURL = import.meta.env.VITE_BASEURL;
  const { showError, showSuccess, showWarning } = useToast();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [matchedStudents, setMatchedStudents] = useState([]);
  const [unmatchedNames, setUnmatchedNames] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Confirm
  const navigate = useNavigate();

  // Fetch active classes
  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${baseURL}/class/all?isActive=true`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 200) {
        setClasses(response.data.data);
      }
    } catch (e) {
      showError("Failed to fetch classes");
      if (e.response && e.response.status === 403) {
        navigate("/");
      }
    }
  };

  // Fetch students by class
  const fetchStudents = async (className) => {
    if (!className) return [];
    
    try {
      const response = await axios.get(
        `${baseURL}/users/all?enrolled_class=${className}&status=active&application_status=accepted&verified=true&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        return response.data.data.users || [];
      }
    } catch (e) {
      console.error("Failed to fetch students:", e);
    }
    return [];
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass).then(setStudents);
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  // Parse Excel file
  const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON array
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          
          if (jsonData.length < 2) {
            resolve([]);
            return;
          }

          // Find header row (first row)
          const headers = jsonData[0].map(h => String(h).toLowerCase().trim().replace(/"/g, ''));
          
          let nameIndex = 0;
          let durationIndex = -1;
          let joinTimeIndex = -1;
          let leaveTimeIndex = -1;

          // Common Zoom Excel headers
          headers.forEach((header, index) => {
            const headerStr = String(header).toLowerCase();
            if (headerStr.includes('name') || headerStr.includes('participant')) {
              nameIndex = index;
            }
            if (headerStr.includes('duration') || headerStr.includes('time in meeting')) {
              durationIndex = index;
            }
            if (headerStr.includes('join time') || headerStr.includes('joined')) {
              joinTimeIndex = index;
            }
            if (headerStr.includes('leave time') || headerStr.includes('left')) {
              leaveTimeIndex = index;
            }
          });

          const participants = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length > nameIndex) {
              const name = String(row[nameIndex] || '').trim();
              const duration = durationIndex >= 0 ? String(row[durationIndex] || '').trim() : '';
              const joinTime = joinTimeIndex >= 0 ? String(row[joinTimeIndex] || '').trim() : '';
              const leaveTime = leaveTimeIndex >= 0 ? String(row[leaveTimeIndex] || '').trim() : '';
              
              if (name) {
                participants.push({
                  name,
                  duration: parseDuration(duration),
                  joinTime,
                  leaveTime,
                  originalRow: row.join(',')
                });
              }
            }
          }
          resolve(participants);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Parse CSV file
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Try to detect header row
    const headerLine = lines[0].toLowerCase();
    let nameIndex = 0;
    let durationIndex = -1;
    let joinTimeIndex = -1;
    let leaveTimeIndex = -1;

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    // Common Zoom CSV headers
    headers.forEach((header, index) => {
      if (header.includes('name') || header.includes('participant')) {
        nameIndex = index;
      }
      if (header.includes('duration') || header.includes('time in meeting')) {
        durationIndex = index;
      }
      if (header.includes('join time') || header.includes('joined')) {
        joinTimeIndex = index;
      }
      if (header.includes('leave time') || header.includes('left')) {
        leaveTimeIndex = index;
      }
    });

    const participants = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length > nameIndex) {
        const name = values[nameIndex]?.replace(/"/g, '').trim();
        const duration = durationIndex >= 0 ? values[durationIndex]?.replace(/"/g, '').trim() : '';
        const joinTime = joinTimeIndex >= 0 ? values[joinTimeIndex]?.replace(/"/g, '').trim() : '';
        const leaveTime = leaveTimeIndex >= 0 ? values[leaveTimeIndex]?.replace(/"/g, '').trim() : '';
        
        if (name) {
          participants.push({
            name,
            duration: parseDuration(duration),
            joinTime,
            leaveTime,
            originalRow: lines[i]
          });
        }
      }
    }
    return participants;
  };

  // Parse CSV line handling quoted values
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Parse duration string to minutes
  const parseDuration = (durationStr) => {
    if (!durationStr) return 0;
    
    // Handle "X mins" or "X minutes" format
    const minsMatch = durationStr.match(/(\d+)\s*min/i);
    if (minsMatch) return parseInt(minsMatch[1]);
    
    // Handle "HH:MM:SS" format
    const timeMatch = durationStr.match(/(\d+):(\d+):?(\d+)?/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]) || 0;
      const mins = parseInt(timeMatch[2]) || 0;
      return hours * 60 + mins;
    }
    
    // Handle plain number (assume minutes)
    const num = parseInt(durationStr);
    return isNaN(num) ? 0 : num;
  };

  // Match Zoom participants to enrolled students
  const matchStudents = (participants, enrolledStudents) => {
    const matched = [];
    const unmatched = [];
    
    // Create a map for easier lookup
    const studentMap = new Map();
    enrolledStudents.forEach(student => {
      const fullName = `${student.personal_info.first_name} ${student.personal_info.last_name}`.toLowerCase();
      const firstName = student.personal_info.first_name.toLowerCase();
      const lastName = student.personal_info.last_name.toLowerCase();
      
      studentMap.set(fullName, student);
      studentMap.set(firstName, student);
      studentMap.set(`${firstName} ${lastName}`, student);
      studentMap.set(`${lastName} ${firstName}`, student);
    });

    // Track which students have been matched
    const matchedStudentIds = new Set();

    participants.forEach(participant => {
      const participantName = participant.name.toLowerCase().trim();
      
      // Try exact match first
      let matchedStudent = studentMap.get(participantName);
      
      // Try partial match if no exact match
      if (!matchedStudent) {
        for (const student of enrolledStudents) {
          const fullName = `${student.personal_info.first_name} ${student.personal_info.last_name}`.toLowerCase();
          const firstName = student.personal_info.first_name.toLowerCase();
          const lastName = student.personal_info.last_name.toLowerCase();
          
          if (
            participantName.includes(firstName) ||
            participantName.includes(lastName) ||
            fullName.includes(participantName) ||
            firstName.includes(participantName) ||
            lastName.includes(participantName)
          ) {
            matchedStudent = student;
            break;
          }
        }
      }

      if (matchedStudent && !matchedStudentIds.has(matchedStudent._id)) {
        matchedStudentIds.add(matchedStudent._id);
        matched.push({
          student: matchedStudent,
          zoomName: participant.name,
          duration: participant.duration,
          joinTime: participant.joinTime,
          leaveTime: participant.leaveTime,
          status: participant.duration >= 30 ? 'present' : 'late', // 30+ mins = present, less = late
          manualStatus: null
        });
      } else if (!matchedStudent) {
        unmatched.push(participant.name);
      }
    });

    // Add absent students (enrolled but not in Zoom)
    enrolledStudents.forEach(student => {
      if (!matchedStudentIds.has(student._id)) {
        matched.push({
          student,
          zoomName: null,
          duration: 0,
          joinTime: null,
          leaveTime: null,
          status: 'absent',
          manualStatus: null
        });
      }
    });

    return { matched, unmatched };
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      const isValidFile = fileName.endsWith('.csv') || 
                         fileName.endsWith('.xlsx') || 
                         fileName.endsWith('.xls');
      if (!isValidFile) {
        showWarning("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleParseFile = async () => {
    if (!file) {
      showWarning("Please select a file first");
      return;
    }
    if (!selectedClass) {
      showWarning("Please select a class first");
      return;
    }

    setParsing(true);
    try {
      const fileName = file.name.toLowerCase();
      let participants = [];

      // Detect file type and parse accordingly
      if (fileName.endsWith('.csv')) {
        const text = await file.text();
        participants = parseCSV(text);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        participants = await parseExcel(file);
      } else {
        showError("Unsupported file format. Please upload a CSV or Excel file.");
        setParsing(false);
        return;
      }
      
      if (participants.length === 0) {
        showError("No participants found in the file. Please check the file format.");
        setParsing(false);
        return;
      }

      setParsedData(participants);
      
      // Fetch students if not already loaded
      let enrolledStudents = students;
      if (students.length === 0) {
        enrolledStudents = await fetchStudents(selectedClass);
        setStudents(enrolledStudents);
      }

      const { matched, unmatched } = matchStudents(participants, enrolledStudents);
      setMatchedStudents(matched);
      setUnmatchedNames(unmatched);
      
      showSuccess(`Parsed ${participants.length} participants from Zoom report`);
      setStep(2);
    } catch (error) {
      showError("Failed to parse file: " + error.message);
    } finally {
      setParsing(false);
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    setMatchedStudents(prev => prev.map(item => 
      item.student._id === studentId 
        ? { ...item, status: newStatus, manualStatus: newStatus }
        : item
    ));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedDate) {
      showWarning("Please select class and date");
      return;
    }

    setSaving(true);
    try {
      const selectedClassData = classes.find(cls => cls.class_name === selectedClass);
      
      const attendanceData = {
        class_id: selectedClassData._id,
        class_name: selectedClass,
        date: selectedDate,
        attendance: matchedStudents.map(item => ({
          student_id: item.student._id,
          status: item.status
        })),
        source: 'zoom',
        zoom_data: matchedStudents.map(item => ({
          student_id: item.student._id,
          zoom_name: item.zoomName,
          duration: item.duration,
          join_time: item.joinTime,
          leave_time: item.leaveTime
        }))
      };

      const response = await axios.post(
        `${baseURL}/attendance/zoom`,
        attendanceData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        showSuccess(response.data.message || "Zoom attendance saved successfully!");
        // Reset form
        setStep(1);
        setFile(null);
        setParsedData([]);
        setMatchedStudents([]);
        setUnmatchedNames([]);
        setSelectedClass("");
      }
    } catch (e) {
      showError(e.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const resetUpload = () => {
    setStep(1);
    setFile(null);
    setParsedData([]);
    setMatchedStudents([]);
    setUnmatchedNames([]);
  };

  return (
    <section className="zoom-attendance-container">
      <div className="heading">
        <h1>
          <i className="fa-solid fa-video"></i> Zoom Attendance Upload
        </h1>
        <p className="subtitle">Upload Zoom participant report to mark attendance automatically</p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <span>Upload File</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <span>Review & Match</span>
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <span>Save</span>
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="upload-section">
          <div className="upload-card">
            <div className="upload-instructions">
              <h3><i className="fa-solid fa-info-circle"></i> How to export Zoom attendance:</h3>
              <ol>
                <li>Go to your Zoom account at <strong>zoom.us</strong></li>
                <li>Navigate to <strong>Reports → Usage Reports → Meeting</strong></li>
                <li>Find your class meeting and click on <strong>Participants</strong></li>
                <li>Click <strong>Export with meeting data</strong> to download CSV or Excel file</li>
              </ol>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><i className="fa-solid fa-users"></i> Select Class *</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">-- Select Class --</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls.class_name}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label><i className="fa-solid fa-calendar"></i> Date *</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="file-upload-area">
              <input
                type="file"
                id="zoom-csv"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="zoom-csv" className="file-label">
                <i className="fa-solid fa-cloud-upload-alt"></i>
                <span>{file ? file.name : 'Click or drag to upload Zoom attendance file'}</span>
                <small>Supported formats: CSV, Excel (.xlsx, .xls)</small>
              </label>
            </div>

            <button
              className="parse-btn"
              onClick={handleParseFile}
              disabled={!file || !selectedClass || parsing}
            >
              {parsing ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Parsing...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-file-import"></i> Parse & Match Students
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="review-section">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card total">
              <i className="fa-solid fa-users"></i>
              <div className="summary-info">
                <span className="summary-number">{students.length}</span>
                <span className="summary-label">Enrolled Students</span>
              </div>
            </div>
            <div className="summary-card present">
              <i className="fa-solid fa-check-circle"></i>
              <div className="summary-info">
                <span className="summary-number">{matchedStudents.filter(s => s.status === 'present').length}</span>
                <span className="summary-label">Present</span>
              </div>
            </div>
            <div className="summary-card late">
              <i className="fa-solid fa-clock"></i>
              <div className="summary-info">
                <span className="summary-number">{matchedStudents.filter(s => s.status === 'late').length}</span>
                <span className="summary-label">Late</span>
              </div>
            </div>
            <div className="summary-card absent">
              <i className="fa-solid fa-times-circle"></i>
              <div className="summary-info">
                <span className="summary-number">{matchedStudents.filter(s => s.status === 'absent').length}</span>
                <span className="summary-label">Absent</span>
              </div>
            </div>
          </div>

          {/* Unmatched Names Warning */}
          {unmatchedNames.length > 0 && (
            <div className="warning-card">
              <h4><i className="fa-solid fa-exclamation-triangle"></i> Unmatched Zoom Names ({unmatchedNames.length})</h4>
              <p>The following names from Zoom could not be matched to enrolled students:</p>
              <div className="unmatched-list">
                {unmatchedNames.map((name, idx) => (
                  <span key={idx} className="unmatched-tag">{name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Attendance Table */}
          <div className="attendance-table-container">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Zoom Name</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {matchedStudents.map((item) => (
                  <tr key={item.student._id} className={`status-${item.status}`}>
                    <td>{item.student.personal_info.rollNo}</td>
                    <td>
                      <strong>
                        {item.student.personal_info.first_name} {item.student.personal_info.last_name}
                      </strong>
                    </td>
                    <td>
                      {item.zoomName ? (
                        <span className="zoom-name">{item.zoomName}</span>
                      ) : (
                        <span className="not-joined">Not in Zoom</span>
                      )}
                    </td>
                    <td>
                      {item.duration > 0 ? (
                        <span className="duration-badge">{item.duration} mins</span>
                      ) : (
                        <span className="duration-zero">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${item.status}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="status-controls">
                        <button
                          className={`status-btn present ${item.status === 'present' ? 'active' : ''}`}
                          onClick={() => handleStatusChange(item.student._id, 'present')}
                          title="Mark Present"
                        >
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button
                          className={`status-btn late ${item.status === 'late' ? 'active' : ''}`}
                          onClick={() => handleStatusChange(item.student._id, 'late')}
                          title="Mark Late"
                        >
                          <i className="fa-solid fa-clock"></i>
                        </button>
                        <button
                          className={`status-btn absent ${item.status === 'absent' ? 'active' : ''}`}
                          onClick={() => handleStatusChange(item.student._id, 'absent')}
                          title="Mark Absent"
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-secondary" onClick={resetUpload}>
              <i className="fa-solid fa-arrow-left"></i> Back to Upload
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSaveAttendance}
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-save"></i> Save Attendance
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

