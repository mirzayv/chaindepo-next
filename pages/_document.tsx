import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
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
