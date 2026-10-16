import React from 'react';
import useColorMode from '../../hooks/useColorMode';

interface ThemeToggleProps {
	className?: string;
}

/** sun / moon button: shows the mode you switch to */
const ThemeToggle = ({ className = '' }: ThemeToggleProps) => {
	const { mode, toggleMode } = useColorMode();
	const isDark = mode === 'dark';

	return (
		<button
			type="button"
			onClick={toggleMode}
			aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
			title={isDark ? 'Light mode' : 'Dark mode'}
			className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-card border border-transparent p-0 text-muted transition-colors duration-150 ease-out hover:border-line hover:text-ink ${className}`}
		>
			{isDark ? (
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
					<path
						d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"
						stroke="currentColor"
						strokeWidth="1.75"
						strokeLinecap="round"
					/>
				</svg>
			) : (
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
						stroke="currentColor"
						strokeWidth="1.75"
						strokeLinejoin="round"
					/>
				</svg>
			)}
		</button>
	);
};

export default ThemeToggle;
