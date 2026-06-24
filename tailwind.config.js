/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta extraída del sitio original de Gifty
        rosa: {
          DEFAULT: '#e91e8c',
          claro: '#f06ab0',
          suave: '#fce7f3',
          hero: '#FF77EC',
        },
        marino: {
          DEFAULT: '#1a2b5e',
          oscuro: '#0f1c3f',
        },
      },
      fontFamily: {
        // Dancing Script para el título cursivo del hero
        script: ['Dancing Script', 'cursive'],
        // Playfair Display para títulos
        serif: ['Playfair Display', 'Georgia', 'serif'],
        // Lato para el cuerpo del texto
        sans: ['Lato', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
