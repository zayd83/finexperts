// Config voor Tailwind CDN (editorial basis: kleuren, fonts, layout)
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      colors: {
        paper: '#F3F4F1',
        surface: '#FBFBF9',
        ink: '#17201C',
        'ink-muted': '#56605A',
        line: '#DADDD6',
        brand: {
          50: '#EEF2F7',
          100: '#D8E1EC',
          200: '#B3C4D8',
          300: '#84A0BF',
          400: '#4F739A',
          500: '#2E5077',
          600: '#1E3A5F',
          700: '#152B47',
          800: '#0F2036',
          900: '#0B1826'
        }
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace']
      },
      maxWidth: {
        content: '1200px'
      }
    }
  }
};
