import React from 'react';

interface LogoProps {
	/** rendered height in px; width scales with it */
	size?: number;
	/** wordmark and parcel colour */
	color?: string;
	/** colour behind the logo, used for the parcel's fold lines and the badge ring */
	background?: string;
	/** render only the parcel mark, without the wordmark */
	markOnly?: boolean;
	className?: string;
}

/**
 * ChainDepo logo: a parcel with a "verified" check badge, followed by lowercase "chaindepo".
 * Defaults follow the theme tokens, so it works in light and dark mode.
 */
const Logo = ({
	size = 24,
	color = 'rgb(var(--cd-ink))',
	background = 'rgb(var(--cd-page))',
	markOnly = false,
	className,
}: LogoProps) => {
	const width = markOnly ? 24 : 136;
	return (
		<svg
			className={className}
			height={size}
			width={(size * width) / 24}
			viewBox={`0 0 ${width} 24`}
			overflow="visible"
			role="img"
			aria-label="chaindepo"
		>
			<g transform="scale(0.5)">
				<path d="M24 3 43 13v22L24 45 5 35V13Z" fill={color} />
				<path d="M5 13l19 10 19-10M24 23v22" stroke={background} strokeWidth="2.5" fill="none" opacity="0.25" />
				<circle cx="36" cy="36" r="10" fill="rgb(var(--cd-accent))" stroke={background} strokeWidth="3" />
				<path
					d="m31.5 36 3.2 3.2 5.8-6.4"
					stroke="#fff"
					strokeWidth="3"
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
			{!markOnly && (
				<text
					x="31"
					y="18.5"
					fill={color}
					style={{
						fontFamily: 'var(--font-sans), var(--font-inter), system-ui, sans-serif',
						fontWeight: 800,
						fontSize: 20,
						letterSpacing: '-0.04em',
					}}
				>
					chaindepo
				</text>
			)}
		</svg>
	);
};

export default Logo;
