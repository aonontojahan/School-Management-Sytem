import { FEATURE_GALLERY } from "../assets/images";

/** Shared content for the public website pages (Home, Academics, Admission, Facilities, Notices, Contact). */

export const FEATURES = [
  {
    title: "Academic Excellence",
    desc: "Our students consistently achieve outstanding results in national examinations. With a dedicated faculty and structured curriculum, we ensure every student reaches their full potential.",
    stat: "95%+",
    statLabel: "Pass Rate",
    gradient: "from-blue-600 to-indigo-700",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    hero: FEATURE_GALLERY[0].hero,
    photos: FEATURE_GALLERY[0].photos,
    details: [
      "95%+ pass rate in national board exams",
      "Dedicated faculty with advanced degrees",
      "Structured curriculum from Play to Class 10",
      "Regular parent-teacher progress meetings",
      "Remedial classes for struggling students",
      "Honors program for advanced learners",
    ],
  },
  {
    title: "Science & Innovation Lab",
    desc: "Fully equipped science laboratories for Physics, Chemistry, and Biology. Students engage in hands-on experiments and innovative research projects throughout the year.",
    stat: "3",
    statLabel: "Smart Labs",
    gradient: "from-emerald-600 to-teal-600",
    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    hero: FEATURE_GALLERY[1].hero,
    photos: FEATURE_GALLERY[1].photos,
    details: [
      "3 fully equipped science laboratories",
      "Physics, Chemistry, and Biology labs",
      "Weekly hands-on experiment sessions",
      "Annual science fair and innovation expo",
      "STEM enrichment programs",
      "Digital microscopes and modern equipment",
    ],
  },
  {
    title: "Sports & Athletics",
    desc: "A champion in district-level sports tournaments. Our athletic program includes cricket, football, basketball, swimming, and athletics with professional coaching.",
    stat: "20+",
    statLabel: "Trophies Won",
    gradient: "from-orange-500 to-red-500",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    hero: FEATURE_GALLERY[2].hero,
    photos: FEATURE_GALLERY[2].photos,
    details: [
      "20+ district-level tournament trophies",
      "Cricket, football, basketball, and athletics",
      "Professional coaching staff",
      "Annual sports day and inter-school meets",
      "Fitness and physical education classes",
      "Swimming pool and running track",
    ],
  },
  {
    title: "Arts & Cultural Programs",
    desc: "Celebrating creativity through art exhibitions, music recitals, drama performances, and annual cultural festivals. Every child discovers their artistic side.",
    stat: "12+",
    statLabel: "Events Yearly",
    gradient: "from-purple-600 to-pink-600",
    icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3",
    hero: FEATURE_GALLERY[3].hero,
    photos: FEATURE_GALLERY[3].photos,
    details: [
      "12+ cultural events every year",
      "Art exhibitions and music recitals",
      "Annual cultural festival and drama nights",
      "Dance, painting, and craft workshops",
      "Debate and public speaking clubs",
      "Field trips to museums and galleries",
    ],
  },
  {
    title: "Digital Library",
    desc: "Over 10,000 books, digital resources, and e-learning materials. A quiet, modern reading space with internet access for research and self-study.",
    stat: "10K+",
    statLabel: "Books & Resources",
    gradient: "from-amber-500 to-orange-500",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    hero: FEATURE_GALLERY[4].hero,
    photos: FEATURE_GALLERY[4].photos,
    details: [
      "10,000+ books and digital resources",
      "E-learning materials and online databases",
      "Quiet reading zones and study carrels",
      "High-speed internet for research",
      "Book clubs and reading challenges",
      "Inter-library loan partnerships",
    ],
  },
  {
    title: "Safe & Inclusive Campus",
    desc: "CCTV-monitored campus with strict safety protocols. We foster an inclusive environment where every student feels welcome, respected, and valued.",
    stat: "100%",
    statLabel: "Secure Campus",
    gradient: "from-rose-500 to-pink-600",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    hero: FEATURE_GALLERY[5].hero,
    photos: FEATURE_GALLERY[5].photos,
    details: [
      "24/7 CCTV surveillance across campus",
      "Strict visitor check-in protocols",
      "Anti-bullying and inclusion programs",
      "Counseling and mental health support",
      "Fire safety and emergency drills",
      "Wheelchair-accessible facilities",
    ],
  },
];

