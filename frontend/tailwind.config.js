/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      animation: {
        float: "float 5s ease-in-out infinite",
        "float-delayed": "float-delayed 4s ease-in-out infinite 1s",
        "float-slow": "float-slow 6s ease-in-out infinite 0.5s",
      },
    },
  },
  plugins: [],
};
