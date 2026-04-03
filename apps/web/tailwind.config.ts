import type { Config } from 'tailwindcss'

// Tailwind v4 is CSS-first - design tokens are defined via @theme in globals.css.
// Dark mode via prefers-color-scheme is the v4 default - no darkMode key needed.
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
}

export default config
