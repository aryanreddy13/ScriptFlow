/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brandBg: '#0A0A0A',
        brandFg: '#EAEAEA',
        brandAccent: '#E61919',
        brandSuccess: '#22C55E',
        brandWarning: '#EAB308',
        brandFailure: '#EF4444',
        panelBg: '#111111',
        panelBorder: '#222222',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
