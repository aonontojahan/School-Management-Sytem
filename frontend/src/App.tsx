import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { StudentManagement } from "./pages/admin/StudentManagement";
import { TeacherManagement } from "./pages/admin/TeacherManagement";
import { AdminRoutinePage } from "./pages/admin/AdminRoutinePage";
import { TeacherSchedulePage } from "./pages/TeacherSchedulePage";
import { AdminSubjectPage } from "./pages/admin/AdminSubjectPage";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { TeacherAttendance } from "./pages/TeacherAttendance";
import { TeacherAssignments } from "./pages/TeacherAssignments";
import { StudentAssignments } from "./pages/StudentAssignments";
import { SearchPage } from "./pages/SearchPage";
import {
  Classes,
  AttendancePage,
  ExamsPage,
  AssignmentsPage,
  FeesPage,
  ResultsPage,
  ReportsPage,
  ProfilePage,
} from "./pages/Tables";

function RoutineRouter() {
  const { role } = useAuth();
  if (role === "TEACHER") return <TeacherSchedulePage />;
  if (role === "STUDENT") return <TeacherSchedulePage />;
  return <AdminRoutinePage />;
}

function Shelled({ children, roles }: { children: React.ReactNode; roles?: ("ADMIN" | "TEACHER" | "STUDENT" | "GUARDIAN")[] }) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function HomeRedirect() {
  const { role } = useAuth();
  if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  if (role === "STUDENT") return <Navigate to="/student/dashboard" replace />;
  if (role === "TEACHER") return <TeacherDashboard />;
  return <Dashboard />;
}

function AttendanceRouter() {
  const { role } = useAuth();
  if (role === "TEACHER") return <TeacherAttendance />;
  return <AttendancePage />;
}

function AssignmentsRouter() {
  const { role } = useAuth();
  if (role === "TEACHER") return <TeacherAssignments />;
  if (role === "STUDENT") return <StudentAssignments />;
  return <AssignmentsPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Shelled><HomeRedirect /></Shelled>} />
        <Route path="/search" element={<Shelled><SearchPage /></Shelled>} />
        <Route path="/admin/dashboard" element={<Shelled roles={["ADMIN"]}><AdminDashboard /></Shelled>} />
        <Route path="/student/dashboard" element={<Shelled roles={["STUDENT"]}><StudentDashboard /></Shelled>} />
        <Route path="/students" element={<Shelled roles={["ADMIN"]}><StudentManagement /></Shelled>} />
        <Route path="/teachers" element={<Shelled roles={["ADMIN"]}><TeacherManagement /></Shelled>} />
        <Route path="/routines" element={<Shelled roles={["ADMIN", "TEACHER", "STUDENT"]}><RoutineRouter /></Shelled>} />
        <Route path="/classes" element={<Shelled roles={["ADMIN", "STUDENT"]}><Classes /></Shelled>} />
        <Route path="/subjects" element={<Shelled roles={["ADMIN"]}><AdminSubjectPage /></Shelled>} />
        <Route path="/attendance" element={<Shelled><AttendanceRouter /></Shelled>} />
        <Route path="/exams" element={<Shelled roles={["ADMIN", "TEACHER", "STUDENT"]}><ExamsPage /></Shelled>} />
        <Route path="/results" element={<Shelled><ResultsPage /></Shelled>} />
        <Route path="/fees" element={<Shelled roles={["ADMIN"]}><FeesPage /></Shelled>} />
        <Route path="/reports" element={<Shelled roles={["ADMIN"]}><ReportsPage /></Shelled>} />
        <Route path="/assignments" element={<Shelled><AssignmentsRouter /></Shelled>} />
        <Route path="/profile" element={<Shelled roles={["STUDENT"]}><ProfilePage /></Shelled>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
