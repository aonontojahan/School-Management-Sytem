import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteNavbar } from "../components/SiteNavbar";
import { PageFooter } from "../components/PageFooter";
import { CONTACT_CARDS, FAQS } from "../data/school";
import { IMAGES } from "../assets/images";

function Icon({ path, className = "w-6 h-6" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const FAQ_CATS = ["All", "Admission", "Fees", "Transport"] as const;

function faqCategory(i: number): string {
  if (i === 4) return "Transport";
  if (i === 1 || i === 3) return "Fees";
  return "Admission";
}

export function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCat, setFaqCat] = useState<string>("All");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setFormError("Please fill in your name, phone number and message.");
      return;
    }
    setFormError("");
    const existing = JSON.parse(localStorage.getItem("contact_messages") || "[]");
    existing.push({ name: name.trim(), phone: phone.trim(), message: message.trim(), sentAt: new Date().toISOString() });
    localStorage.setItem("contact_messages", JSON.stringify(existing));
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700">
      <SiteNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={IMAGES.about.students} alt="Contact us" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/80 to-blue-950/30" />
        <div className="relative w-full px-6 sm:px-10 lg:px-14 pt-32 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white">Contact</h1>
          <div className="mt-4 w-14 h-1 bg-amber-400 rounded-full mx-auto" />
          <p className="mt-4 text-white/75 max-w-2xl mx-auto">
            Questions about admission or school programs? Visit, call or message us — we reply within a day.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-14 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {CONTACT_CARDS.map((c) => (
          <div key={c.title} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 hover:shadow-lg hover:-translate-y-1 transition-all">
            <span className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-200">
              <Icon path={c.icon} className="w-6 h-6" />
            </span>
            <h3 className="mt-4 font-black text-blue-950">{c.title}</h3>
            {c.lines.map((l) => (
              <p key={l} className="text-sm text-slate-500">{l}</p>
            ))}
          </div>
        ))}
      </section>

      {/* Message form */}
      <section className="w-full px-6 sm:px-10 lg:px-14 pb-14 grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        <div className="lg:col-span-3 rounded-3xl bg-white border border-slate-100 shadow-sm p-8">
          <h2 className="text-2xl font-black text-blue-950">Send Us a Message</h2>
          <div className="mt-2 w-12 h-1 bg-amber-400 rounded-full" />
          {sent ? (
            <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
              <span className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <p className="mt-3 font-black text-blue-950">Message received!</p>
              <p className="mt-1 text-sm text-slate-500">Thank you, {name.split(" ")[0]}. The school office will call you back within a day.</p>
              <button onClick={() => { setSent(false); setName(""); setPhone(""); setMessage(""); }} className="mt-4 text-sm font-bold text-blue-700 hover:text-blue-900">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={sendMessage} className="mt-6 space-y-4">
              {formError && <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-600">{formError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Your Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahim Uddin" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1XXXXXXXXX" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Ask about admission, fees, transport, results..." className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition resize-none" />
              </div>
              <button type="submit" className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold transition">
                Send Message
              </button>
            </form>
          )}
        </div>
        <div className="lg:col-span-2 rounded-3xl bg-blue-950 p-8 text-white flex flex-col">
          <h3 className="text-xl font-black">Visit the School Office</h3>
          <div className="mt-2 w-12 h-1 bg-amber-400 rounded-full" />
          <p className="mt-4 text-sm text-white/70 leading-relaxed">
            For admission, fees, certificates or any help — walk into the office during school
            hours. Bring the student's birth certificate for admission queries.
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <p><span className="text-white/50">Address: </span><span className="font-bold">Bhendabari, Pirgonj, Rangpur</span></p>
            <p><span className="text-white/50">Phone: </span><span className="font-bold">+880 123 456 789</span></p>
            <p><span className="text-white/50">Hours: </span><span className="font-bold">Sat – Thu, 9AM – 4PM</span></p>
          </div>
          <Link to="/admission" className="mt-auto pt-6">
            <span className="block text-center px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-500 text-blue-950 font-bold transition">
              Apply for Admission
            </span>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-sky-50/70 border-y border-sky-100">
        <div className="w-full px-6 sm:px-10 lg:px-14 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-3xl sm:text-4xl font-black text-blue-950 leading-tight">Frequently Asked Questions</h2>
              <div className="mt-4 w-14 h-1 bg-amber-400 rounded-full" />
              <p className="mt-4 text-sm text-slate-500 leading-relaxed">
                Search or pick a topic — quick answers about admission, fees and transport.
              </p>
              {/* Search */}
              <div className="mt-5 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                </svg>
                <input
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full rounded-full bg-white border border-slate-200 pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition shadow-sm"
                />
              </div>
              {/* Categories */}
              <div className="mt-4 flex flex-wrap gap-2">
                {FAQ_CATS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFaqCat(c)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      faqCat === c ? "bg-blue-950 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-blue-950 text-white p-5">
                <p className="text-sm font-bold">Still need help?</p>
                <p className="mt-1 text-xs text-white/60">Call +880 123 456 789 (Sat – Thu, 9AM – 4PM)</p>
                <Link to="/admission" className="mt-3 block text-center px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-500 text-blue-950 text-sm font-bold transition">
                  Apply for Admission
                </Link>
              </div>
            </div>
          </div>
          <div className="lg:col-span-8">
            {(() => {
              const q = faqSearch.trim().toLowerCase();
              const list = FAQS.map((f, i) => ({ ...f, i })).filter(
                (f) => (faqCat === "All" || faqCategory(f.i) === faqCat) && (!q || `${f.q} ${f.a}`.toLowerCase().includes(q))
              );
              if (list.length === 0) {
                return (
                  <div className="rounded-3xl bg-white border border-dashed border-slate-300 p-10 text-center">
                    <p className="font-black text-blue-950">No answers found</p>
                    <p className="mt-1 text-sm text-slate-500">Try a different word — or call the office at +880 123 456 789.</p>
                  </div>
                );
              }
              return (
                <div className="space-y-3">
                  {list.map((f) => {
                    const open = openFaq === f.i;
                    return (
                      <div key={f.q} className={`rounded-2xl border overflow-hidden transition-all bg-white ${open ? "border-amber-300 shadow-md" : "border-slate-100 shadow-sm hover:shadow-md"}`}>
                        <button onClick={() => setOpenFaq(open ? null : f.i)} className="w-full flex items-center gap-4 px-5 sm:px-6 py-4 text-left">
                          <span className={`hidden sm:flex shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${open ? "bg-blue-950 text-amber-300" : "bg-sky-100 text-blue-800"}`}>
                            {faqCategory(f.i)}
                          </span>
                          <span className="flex-1 font-bold text-blue-950 text-[15px]">{f.q}</span>
                          <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${open ? "bg-amber-400 text-blue-950 rotate-45" : "bg-slate-100 text-slate-500"}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </span>
                        </button>
                        <div className={`grid transition-all duration-300 ${open ? "[grid-template-rows:1fr] opacity-100" : "[grid-template-rows:0fr] opacity-0"}`}>
                          <div className="overflow-hidden">
                            <p className="mx-5 sm:mx-6 mt-1 border-t border-dashed border-slate-100 px-0 pt-4 pb-5 text-sm text-slate-500 leading-relaxed">{f.a}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
