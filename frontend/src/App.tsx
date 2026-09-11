import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import {
  Students,
  Teachers,
  Guardians,
  Classes,
  Subjects,
  AttendancePage,
  ExamsPage,
  AssignmentsPage,
  FeesPage,
  ResultsPage,
  ReportsPage,
  ChildrenPage,
  ProfilePage,
} from "./pages/Tables";

function Shelled({ children, roles }: { children: React.ReactNode; roles?: ("ADMIN" | "TEACHER" | "STUDENT" | "GUARDIAN")[] }) {
  return (
    <ProtectedRoute roles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Spec §3 — role menus. Guards mirror Layout MENUS. */}
        <Route path="/" element={<Shelled>{<Dashboard />}</Shelled>} />
        <Route path="/students" element={<Shelled roles={["ADMIN", "TEACHER"]}>{<Students />}</Shelled>} />
        <Route path="/teachers" element={<Shelled roles={["ADMIN"]}>{<Teachers />}</Shelled>} />
        <Route path="/guardians" element={<Shelled roles={["ADMIN"]}>{<Guardians />}</Shelled>} />
        <Route path="/classes" element={<Shelled roles={["ADMIN", "TEACHER", "STUDENT"]}>{<Classes />}</Shelled>} />
        <Route path="/subjects" element={<Shelled roles={["ADMIN"]}>{<Subjects />}</Shelled>} />
        <Route path="/attendance" element={<Shelled>{<AttendancePage />}</Shelled>} />
        <Route path="/exams" element={<Shelled roles={["ADMIN", "TEACHER", "STUDENT"]}>{<ExamsPage />}</Shelled>} />
        <Route path="/results" element={<Shelled>{<ResultsPage />}</Shelled>} />
        <Route path="/fees" element={<Shelled roles={["ADMIN", "GUARDIAN"]}>{<FeesPage />}</Shelled>} />
        <Route path="/reports" element={<Shelled roles={["ADMIN"]}>{<ReportsPage />}</Shelled>} />
        <Route path="/assignments" element={<Shelled roles={["TEACHER", "STUDENT"]}>{<AssignmentsPage />}</Shelled>} />
        <Route path="/children" element={<Shelled roles={["GUARDIAN"]}>{<ChildrenPage />}</Shelled>} />
        <Route path="/profile" element={<Shelled roles={["STUDENT"]}>{<ProfilePage />}</Shelled>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