export const PROGRAMS = [
  {
    class: "Play – KG",
    tag: "Early Learning",
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    subjects: ["Play-based Bangla & English", "Numbers, rhymes & drawing", "Moral stories, PE & habits"],
    size: "Small classes, caring teachers",
  },
  {
    class: "Primary (1 – 5)",
    tag: "Foundation",
    color: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    subjects: ["Bangla, English, Math", "Science, ICT & environment", "Art, sports & moral studies"],
    size: "Regular tests & progress reports",
  },
  {
    class: "High School (6 – 10)",
    tag: "Board Prep",
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/10 border-amber-500/20",
    subjects: ["Full board curriculum", "Science lab & computer classes", "Model tests & career guidance"],
    size: "SSC-focused preparation",
  },
];

export const PORTALS = [
  {
    id: "students",
    label: "Students",
    icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342",
    points: ["Class routine & assignments", "Exam results & admit cards", "Fees, notices & study materials"],
  },
  {
    id: "teachers",
    label: "Teachers",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    points: ["One-click attendance & marks entry", "Salary slips & leave application", "Routines, notices & exam duties"],
  },
  {
    id: "admin",
    label: "Admin",
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    points: ["Manage students, teachers & classes", "Fees, salaries & reports in one place", "Publish notices, routines & results"],
  },
];

export const ADMISSION_STEPS = [
  { n: "01", title: "Submit Online Form", desc: "Fill the 2-minute online application for Play to Class 10." },
  { n: "02", title: "Test & Interview", desc: "Short admission test in Bangla, English & Math + guardian meeting." },
  { n: "03", title: "Result & Payment", desc: "Result within 3 days via SMS. Pay admission fee online." },
  { n: "04", title: "Welcome to Campus", desc: "Collect books, ID card & class routine. Start journey." },
];

export const TOPPERS = [
  { name: "Ayesha Siddika", class: "Class 9 • GPA 5.00", quote: "Teachers stayed after class to help me with physics. I never felt alone before board exams." },
  { name: "Tanvir Hasan", class: "Class 8 • District Champion", quote: "I won district cricket while keeping 92% marks. Sports and study really go together here." },
  { name: "Nusrat Jahan", class: "Class 9 • Science Fair Winner", quote: "The innovation lab changed everything for me. My project went to the national fair." },
];

export const NOTICES = [
  { date: "12 Jan", tag: "Admission", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20", title: "Admission Test 2027 – Play to Class 10", desc: "Written test on Jan 18, 9AM. Bring admit card and report by 8:30AM." },
  { date: "05 Jan", tag: "Event", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/20", title: "Annual Sports Day & Science Fair", desc: "Feb 02 at school ground. Guardians are warmly invited." },
  { date: "28 Dec", tag: "Exam", color: "bg-amber-500/15 text-amber-400 border-amber-500/20", title: "Final Exam Routine Published", desc: "Check student portal for routine, seat plan and admit card." },
];

export const FAQS = [
  { q: "Which classes can I apply for?", a: "We admit from Play to Class 10 for the 2027 session. Seats are limited per section to keep class sizes small." },
  { q: "What are the fees?", a: "Admission fee ৳5,000 + monthly tuition depending on class (Play–Primary lower, High School slightly higher). Sibling discount and merit support are available — contact the office for the latest fee chart." },
  { q: "Is there an admission test?", a: "For Play–KG it is a simple oral interaction. For Class 1–10 there is a short test in Bangla, English and Math for the applied class, plus a guardian meeting." },
  { q: "How do I pay fees and check results?", a: "Everything runs online in our portal — students check attendance, exam results, fees and notices, with bKash/Nagad/bank payment options." },
  { q: "Is transport available?", a: "We serve Bhendabari, Pirgonj and nearby villages. Mention transport in the admission form and the office will confirm the nearest route." },
];

export const CONTACT_CARDS = [
  { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", title: "Visit Us", lines: ["Bhendabari, Pirgonj", "Rangpur, Bangladesh"] },
  { icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z", title: "Call Us", lines: ["+880 123 456 789", "Sat – Thu: 9AM – 4PM"] },
  { icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75", title: "Email Us", lines: ["info@littlestar.edu.bd", "admission@littlestar.edu.bd"] },
  { icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", title: "Office Hours", lines: ["Sat – Thu: 9AM – 4PM", "Friday: Closed"] },
];
