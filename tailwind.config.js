/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        almostBlack: "#282828",
        darkerAlmostBlack: "#1a1a1a",
        ytRed: "#FF0000",
        darkerYtRed: "#cc0000",
        almostWhite: "#efefef",
      },
    },
  },
  plugins: [],
};
