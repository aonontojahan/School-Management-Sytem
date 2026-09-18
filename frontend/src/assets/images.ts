/**
 * All landing page images — stored locally in /public/images/
 *
 * To replace a photo:
 *   1. Drop your JPG/PNG in the matching folder
 *   2. Make sure the file name matches
 *   3. Done — no code changes needed
 */

export const FEATURE_GALLERY = [
  {
    id: "academic",
    hero: "/images/features/academic/classroom.jpg",
    photos: [
      { src: "/images/features/academic/classroom.jpg", caption: "Students engaged in classroom learning with modern teaching methods" },
      { src: "/images/features/academic/mentoring.jpg", caption: "One-on-one mentoring sessions with experienced teachers" },
      { src: "/images/features/academic/library-study.jpg", caption: "Library study hours for self-directed academic growth" },
      { src: "/images/features/academic/exhibition.jpg", caption: "Annual science and academic exhibition showcasing student work" },
    ],
  },
  {
    id: "science",
    hero: "/images/features/science/chemistry-lab.jpg",
    photos: [
      { src: "/images/features/science/chemistry-lab.jpg", caption: "Hands-on chemistry experiments in our fully equipped lab" },
      { src: "/images/features/science/physics-lab.jpg", caption: "Physics lab sessions with modern apparatus and equipment" },
      { src: "/images/features/science/biology-lab.jpg", caption: "Biology lab with digital microscopes and specimens" },
      { src: "/images/features/science/science-fair.jpg", caption: "Annual science fair where students present innovative projects" },
    ],
  },
  {
    id: "sports",
    hero: "/images/features/sports/cricket.jpg",
    photos: [
      { src: "/images/features/sports/cricket.jpg", caption: "Inter-house cricket tournament with professional coaching" },
      { src: "/images/features/sports/football.jpg", caption: "Football practice sessions on our full-size ground" },
      { src: "/images/features/sports/basketball.jpg", caption: "Basketball court during inter-school championship matches" },
      { src: "/images/features/sports/swimming.jpg", caption: "Swimming pool and indoor sports facilities for year-round training" },
    ],
  },
  {
    id: "arts",
    hero: "/images/features/arts/art-exhibition.jpg",
    photos: [
      { src: "/images/features/arts/art-exhibition.jpg", caption: "Art exhibition featuring student paintings and sculptures" },
      { src: "/images/features/arts/music-room.jpg", caption: "Music room with instruments for vocal and instrumental training" },
      { src: "/images/features/arts/cultural-night.jpg", caption: "Annual cultural night with drama, dance, and music performances" },
      { src: "/images/features/arts/workshop.jpg", caption: "Creative arts workshop with professional guest artists" },
    ],
  },
  {
    id: "library",
    hero: "/images/features/library/reading-hall.jpg",
    photos: [
      { src: "/images/features/library/reading-hall.jpg", caption: "Modern reading hall with thousands of books and e-resources" },
      { src: "/images/features/library/digital-section.jpg", caption: "Digital section with computers for online research and e-learning" },
      { src: "/images/features/library/study-carrels.jpg", caption: "Quiet study carrels for focused self-study sessions" },
      { src: "/images/features/library/book-club.jpg", caption: "Book club meetings and reading challenges held weekly" },
    ],
  },
  {
    id: "safety",
    hero: "/images/features/safety/cctv-campus.jpg",
    photos: [
      { src: "/images/features/safety/cctv-campus.jpg", caption: "24/7 CCTV-monitored campus with security personnel on duty" },
      { src: "/images/features/safety/inclusive-class.jpg", caption: "Inclusive classrooms designed for students of all abilities" },
      { src: "/images/features/safety/safety-drill.jpg", caption: "Regular safety drills and emergency preparedness training" },
      { src: "/images/features/safety/counseling.jpg", caption: "On-campus counseling center for student mental health support" },
    ],
  },
] as const;

export const IMAGES = {
  hero: "/images/hero/school-building.jpg",
  about: {
    campus: "/images/about/campus.jpg",
    founder: "/images/about/founder.jpg",
    students: "/images/about/students.jpg",
  },
} as const;
