/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: {
          ...defaultTheme.colors.blue,
          custom: "#04384E",
        },
      },
    },
  },
  plugins: [],
};
