import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { StudentManagement } from "./pages/admin/StudentManagement";
import { TeacherManagement } from "./pages/admin/TeacherManagement";
import { AdminRoutinePage } from "./pages/admin/AdminRoutinePage";
import { TeacherSchedulePage } from "./pages/TeacherSchedulePage";
import { StudentSchedulePage } from "./pages/StudentSchedulePage";
import { AdminSubjectPage } from "./pages/admin/AdminSubjectPage";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { TeacherAttendance } from "./pages/TeacherAttendance";
import { StudentAttendancePage } from "./pages/StudentAttendancePage";
import { TeacherAssignments } from "./pages/TeacherAssignments";
import { StudentAssignments } from "./pages/StudentAssignments";
import { AdminExamPage } from "./pages/admin/AdminExamPage";
import { AdminExamRoutinePage } from "./pages/admin/AdminExamRoutinePage";
import { AdminFeesPage } from "./pages/admin/AdminFeesPage";
import { AdminSalaryPage } from "./pages/admin/AdminSalaryPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { AdminResultsPage } from "./pages/admin/AdminResultsPage";
import { AdminAttendancePage } from "./pages/admin/AdminAttendancePage";
import { StudentExamsPage } from "./pages/StudentExamsPage";
import { StudentExamRoutinePage } from "./pages/StudentExamRoutinePage";
import { StudentFeesPage } from "./pages/StudentFeesPage";
import { StudentResultsPage } from "./pages/StudentResultsPage";
import { StudentNoticePage } from "./pages/StudentNoticePage";
import { StudentProfilePage } from "./pages/StudentProfilePage";
import { TeacherExamRoutinePage } from "./pages/TeacherExamRoutinePage";
import { TeacherSalaryPage } from "./pages/TeacherSalaryPage";
import { TeacherMarksEntryPage } from "./pages/TeacherMarksEntryPage";
import { SearchPage } from "./pages/SearchPage";
import {
  Classes,
  AttendancePage,
  AssignmentsPage,
  ResultsPage,
  ProfilePage,
} from "./pages/Tables";

function RoutineRouter() {
  const { role } = useAuth();
  if (role === "TEACHER") return <TeacherSchedulePage />;
  if (role === "STUDENT") return <StudentSchedulePage />;
  return <AdminRoutinePage />;
}

function Shelled({ children, roles }: { children: React.ReactNode; roles?: ("ADMIN" | "TEACHER" | "STUDENT" | "GUARDIAN")[] }) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function HomeRouter() {
  const { role } = useAuth();
  if (!role) return <LandingPage />;
  if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  if (role === "STUDENT") return <Navigate to="/student/dashboard" replace />;
  if (role === "TEACHER") return <Navigate to="/teacher/dashboard" replace />;
  return <Dashboard />;
}

function AttendanceRouter() {
  const { role } = useAuth();
  if (role === "ADMIN") return <AdminAttendancePage />;
  if (role === "TEACHER") return <TeacherAttendance />;
  if (role === "STUDENT") return <StudentAttendancePage />;
  return <TeacherAttendance />;
}

function AssignmentsRouter() {
  const { role } = useAuth();
  if (role === "TEACHER") return <TeacherAssignments />;
  if (role === "STUDENT") return <StudentAssignments />;
  return <AssignmentsPage />;
}

function ExamRouter() {
  const { role } = useAuth();
  if (role === "ADMIN") return <AdminExamPage />;
  if (role === "STUDENT") return <StudentExamsPage />;
  return <StudentExamsPage />;
}

function ExamRoutineRouter() {
  const { role } = useAuth();
  if (role === "ADMIN") return <AdminExamRoutinePage />;
  if (role === "TEACHER") return <TeacherExamRoutinePage />;
  return <StudentExamRoutinePage />;
}

function ResultsRouter() {
  const { role } = useAuth();
  if (role === "ADMIN") return <AdminResultsPage />;
  if (role === "TEACHER") return <TeacherMarksEntryPage />;
  return <StudentResultsPage />;
}

function FeesRouter() {
  const { role } = useAuth();
  if (role === "ADMIN") return <AdminFeesPage />;
  return <StudentFeesPage />;
}

function SalaryRouter() {
  const { role } = useAuth();
  if (role === "ADMIN") return <AdminSalaryPage />;
  return <TeacherSalaryPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomeRouter />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search" element={<Shelled><SearchPage /></Shelled>} />
        <Route path="/admin/dashboard" element={<Shelled roles={["ADMIN"]}><AdminDashboard /></Shelled>} />
        <Route path="/student/dashboard" element={<Shelled roles={["STUDENT"]}><StudentDashboard /></Shelled>} />
        <Route path="/teacher/dashboard" element={<Shelled roles={["TEACHER"]}><TeacherDashboard /></Shelled>} />
        <Route path="/students" element={<Shelled roles={["ADMIN"]}><StudentManagement /></Shelled>} />
        <Route path="/teachers" element={<Shelled roles={["ADMIN"]}><TeacherManagement /></Shelled>} />
        <Route path="/routines" element={<Shelled roles={["ADMIN", "TEACHER", "STUDENT"]}><RoutineRouter /></Shelled>} />
        <Route path="/classes" element={<Shelled roles={["ADMIN", "STUDENT"]}><Classes /></Shelled>} />
        <Route path="/subjects" element={<Shelled roles={["ADMIN"]}><AdminSubjectPage /></Shelled>} />
        <Route path="/attendance" element={<Shelled><AttendanceRouter /></Shelled>} />
        <Route path="/exams" element={<Shelled roles={["ADMIN", "TEACHER", "STUDENT"]}><ExamRouter /></Shelled>} />
        <Route path="/exam-routine" element={<Shelled roles={["ADMIN", "TEACHER", "STUDENT"]}><ExamRoutineRouter /></Shelled>} />
        <Route path="/results" element={<Shelled><ResultsRouter /></Shelled>} />
        <Route path="/fees" element={<Shelled roles={["ADMIN", "STUDENT"]}><FeesRouter /></Shelled>} />
        <Route path="/salary" element={<Shelled roles={["ADMIN", "TEACHER"]}><SalaryRouter /></Shelled>} />
        <Route path="/reports" element={<Shelled roles={["ADMIN"]}><AdminReportsPage /></Shelled>} />
        <Route path="/assignments" element={<Shelled><AssignmentsRouter /></Shelled>} />
        <Route path="/notice" element={<Shelled roles={["STUDENT"]}><StudentNoticePage /></Shelled>} />
        <Route path="/my-profile" element={<Shelled roles={["STUDENT"]}><StudentProfilePage /></Shelled>} />
        <Route path="/profile" element={<Shelled roles={["STUDENT"]}><ProfilePage /></Shelled>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
