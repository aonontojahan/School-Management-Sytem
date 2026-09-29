import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteNavbar } from "../components/SiteNavbar";
import { PageFooter } from "../components/PageFooter";
import { AdmissionForm } from "../components/ui/AdmissionForm";
import { ADMISSION_STEPS } from "../data/school";
import { IMAGES } from "../assets/images";

const FEES = [
  ["Admission fee (one-time)", "Contact office"],
  ["Monthly tuition (Play – 5)", "Contact office"],
  ["Monthly tuition (6 – 10)", "Contact office"],
  ["Admission test", "Jan 18, 9AM"],
  ["Result", "Within 3 days via SMS"],
];

export function AdmissionPage() {
  const [showForm, setShowForm] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700">
      <SiteNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={IMAGES.about.campus} alt="School campus" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/80 to-blue-950/30" />
        <div className="relative w-full px-6 sm:px-10 lg:px-14 pt-32 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white">Admission</h1>
          <div className="mt-4 w-14 h-1 bg-amber-400 rounded-full mx-auto" />
          <p className="mt-4 text-white/75 max-w-2xl mx-auto">
            4 simple steps from form to classroom — Play to Class 10, session 2027.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-7 px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-500 text-blue-950 font-bold transition"
          >
            Apply Now — Free
          </button>
        </div>
      </section>

      {/* Steps */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {ADMISSION_STEPS.map((s) => (
            <div key={s.n} className="relative bg-white rounded-3xl border border-slate-100 shadow-sm p-7 hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden">
              <div className="h-1.5 absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-700 to-amber-400" />
              <p className="text-4xl font-black text-blue-100">{s.n}</p>
              <h3 className="mt-2 font-black text-blue-950">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fees */}
      <section className="bg-sky-50/70 border-y border-sky-100">
        <div className="w-full px-6 sm:px-10 lg:px-14 py-14 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-black text-blue-950">Fees & Key Dates</h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-lg">
              Exact fee charts are available at the school office in Bhendabari, Pirgonj.
              Sibling discounts and merit support are available for deserving students.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-3.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold transition"
              >
                Start Application
              </button>
              <Link to="/contact" className="px-8 py-3.5 rounded-full border-2 border-blue-950/15 text-blue-950 font-bold hover:bg-white transition text-center">
                Ask About Fees
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-3">
            {FEES.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 bg-slate-50 rounded-2xl px-5 py-3.5">
                <span className="text-sm text-slate-500">{k}</span>
                <span className="text-sm font-black text-blue-950 whitespace-nowrap">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents + key dates */}
      <section className="w-full px-6 sm:px-10 lg:px-14 pb-14 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-8">
          <h2 className="text-2xl font-black text-blue-950">Documents Required</h2>
          <div className="mt-2 w-12 h-1 bg-amber-400 rounded-full" />
          <ul className="mt-6 space-y-3">
            {[
              "Birth certificate photocopy of the student",
              "2 passport-size photos of the student",
              "Previous school report card / TC (Class 1 and above)",
              "Guardian NID photocopy + active mobile number",
            ].map((d) => (
              <li key={d} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-blue-950 p-8 text-white">
          <h2 className="text-2xl font-black">Key Dates — 2027 Session</h2>
          <div className="mt-2 w-12 h-1 bg-amber-400 rounded-full" />
          <div className="mt-6 space-y-0">
            {[
              ["Form submission", "Until Jan 15"],
              ["Admission test", "Jan 18, 9AM"],
              ["Result via SMS", "Within 3 days"],
              ["Classes begin", "January 2027"],
            ].map(([k, v], i, arr) => (
              <div key={k} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="w-8 h-8 rounded-full bg-amber-400 text-blue-950 flex items-center justify-center font-black text-sm shrink-0">
                    {i + 1}
                  </span>
                  {i < arr.length - 1 && <span className="w-0.5 flex-1 bg-white/15 my-1" />}
                </div>
                <div className="pb-6">
                  <p className="font-bold">{k}</p>
                  <p className="text-sm text-white/60">{v}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="w-full px-6 sm:px-10 lg:px-14 pb-14 grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { t: "Play – KG", d: "Simple oral interaction with the child and a short parent meeting. No written test." },
          { t: "Class 1 – 5", d: "Short written test in Bangla, English and Math for the applied class + parent meeting." },
          { t: "Class 6 – 10", d: "Written test in Bangla, English, Math and Science + parent meeting and document check." },
        ].map((c) => (
          <div key={c.t} className="rounded-3xl bg-white border border-slate-100 shadow-sm p-7 hover:shadow-lg transition-all">
            <h3 className="font-black text-blue-950 text-lg">{c.t}</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{c.d}</p>
          </div>
        ))}
      </section>

      <PageFooter />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full h-[85vh] bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <AdmissionForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
