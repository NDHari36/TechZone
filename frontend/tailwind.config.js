/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    fontFamily:{
      Bitcount:["Bitcount Grid Single", "system-ui"],
      Marker:["Permanent Marker", "cursive"],
      Bebas:["Bebas Neue", "cursive"],
      Roboto:["Roboto", "sans-serif"]
    }
  },
  plugins: [],
}
