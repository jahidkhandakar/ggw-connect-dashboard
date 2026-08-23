/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Match the Flutter app: navy + gold (spec §14 branding).
        navy: {
          DEFAULT: "#0B1E3F",
          light: "#13294B",
          dark: "#081730",
        },
        gold: {
          DEFAULT: "#C9A227",
          light: "#E0C158",
          dark: "#9C7C15",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
