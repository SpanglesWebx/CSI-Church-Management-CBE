/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "lavender--600": "#5c95e0",
        "lavender-light-400": "#b1c9ef",
      },
    }, 
  },
  plugins: [require("flowbite/plugin")],
};