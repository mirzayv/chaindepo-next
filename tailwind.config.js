/** @type {import('tailwindcss').Config} */
module.exports = {
	// html.dark is set before paint (pages/_document.tsx) and toggled by libs/hooks/useColorMode.ts
	darkMode: 'class',
	// Only the new Tailwind files are scanned, so class names in MUI/SCSS files never generate utilities.
	content: [
		'./pages/index.tsx',
		'./pages/shipment/detail.tsx',
		'./pages/shipment/index.tsx',
		'./pages/carrier/index.tsx',
		'./libs/components/shipment/Filter.tsx',
		'./libs/components/common/CarrierCard.tsx',
		'./pages/community/index.tsx',
		'./pages/community/write.tsx',
		'./libs/components/community/CommunityNav.tsx',
		'./libs/components/common/CommunityCard.tsx',
		'./pages/cs/index.tsx',
		'./libs/components/cs/Notice.tsx',
		'./libs/components/cs/Faq.tsx',
		'./pages/account/join.tsx',
		'./libs/components/mypage/MyMenu.tsx',
		'./libs/components/member/MemberMenu.tsx',
		'./pages/about/index.tsx',
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
			// values live in scss/theme.css (light on :root, dark on html.dark) as "R G B" channels
			colors: {
				ink: 'rgb(var(--cd-ink) / <alpha-value>)',
				muted: 'rgb(var(--cd-muted) / <alpha-value>)',
				line: 'rgb(var(--cd-line) / <alpha-value>)',
				surface: 'rgb(var(--cd-surface) / <alpha-value>)',
				card: 'rgb(var(--cd-card) / <alpha-value>)',
				page: 'rgb(var(--cd-page) / <alpha-value>)',
				navy: 'rgb(var(--cd-navy) / <alpha-value>)',
				hero: 'rgb(var(--cd-hero) / <alpha-value>)',
				accent: {
					DEFAULT: 'rgb(var(--cd-accent) / <alpha-value>)',
					hover: 'rgb(var(--cd-accent-hover) / <alpha-value>)',
				},
				ok: 'rgb(var(--cd-ok) / <alpha-value>)',
				warn: 'rgb(var(--cd-warn) / <alpha-value>)',
				bad: 'rgb(var(--cd-bad) / <alpha-value>)',
			},
			borderRadius: {
				card: '20px',
			},
			boxShadow: {
				card: '0 1px 2px rgba(11, 34, 54, 0.04)',
			},
			fontFamily: {
				sans: ['var(--font-sans)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
				mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
			},
			fontSize: {
				display: ['clamp(2.75rem, 6vw, 5rem)', { lineHeight: '1', letterSpacing: '-0.035em' }],
				h2: ['1.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
				// big Salmon-style section headings on the home page
				section: ['clamp(2.25rem, 4.6vw, 4rem)', { lineHeight: '1.02', letterSpacing: '-0.035em' }],
				h3: ['1.25rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
				body: ['1.0625rem', { lineHeight: '1.55', letterSpacing: '-0.005em' }],
				small: ['0.8125rem', { lineHeight: '1.45', letterSpacing: '0.005em' }],
			},
			maxWidth: {
				page: '1280px',
			},
		},
	},
	plugins: [],
};
