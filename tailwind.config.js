/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "navy-blue": "#04384E",
        "light-white": "rgba(255, 255, 255,0.18)",
        "main-color": "#F0F4F7",
        "btn-color-blue": "#0E94D3",
        "text-blue": "#04384E",
        "btn-color-gray": "#C1C0C0",
      },
      spacing: {
        sidebar: "18rem",
        "sidebar-collapsed": "5rem",
        "navbar-height": "3.5rem",
      },
      fontFamily: {
        title: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
