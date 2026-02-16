/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'ekia-dark': '#1a1a1a',
        'ekia-gray': '#fafafa',
        'ekia-barn': '#22c55e',      // Grön för barn
        'ekia-ungdom': '#a855f7',    // Lila för ungdom
        'ekia-vuxen': '#3b82f6',     // Blå för vuxen
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
