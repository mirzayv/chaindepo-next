import React from 'react';

interface LogoProps {
	/** rendered height in px; width scales with it */
	size?: number;
	/** wordmark colour; the square is always the accent */
	color?: string;
	className?: string;
}

/** ChainDepo wordmark: a solid accent square followed by lowercase "chaindepo" in Inter Bold. */
const Logo = ({ size = 24, color = '#0B2236', className }: LogoProps) => {
	return (
		<svg
			className={className}
			height={size}
			width={(size * 128) / 24}
			viewBox="0 0 128 24"
			overflow="visible"
			role="img"
			aria-label="chaindepo"
		>
			<rect x="0" y="5" width="14" height="14" rx="2" fill="#2F8FB5" />
			<text
				x="21"
				y="18.5"
				fill={color}
				style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}
			>
				chaindepo
			</text>
		</svg>
	);
};

export default Logo;
