/** @type {import('tailwindcss').Config} */
const { blackA, green, mauve, violet } = require("@radix-ui/colors");
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ...blackA,
        ...green,
        ...mauve,
        ...violet,
      },
      width: {
        processTab: "calc(100vw - 16rem)",
      },
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      height: {
        outputBox: "32rem",
      },
    },
  },
  plugins: [],
};
