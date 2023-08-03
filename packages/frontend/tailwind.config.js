/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    daisyui: {
      themes: ["light", "dark", "halloween"],
    },
    extend: {
      colors: {
        'btn-signup' : "#74C5F8",
        'btn-login' : "#DC832B",
        'link' : "#5F8297",
      },
    },
  },
  plugins: [require("daisyui")],
}

