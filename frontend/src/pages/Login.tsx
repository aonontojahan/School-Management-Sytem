import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import { SiteNavbar } from "../components/SiteNavbar";

const schema = z.object({
  email: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-blue-950">
      <SiteNavbar />

      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center px-4 pt-16 pb-4 overflow-hidden">
        {/* School photo backdrop */}
        <img src="/images/about/campus.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-blue-950/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/60 via-transparent to-blue-950/80" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-xl bg-white rounded-[28px] shadow-2xl shadow-black/50 overflow-hidden">
        {/* Photo banner */}
        <div className="relative h-28 sm:h-32">
          <img src="/images/about/campus.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/55 to-blue-950/15" />
          <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 pb-4 flex items-end gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xl ring-4 ring-white/25 shrink-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.52 4.67a1 1 0 00.95.69h4.91c.97 0 1.37 1.24.59 1.81l-3.98 2.89a1 1 0 00-.36 1.12l1.52 4.67c.3.92-.76 1.69-1.54 1.12l-3.97-2.89a1 1 0 00-1.18 0l-3.97 2.89c-.78.57-1.84-.2-1.54-1.12l1.52-4.67a1 1 0 00-.36-1.12L.71 9.09c-.78-.57-.38-1.81.59-1.81h4.91a1 1 0 00.95-.69l1.89-4.66z" />
              </svg>
            </div>
            <div className="pb-0.5">
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">Portal Login</h1>
              <p className="text-xs text-white/70">Little Star School • Bhendabari, Pirgonj, Rangpur</p>
            </div>
          </div>
        </div>
        <div className="px-6 sm:px-8 py-6">

          {/* Error */}
          {serverError && (
            <div className="flex items-center gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-6">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {serverError}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(async (v) => {
              setServerError(null);
              try {
                const role = await login(v.email, v.password);
                nav(role === "ADMIN" ? "/admin/dashboard" : "/");
              } catch (e) {
                if (axios.isAxiosError(e)) {
                  const detail = e.response?.data?.detail;
                  setServerError(typeof detail === "string" ? detail : "Invalid email or password.");
                } else {
                  setServerError("Could not reach the server. Is the backend running?");
                }
              }
            })}
            className="mt-5 space-y-4"
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email or Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none ${
                    errors.email
                      ? "border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-200 focus:border-red-400"
                      : "border-slate-300 bg-slate-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                  }`}
                  placeholder="admin@school.edu"
                  autoComplete="username"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1 text-red-600 text-xs mt-1.5 font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none ${
                    errors.password
                      ? "border-red-300 bg-red-50/50 focus:ring-2 focus:ring-red-200 focus:border-red-400"
                      : "border-slate-300 bg-slate-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
                  }`}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 text-red-600 text-xs mt-1.5 font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-950 via-blue-900 to-blue-800 hover:from-blue-900 hover:to-blue-700 text-white font-bold text-[15px] shadow-xl shadow-blue-950/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-2xl hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to Dashboard
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Help line */}
          <p className="mt-4 text-center text-xs text-slate-400">
            Forgot your password? Contact the school office at <span className="font-bold text-blue-900">+880 123 456 789</span>
          </p>
        </div>
      </div>

        <p className="relative z-10 mt-3 text-[11px] text-white/50">
          Secure access for school admin, teachers & students
        </p>
      </div>
    </div>
  );
}
