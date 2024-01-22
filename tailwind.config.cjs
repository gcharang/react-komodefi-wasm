/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryLight: "#11182f",
        primaryLighter: "#131d3b",
        primaryBg: colors.slate,
        secondary: colors.blue,
        accent: "",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
