import { Routes, Route } from "react-router-dom";
import Login from "./Pages/login/Login";
import NotFound from "./components/common/NotFound/NotFound";
import Dashboard from "./components/dashboard/Dashboard/Dashboard";
import DashboardData from "./components/common/DashboardData/DashboardData";
import AuthRoute from "./routes/AuthRoute";
import {
  StudentDetails,
  OnlineForms,
  StudentByCategory,
  ManageStatus,
  StudentAttendance,
  AttendanceByCategory,
  ApproveLeave,
  ExamSchedule,
  Results,
  CreateExam,
  ManageLessonPlans,
  TimeTable,
  Sessions,
  Classes,
  Schedule,
  SendMessage,
  EmailMatter,
  SendMail,
  ScheduleMeeting,
  MeetingCategories,
  StudentReport,
  TeacherReport,
  ClassesReport,
  SessionReport,
  ExamReport,
} from "./Pages/Dashboard";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />

      {/* Dashboard layout + nested pages */}
      <Route element={<AuthRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
          {/* Index/landing inside dashboard */}
          <Route index element={<DashboardData />} />

          {/* Students Information */}
          <Route path="students/student-details" element={<StudentDetails />} />
          <Route path="students/online-forms" element={<OnlineForms />} />
          <Route
            path="students/student-by-category"
            element={<StudentByCategory />}
          />
          <Route path="students/manage-status" element={<ManageStatus />} />

          {/* Attendance */}
          <Route
            path="attendance/student-attendance"
            element={<StudentAttendance />}
          />
          <Route
            path="attendance/attendance-by-category"
            element={<AttendanceByCategory />}
          />
          <Route path="attendance/approve-leave" element={<ApproveLeave />} />

          {/* Examinations */}
          <Route path="examinations/exam-schedule" element={<ExamSchedule />} />
          <Route path="examinations/results" element={<Results />} />
          <Route path="examinations/create-exam" element={<CreateExam />} />

          {/* Lesson Plan */}
          <Route
            path="lesson-plan/manage-lesson-plans"
            element={<ManageLessonPlans />}
          />

          {/* Academics */}
          <Route path="academics/timetable" element={<TimeTable />} />
          <Route path="academics/sessions" element={<Sessions />} />
          <Route path="academics/classes" element={<Classes />} />
          <Route path="academics/schedule" element={<Schedule />} />

          {/* Communications */}
          <Route path="communications/send-message" element={<SendMessage />} />
          <Route path="communications/email-matter" element={<EmailMatter />} />
          <Route path="communications/send-mail" element={<SendMail />} />

          {/* Zoom */}
          <Route path="zoom/schedule-meeting" element={<ScheduleMeeting />} />
          <Route
            path="zoom/meeting-categories"
            element={<MeetingCategories />}
          />

          {/* Reports */}
          <Route path="reports/student-report" element={<StudentReport />} />
          <Route path="reports/teacher-report" element={<TeacherReport />} />
          <Route path="reports/classes-report" element={<ClassesReport />} />
          <Route path="reports/session-report" element={<SessionReport />} />
          <Route path="reports/exam-report" element={<ExamReport />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;