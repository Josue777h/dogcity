/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        brand: 'var(--primary-brand, #0284C7)',
        'brand-dark': '#0369A1',
        canvas: '#F8FAFC',
        ink: '#0F172A',
        muted: '#64748B',
        success: '#059669',
        warning: '#D97706',
        danger: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.04)',
        popover: '0 12px 32px rgb(15 23 42 / 0.12)',
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
};
