/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5', // indigo-600
        danger: '#dc2626', // red-600
        warning: '#f59e0b', // amber-500
        success: '#16a34a', // green-600
        info: '#2563eb', // blue-600
      },
    },
  },
  plugins: [],
};
