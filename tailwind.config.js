/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'airbnb-red': '#FF5A5F',
        'airbnb-dark': '#484848',
        'airbnb-light': '#F7F7F7',
        'airbnb-rausch': '#FF5A5F',
        'airbnb-babu': '#00A699',
        'airbnb-arches': '#FC642D',
        'airbnb-hof': '#767676',
        'airbnb-foggy': '#484848'
      },
      fontFamily: {
        'sans': ['Circular', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [],
}