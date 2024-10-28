/** @type {import('tailwindcss').Config} */

export default {
    content: [
        "./index.html",
        "./src/**/*.{svelte,js,ts,jsx,tsx}",
      ],
  theme: {
    extend: {
        colors: {
            'primary': '#2c2c2c',
            'secondary': '#424050',
            'accent': '#d50000',

            'success': '#00ff00',
            'error': '#FF0000',

            'txt-primary': '#faf7ff',
            'txt-secondary': '#2b2b2b',
        },
    },
  },
  plugins: [],
}

