import React from 'react';

/** the Ethereum diamond, drawn in the current text colour */
const EthereumMark = ({ size = 16, className }: { size?: number; className?: string }) => (
	<svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
		<path d="M8 0.5 3.2 8.3 8 11.1l4.8-2.8z" opacity="0.9" />
		<path d="M8 12 3.2 9.2 8 15.5l4.8-6.3z" opacity="0.65" />
	</svg>
);

export default EthereumMark;
