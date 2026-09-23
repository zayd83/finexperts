// Config voor Tailwind CDN (eigen fonts, kleuren, shadows, bg)
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Poppins', 'Inter', 'ui-sans-serif']
      },
      colors: {
        brand: {
          50: '#EAF2EE',
          100: '#D3E4DC',
          200: '#A9C9BB',
          300: '#7FAE9A',
          400: '#4F8D74',
          500: '#2E6E56',
          600: '#1F5D4C',
          700: '#164236',
          800: '#103328',
          900: '#0C271F'
        },
        paper: '#F4F5F2',
        surface: '#FBFBFA',
        ink: '#1C211E',
        'ink-muted': '#55605A',
        line: '#DCDFD9'
      },
      boxShadow: {
        card: '0 12px 40px rgba(2, 12, 27, 0.18)',
        glow: '0 0 40px rgba(46,110,86,0.25)'
      },
      backgroundImage: {
        mesh:
          'radial-gradient(1000px 600px at 10% 10%, rgba(28,33,30,.03), transparent 60%), radial-gradient(800px 600px at 90% 0%, rgba(28,33,30,.02), transparent 60%)'
      }
    }
  }
};
