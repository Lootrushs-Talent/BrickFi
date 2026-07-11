/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        estate: {
          950: "#0b100e",
          900: "#111815",
          800: "#18221d",
          700: "#22302a",
          600: "#2d3f37",
          200: "#c5d1c8",
          100: "#e7ece8",
        },
        gold: {
          DEFAULT: "#c4a574",
          light: "#e8d2a8",
          dark: "#8d7344",
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 24px 60px -28px rgba(0, 0, 0, 0.65)",
      },
    },
  },
  plugins: [],
};
