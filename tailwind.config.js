/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#3B82F6',
          red: '#EF4444',
          green: '#10B981'
        }
      }
    }
  },
  plugins: []
}