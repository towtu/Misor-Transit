/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          950: '#172554',
          900: '#1e3a5f',
          800: '#1e40af',
        },
        brand: {
          primary: '#2563EB',
          secondary: '#3B82F6',
          accent: '#059669',  // available green (booking app)
          cta: '#F97316',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
