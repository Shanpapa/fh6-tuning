/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0a0a0c',
        surf:     '#141416',
        surf2:    '#1c1c20',
        surf3:    '#242428',
        border:   '#2c2c32',
        borderHi: '#3c3c44',
        accent:   '#f97316',
        blue:     '#38bdf8',
        green:    '#4ade80',
        red:      '#f87171',
        yellow:   '#fbbf24',
        dim:      '#71717a',
        mid:      '#a1a1aa',
        text:     '#e4e4e7',
      },
      fontFamily: {
        barlow: ['"Barlow Condensed"', 'sans-serif'],
        sans:   ['Inter', 'system-ui', 'sans-serif'],
        mono:   ['"Space Mono"', 'monospace'],
      },
      fontSize: {
        'xs':   ['12px', { lineHeight: '1.5' }],
        'sm':   ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.6' }],
        'lg':   ['18px', { lineHeight: '1.5' }],
        'xl':   ['20px', { lineHeight: '1.4' }],
        '2xl':  ['24px', { lineHeight: '1.3' }],
        '3xl':  ['30px', { lineHeight: '1.25' }],
        '4xl':  ['36px', { lineHeight: '1.2' }],
        '5xl':  ['48px', { lineHeight: '1.1' }],
        '6xl':  ['64px', { lineHeight: '1.0' }],
      },
    },
  },
  plugins: [],
}
