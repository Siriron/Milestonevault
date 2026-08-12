/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Vault design token system — a sealed chamber that only opens
        // when independently-fetched evidence matches a locked target.
        // Not courtroom (Copyleft/Ledger), not negotiation (Recourse) —
        // an escrow that stays shut until a checkable fact is true.
        parchment: {
          DEFAULT: '#F0EAE0',
          dim: '#E5DCCC',
        },
        vault: {
          DEFAULT: '#3D2B1F', // deep bronze — the vault body itself
          dark: '#2A1D14',
        },
        copper: {
          DEFAULT: '#B87333', // the release moment — used sparingly
          bright: '#CF8A45',
        },
        pending: '#4A5C4E', // locked / awaiting attempt
        dead: '#8B4433', // failed fetch / not_met — muted rust, never alarm-red
        ink: '#1A1611',
      },
      fontFamily: {
        // Clarendon-genre slab serif for display — stamped/engraved
        // register (a vault door, a seal), deliberately NOT a warm
        // editorial serif like Fraunces/Playfair, which reads as the
        // AI-generated default regardless of accent color chosen
        // alongside it. Roboto Slab is Clarendon-genre: bracketed
        // serifs matching stroke weight, mechanistic rather than
        // refined.
        display: ['"Roboto Slab"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        data: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
