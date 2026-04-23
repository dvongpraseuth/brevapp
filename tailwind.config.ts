import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: {
    fontFamily: { sora: ['Sora', 'sans-serif'], nunito: ['Nunito', 'sans-serif'] },
    colors: {
      brand: { bg:'#F8F7F3', card:'#FFFFFF', border:'#E8E5DC', text:'#1C1917', muted:'#78716C' },
      xp: '#7C3AED', streak: '#EA580C', reward: '#0369A1',
    },
    maxWidth: { mobile: '430px' }
  }},
  plugins: [],
}
export default config
