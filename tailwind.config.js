/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        papel: '#F4ECD8',
        tinta: '#2B2522',
        rojo: '#C0392B',
        confirmar: '#1E6F5C',
        sello: '#B5651D',
        oro: '#D4AF37',
      },
      fontFamily: {
        mano: ['"Patrick Hand"', 'cursive'],
        mono: ['"DM Mono"', 'monospace'],
      },
      boxShadow: {
        mesa: '0 6px 0 rgba(43,37,34,.12)',
      },
    },
  },
  plugins: [],
}
