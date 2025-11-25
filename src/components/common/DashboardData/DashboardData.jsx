import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import "./DashboardData.css";

function DashboardData() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeClasses: 0,
    upcomingExams: 0,
    pendingLeaves: 0,
    totalExams: 0,
    completedExams: 0,
    activeLessonPlans: 0,
    totalAssignments: 0,
  });
  const [recentExams, setRecentExams] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState({
    attendance: 0,
    examsCompleted: 0,
    assignmentsSubmitted: 0,
    lessonPlansPublished: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_BASEURL;
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate week start and end dates
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Sunday
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Saturday
      weekEnd.setHours(23, 59, 59, 999);

      // Fetch all data in parallel
      const [
        classesRes,
        usersRes,
        examsRes,
        leavesRes,
        lessonPlansRes,
        assignmentsRes,
        attendanceRes,
      ] = await Promise.all([
        api.get(`${API_BASE}/class/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`${API_BASE}/users/count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`${API_BASE}/exam-schedule`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get(`${API_BASE}/leave?status=pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),
        api.get(`${API_BASE}/lesson-plan?status=published`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),
        api.get(`${API_BASE}/assignment`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),
        api.get(`${API_BASE}/attendance`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { data: [] } })),
      ]);

      // Process classes
      const activeClassesCount = classesRes.data.status
        ? classesRes.data.data.filter((cls) => cls.isActive).length
        : 0;

      // Process students
      const totalStudentsCount = usersRes.data.status ? usersRes.data.count : 0;

      // Process exams
      const allExams = examsRes.data.data || [];
      today.setHours(0, 0, 0, 0);
      
      const upcomingExamsData = allExams.filter((exam) => {
        const examDate = new Date(exam.exam_date);
        return examDate >= today && exam.status === "scheduled";
      });

      const completedExamsCount = allExams.filter(
        (exam) => exam.status === "completed"
      ).length;

      // Get next 3 upcoming exams
      const nextExams = upcomingExamsData
        .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date))
        .slice(0, 3);

      // Process leaves
      const pendingLeavesCount = leavesRes.data.data?.length || 0;

      // Process lesson plans
      const activeLessonPlansCount = lessonPlansRes.data.data?.length || 0;

      // Process assignments
      const totalAssignmentsCount = assignmentsRes.data.data?.length || 0;

      // Calculate weekly progress
      const allAttendance = attendanceRes.data.data || [];
      const weeklyAttendance = allAttendance.filter((att) => {
        const attDate = new Date(att.date);
        return attDate >= weekStart && attDate <= weekEnd;
      });

      const weeklyExamsCompleted = allExams.filter((exam) => {
        const examDate = new Date(exam.exam_date);
        return examDate >= weekStart && examDate <= weekEnd && exam.status === "completed";
      }).length;

      const allLessonPlans = lessonPlansRes.data.data || [];
      const weeklyLessonPlans = allLessonPlans.filter((plan) => {
        const createdDate = new Date(plan.createdAt);
        return createdDate >= weekStart && createdDate <= weekEnd;
      }).length;

      const allAssignments = assignmentsRes.data.data || [];
      const weeklyAssignments = allAssignments.filter((assignment) => {
        const createdDate = new Date(assignment.createdAt);
        return createdDate >= weekStart && createdDate <= weekEnd;
      }).length;

      // Calculate attendance percentage
      let attendancePercentage = 0;
      if (weeklyAttendance.length > 0) {
        const totalPresent = weeklyAttendance.reduce((sum, att) => sum + (att.total_present || 0), 0);
        const totalStudentsInAttendance = weeklyAttendance.reduce((sum, att) => sum + (att.total_students || 0), 0);
        attendancePercentage = totalStudentsInAttendance > 0 
          ? Math.round((totalPresent / totalStudentsInAttendance) * 100) 
          : 0;
      }

      setStats({
        totalStudents: totalStudentsCount,
        activeClasses: activeClassesCount,
        upcomingExams: upcomingExamsData.length,
        pendingLeaves: pendingLeavesCount,
        totalExams: allExams.length,
        completedExams: completedExamsCount,
        activeLessonPlans: activeLessonPlansCount,
        totalAssignments: totalAssignmentsCount,
      });

      setWeeklyProgress({
        attendance: attendancePercentage,
        examsCompleted: weeklyExamsCompleted,
        assignmentsSubmitted: weeklyAssignments,
        lessonPlansPublished: weeklyLessonPlans,
      });

      setRecentExams(nextExams);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="dashboard-data">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-data">
        <div className="error-container">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-data">
      <div className="dashboard-header">
        <h1>
          <i className="fas fa-chart-line"></i> Dashboard Overview
        </h1>
        <p className="dashboard-subtitle">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <div className="dashboard-cards">
        <div className="card students-card">
          <div className="card-icon">
            <i className="fas fa-user-graduate"></i>
          </div>
          <div className="card-content">
            <div className="card-title">Total Students</div>
            <div className="card-value">{stats.totalStudents}</div>
          </div>
        </div>

        <div className="card classes-card">
          <div className="card-icon">
            <i className="fas fa-chalkboard"></i>
          </div>
          <div className="card-content">
            <div className="card-title">Active Classes</div>
            <div className="card-value">{stats.activeClasses}</div>
          </div>
        </div>

        <div className="card exams-card">
          <div className="card-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="card-content">
            <div className="card-title">Upcoming Exams</div>
            <div className="card-value">{stats.upcomingExams}</div>
          </div>
        </div>

        <div className="card leaves-card">
          <div className="card-icon">
            <i className="fas fa-clipboard-check"></i>
          </div>
          <div className="card-content">
            <div className="card-title">Pending Leaves</div>
            <div className="card-value">{stats.pendingLeaves}</div>
          </div>
        </div>

        <div className="card assignments-card">
          <div className="card-icon">
            <i className="fas fa-tasks"></i>
          </div>
          <div className="card-content">
            <div className="card-title">Total Assignments</div>
            <div className="card-value">{stats.totalAssignments}</div>
          </div>
        </div>

        <div className="card lesson-card">
          <div className="card-icon">
            <i className="fas fa-book-open"></i>
          </div>
          <div className="card-content">
            <div className="card-title">Active Lesson Plans</div>
            <div className="card-value">{stats.activeLessonPlans}</div>
          </div>
        </div>

        <div className="card total-exams-card">
          <div className="card-icon">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="card-content">
            <div className="card-title">Total Exams</div>
            <div className="card-value">{stats.totalExams}</div>
          </div>
        </div>

        <div className="card completed-card">
          <div className="card-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="card-content">
            <div className="card-title">Completed Exams</div>
            <div className="card-value">{stats.completedExams}</div>
          </div>
        </div>
      </div>

      {/* Weekly Progress Section */}
      <div className="weekly-progress-section">
        <h2>
          <i className="fas fa-chart-bar"></i> This Week's Progress
        </h2>
        <div className="progress-grid">
          <div className="progress-card">
            <div className="progress-header">
              <div className="progress-icon attendance-icon">
                <i className="fas fa-user-check"></i>
              </div>
              <div className="progress-info">
                <h3>Attendance Rate</h3>
                <p className="progress-value">{weeklyProgress.attendance}%</p>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill attendance-fill" 
                style={{ width: `${weeklyProgress.attendance}%` }}
              ></div>
            </div>
            <p className="progress-description">Average student attendance this week</p>
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <div className="progress-icon exams-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="progress-info">
                <h3>Exams Completed</h3>
                <p className="progress-value">{weeklyProgress.examsCompleted}</p>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill exams-fill" 
                style={{ width: `${Math.min(weeklyProgress.examsCompleted * 20, 100)}%` }}
              ></div>
            </div>
            <p className="progress-description">Exams conducted this week</p>
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <div className="progress-icon assignments-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="progress-info">
                <h3>Assignments Created</h3>
                <p className="progress-value">{weeklyProgress.assignmentsSubmitted}</p>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill assignments-fill" 
                style={{ width: `${Math.min(weeklyProgress.assignmentsSubmitted * 15, 100)}%` }}
              ></div>
            </div>
            <p className="progress-description">New assignments this week</p>
          </div>

          <div className="progress-card">
            <div className="progress-header">
              <div className="progress-icon lessons-icon">
                <i className="fas fa-book-reader"></i>
              </div>
              <div className="progress-info">
                <h3>Lesson Plans Published</h3>
                <p className="progress-value">{weeklyProgress.lessonPlansPublished}</p>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill lessons-fill" 
                style={{ width: `${Math.min(weeklyProgress.lessonPlansPublished * 20, 100)}%` }}
              ></div>
            </div>
            <p className="progress-description">Lesson plans added this week</p>
          </div>
        </div>
      </div>

      {recentExams.length > 0 && (
        <div className="upcoming-exams-section">
          <h2>
            <i className="fas fa-calendar-week"></i> Upcoming Exams
          </h2>
          <div className="exams-list">
            {recentExams.map((exam) => (
              <div key={exam._id} className="exam-item">
                <div className="exam-date-badge">
                  <div className="exam-day">
                    {new Date(exam.exam_date).getDate()}
                  </div>
                  <div className="exam-month">
                    {new Date(exam.exam_date).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </div>
                </div>
                <div className="exam-details">
                  <h3>{exam.exam_name}</h3>
                  <div className="exam-meta">
                    <span>
                      <i className="fas fa-chalkboard"></i>{" "}
                      {exam.class_id?.class_name || exam.class_name}
                    </span>
                    <span>
                      <i className="fas fa-book"></i> {exam.subject}
                    </span>
                    <span>
                      <i className="fas fa-clock"></i> {formatTime(exam.start_time)}
                    </span>
                  </div>
                </div>
                <div className="exam-status">
                  <span className={`status-badge ${exam.status}`}>
                    {exam.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardData;
