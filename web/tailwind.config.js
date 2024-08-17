/** @type {import('tailwindcss').Config} */



// --primary: #2c2c2c;
// --secondary: #424050;
// --accent: #8685ef;

// --text-primary: #faf7ff;
// --text-secondary: #2b2b2b;


export default {
    content: [
        "./index.html",
        "./src/**/*.{svelte,js,ts,jsx,tsx}",
      ],
  theme: {
    extend: {
        colors: {
            'primary': '#121212',
            'secondary': '#2A2A2A',
            'accent': '#CC0000',

            'success': '#3de16a',
            'error': '#d91a30',

            'txt-primary': '#fff',
            'txt-secondary': '#000',
        },
    },
  },
  plugins: [],
}

