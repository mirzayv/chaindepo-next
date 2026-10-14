/** @type {import('tailwindcss').Config} */
module.exports = {
	// Only the new Tailwind files are scanned, so class names in MUI/SCSS files never generate utilities.
	content: [
		'./pages/index.tsx',
		'./pages/shipment/detail.tsx',
		'./libs/components/Top.tsx',
		'./libs/components/Footer.tsx',
		'./libs/components/layout/**/*.{ts,tsx}',
		'./libs/components/ui/**/*.{ts,tsx}',
		'./libs/components/home/**/*.{ts,tsx}',
		'./libs/components/tracking/**/*.{ts,tsx}',
		'./libs/components/widget/**/*.{ts,tsx}',
	],
	// Preflight off so existing MUI pages keep their styles; container off to avoid clashing with SCSS .container
	corePlugins: {
		preflight: false,
		container: false,
	},
	theme: {
		extend: {
			colors: {
				ink: '#0B2236',
				muted: '#5A6B7B',
				line: '#E3E8EE',
				surface: '#F5F7F9',
				accent: {
					DEFAULT: '#2F8FB5',
					hover: '#26789A',
				},
				ok: '#1E8E5A',
				warn: '#E0A100',
				bad: '#C62828',
			},
			borderRadius: {
				card: '6px',
			},
			boxShadow: {
				card: '0 1px 2px rgba(11, 34, 54, 0.04)',
			},
			fontFamily: {
				sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
				mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
			},
			fontSize: {
				display: ['clamp(2.25rem, 4.5vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
				h2: ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
				h3: ['1.125rem', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
				body: ['1rem', { lineHeight: '1.55', letterSpacing: '0' }],
				small: ['0.8125rem', { lineHeight: '1.45', letterSpacing: '0.005em' }],
			},
			maxWidth: {
				page: '1200px',
			},
		},
	},
	plugins: [],
};
