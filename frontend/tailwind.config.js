/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#12131A",       // page background
        surface: "#1B1D27",   // cards / panels
        surface2: "#242733",  // raised elements, inputs
        line: "#31333F",      // hairline borders
        text: "#E8E6F0",
        muted: "#9A98A8",
        signal: "#7C6CFF",    // primary accent -- "signal" violet
        agree: "#4FD1C5",     // agree reply type
        challenge: "#F2A65A", // challenge reply type
        danger: "#F26A6A",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
