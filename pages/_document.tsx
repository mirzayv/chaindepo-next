import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Runs before first paint: stored choice (localStorage 'cd-theme', see libs/hooks/useColorMode.ts),
 * else the OS setting. Sets html.dark so there is no white flash in dark mode.
 */
const COLOR_MODE_SCRIPT = `(function(){try{var m=localStorage.getItem('cd-theme');if(m!=='dark'&&m!=='light'){m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}if(m==='dark'){document.documentElement.classList.add('dark')}document.documentElement.style.colorScheme=m}catch(e){}})();`;

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<script dangerouslySetInnerHTML={{ __html: COLOR_MODE_SCRIPT }} />
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />

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
