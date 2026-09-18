import { useState } from "react";

interface AdmissionFormProps {
  onClose: () => void;
}

interface FormData {
  studentName: string;
  dateOfBirth: string;
  gender: string;
  appliedClass: string;
  previousSchool: string;
  previousClass: string;
  previousPercentage: string;
  fatherName: string;
  fatherPhone: string;
  fatherOccupation: string;
  motherName: string;
  motherPhone: string;
  guardianNid: string;
  address: string;
  city: string;
  bloodGroup: string;
  medicalConditions: string;
  transportRequired: string;
  howDidYouHear: string;
}

const INITIAL: FormData = {
  studentName: "", dateOfBirth: "", gender: "", appliedClass: "",
  previousSchool: "", previousClass: "", previousPercentage: "",
  fatherName: "", fatherPhone: "", fatherOccupation: "",
  motherName: "", motherPhone: "", guardianNid: "",
  address: "", city: "", bloodGroup: "", medicalConditions: "",
  transportRequired: "", howDidYouHear: "",
};

export function AdmissionForm({ onClose }: AdmissionFormProps) {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const set = (field: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.studentName.trim()) errs.push("Student name is required");
    if (!form.dateOfBirth) errs.push("Date of birth is required");
    if (!form.gender) errs.push("Gender is required");
    if (!form.appliedClass) errs.push("Class applied for is required");
    if (!form.fatherName.trim()) errs.push("Father/Guardian name is required");
    if (!form.fatherPhone.trim()) errs.push("Father/Guardian phone is required");
    if (!form.address.trim()) errs.push("Address is required");
    if (!form.city.trim()) errs.push("City is required");
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);

    const submission = {
      id: `ADM-${Date.now()}`,
      ...form,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("admission_submissions") || "[]");
    existing.push(submission);
    localStorage.setItem("admission_submissions", JSON.stringify(existing));

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-10 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Application Submitted!</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Your admission application has been received successfully. We will review your application and contact you within 3-5 working days.
          </p>
          <p className="text-xs text-slate-500 mb-8">
            Reference ID: <span className="text-white font-mono">{`ADM-${Date.now()}`}</span>
          </p>
          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition";
  const labelClass = "block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-white/10 px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-bold text-white">Admission Registration</h3>
            <p className="text-xs text-slate-500 mt-1">Fill out the form below to apply for admission</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-8">
          {errors.length > 0 && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs font-bold text-red-400 mb-2">Please fix the following:</p>
              {errors.map((err) => (
                <p key={err} className="text-xs text-red-400">• {err}</p>
              ))}
            </div>
          )}

          {/* Student Information */}
          <div>
            <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400 font-bold">1</span>
              Student Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input type="text" placeholder="Enter student's full name" className={inputClass} value={form.studentName} onChange={(e) => set("studentName", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Date of Birth *</label>
                <input type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Gender *</label>
                <select className={inputClass} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Class Applied For *</label>
                <select className={inputClass} value={form.appliedClass} onChange={(e) => set("appliedClass", e.target.value)}>
                  <option value="">Select Class</option>
                  <option value="5">Class 5</option>
                  <option value="6">Class 6</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Blood Group</label>
                <select className={inputClass} value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)}>
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Medical Conditions</label>
                <input type="text" placeholder="Any allergies or conditions (optional)" className={inputClass} value={form.medicalConditions} onChange={(e) => set("medicalConditions", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Previous School */}
          <div>
            <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 font-bold">2</span>
              Previous School Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2">
                <label className={labelClass}>Previous School Name</label>
                <input type="text" placeholder="Name of previous school" className={inputClass} value={form.previousSchool} onChange={(e) => set("previousSchool", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Last Class Passed</label>
                <input type="text" placeholder="e.g. Class 4" className={inputClass} value={form.previousClass} onChange={(e) => set("previousClass", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Previous Percentage</label>
                <input type="text" placeholder="e.g. 85%" className={inputClass} value={form.previousPercentage} onChange={(e) => set("previousPercentage", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div>
            <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center text-[10px] text-violet-400 font-bold">3</span>
              Parent / Guardian Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Father / Guardian Name *</label>
                <input type="text" placeholder="Full name" className={inputClass} value={form.fatherName} onChange={(e) => set("fatherName", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Phone Number *</label>
                <input type="tel" placeholder="+880 1XXXXXXXXX" className={inputClass} value={form.fatherPhone} onChange={(e) => set("fatherPhone", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Occupation</label>
                <input type="text" placeholder="Father/Guardian occupation" className={inputClass} value={form.fatherOccupation} onChange={(e) => set("fatherOccupation", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Mother's Name</label>
                <input type="text" placeholder="Full name" className={inputClass} value={form.motherName} onChange={(e) => set("motherName", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Mother's Phone</label>
                <input type="tel" placeholder="+880 1XXXXXXXXX" className={inputClass} value={form.motherPhone} onChange={(e) => set("motherPhone", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Guardian NID Number</label>
                <input type="text" placeholder="National ID number" className={inputClass} value={form.guardianNid} onChange={(e) => set("guardianNid", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Address & Other */}
          <div>
            <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-400 font-bold">4</span>
              Address & Additional
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className={labelClass}>Full Address *</label>
                <input type="text" placeholder="House, Road, Area" className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>City *</label>
                <input type="text" placeholder="City name" className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Transport Required</label>
                <select className={inputClass} value={form.transportRequired} onChange={(e) => set("transportRequired", e.target.value)}>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>How did you hear about us?</label>
                <select className={inputClass} value={form.howDidYouHear} onChange={(e) => set("howDidYouHear", e.target.value)}>
                  <option value="">Select</option>
                  <option value="social-media">Social Media</option>
                  <option value="friend">Friend / Family</option>
                  <option value="newspaper">Newspaper</option>
                  <option value="existing-parent">Existing Parent</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all">
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
