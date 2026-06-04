/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0b0f19",
          card: "rgba(17, 24, 39, 0.7)",
          border: "rgba(99, 102, 241, 0.15)",
          primary: "#6366f1", // Indigo
          hover: "#4f46e5",
          cyan: "#06b6d4" // secondary accent
        }
      },
      scale: {
        102: "1.02"
      }
    },
  },
  plugins: [],
}
