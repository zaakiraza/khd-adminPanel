import { Routes, Route } from "react-router-dom";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import AuthRoute from "./routes/AuthRoute";
import Students from "./components/dashboard/routes/Students/Student";
import StudentDetails from "./components/dashboard/routes/Students/StudentDetails";
import Attendance from "./components/dashboard/routes/Attendance";
import NewAdmissions from "./components/dashboard/routes/NewAdmissions/NewAdmissions";
import NewAdmissionDetails from "./components/dashboard/routes/NewAdmissions/NewAdmissionDetails";
import Quizes from "./components/dashboard/routes/Quizes";
import Assignments from "./components/dashboard/routes/Assignments";
import Zoom from "./components/dashboard/routes/Zoom";
import Result from "./components/dashboard/routes/Result";
import NewAdmissionForm from "./components/public/AdmissionForm";
import NotFound from "./components/common/NotFound";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/new-admission/form" element={<NewAdmissionForm />} />

      {/* Protected Routes */}
      <Route element={<AuthRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="student" element={<Students />} />
          <Route path="student/:rollNo" element={<StudentDetails />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="new-admissions" element={<NewAdmissions />} />
          <Route path="new-admissions/:id" element={<NewAdmissionDetails />} />
          <Route path="quizes" element={<Quizes />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="zoom" element={<Zoom />} />
          <Route path="result" element={<Result />} />
        </Route>
      </Route>

      {/* Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
