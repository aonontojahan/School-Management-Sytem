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
import { SearchPage } from "./pages/SearchPage";
import {
  Classes,
  Subjects,
  AttendancePage,
  ExamsPage,
  AssignmentsPage,
  FeesPage,
  ResultsPage,
  ReportsPage,
  ProfilePage,
} from "./pages/Tables";

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
  return <Dashboard />;
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
        <Route path="/classes" element={<Shelled roles={["ADMIN", "TEACHER", "STUDENT"]}><Classes /></Shelled>} />
        <Route path="/subjects" element={<Shelled roles={["ADMIN"]}><Subjects /></Shelled>} />
        <Route path="/attendance" element={<Shelled><AttendancePage /></Shelled>} />
        <Route path="/exams" element={<Shelled roles={["ADMIN", "TEACHER", "STUDENT"]}><ExamsPage /></Shelled>} />
        <Route path="/results" element={<Shelled><ResultsPage /></Shelled>} />
        <Route path="/fees" element={<Shelled roles={["ADMIN"]}><FeesPage /></Shelled>} />
        <Route path="/reports" element={<Shelled roles={["ADMIN"]}><ReportsPage /></Shelled>} />
        <Route path="/assignments" element={<Shelled roles={["TEACHER", "STUDENT"]}><AssignmentsPage /></Shelled>} />
        <Route path="/profile" element={<Shelled roles={["STUDENT"]}><ProfilePage /></Shelled>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
