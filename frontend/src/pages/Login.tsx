import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const HIGHLIGHTS = [
  ["Attendance", "Daily PRESENT / ABSENT / LATE tracking with rates"],
  ["Results", "Auto-graded bands (A+…F), GPA, totals & positions"],
  ["Fees", "Invoices, partial payments & due balances"],
];

export function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Brand panel */}
      <aside className="hidden lg:flex w-[44%] flex-col justify-between bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-black">S</div>
            <div>
              <p className="font-bold text-lg leading-tight">School Management System</p>
              <p className="text-indigo-300 text-sm">Admin · Teacher · Student · Guardian</p>
            </div>
          </div>
          <h2 className="mt-14 text-4xl font-extrabold leading-tight">
            One platform for<br />the whole school.
          </h2>
          <div className="mt-10 space-y-5">
            {HIGHLIGHTS.map(([title, desc]) => (
              <div key={title} className="flex gap-4">
                <div className="mt-1 w-8 h-8 shrink-0 rounded-lg bg-emerald-400/15 border border-emerald-300/30 flex items-center justify-center text-emerald-300 font-bold">✓</div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-indigo-200">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-indigo-300">JWT-secured API · Role-based access control</p>
      </aside>

      {/* Form panel */}
      <main className="flex-1 flex items-center justify-center p-6">
        <form
          className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-8 space-y-5"
          onSubmit={handleSubmit(async (v) => {
            setServerError(null);
            try {
              await login(v.email, v.password);
              nav("/");
            } catch (e) {
              if (axios.isAxiosError(e)) {
                const detail = e.response?.data?.detail;
                setServerError(typeof detail === "string" ? detail : "Invalid email or password.");
              } else {
                setServerError("Could not reach the server. Is the backend running?");
              }
            }
          })}
        >
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to your school account</p>
          </div>

          {serverError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {serverError}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              className="mt-1 border border-slate-300 w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="admin@school.edu"
              autoComplete="username"
              {...register("email")}
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              className="mt-1 border border-slate-300 w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <button
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white w-full py-2.5 rounded-lg font-semibold transition"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            Seeded admin: <span className="font-mono">admin@school.edu</span> / <span className="font-mono">Admin123!</span>
          </p>
        </form>
      </main>
    </div>
  );
}
