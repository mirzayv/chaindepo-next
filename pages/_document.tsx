import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Runs before first paint: stored choice (localStorage 'cd-theme', see libs/hooks/useColorMode.ts),
 * else light (the default look). Sets html.dark so there is no white flash in dark mode.
 */
const COLOR_MODE_SCRIPT = `(function(){try{var m=localStorage.getItem('cd-theme');if(m!=='dark'&&m!=='light'){m='light'}if(m==='dark'){document.documentElement.classList.add('dark')}document.documentElement.style.colorScheme=m}catch(e){}})();`;

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<script dangerouslySetInnerHTML={{ __html: COLOR_MODE_SCRIPT }} />
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
				<link rel="icon" type="image/png" sizes="192x192" href="/logo/icon-192.png" />
				<link rel="apple-touch-icon" sizes="180x180" href="/logo/apple-touch-icon.png" />

				{/* SEO */}
				<meta name="keywords" content={'chaindepo, shipment tracking, logistics, korea, blockchain, sepolia'} />
				<meta
					name={'description'}
					content={
						'ChainDepo tracks shipments across Korea. Every tracking event is SHA-256 hash-chained and anchored on Ethereum Sepolia, so anyone can verify it.'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
