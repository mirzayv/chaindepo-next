import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';

interface CopyButtonProps {
	value: string;
	/** what is being copied, for screen readers: "Copy tracking code" */
	label: string;
	className?: string;
}

/** small icon button; shows "Copied" for 1.5s and announces it */
const CopyButton = ({ value, label, className = '' }: CopyButtonProps) => {
	const { t } = useTranslation('common');
	const [copied, setCopied] = useState<boolean>(false);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, []);

	const copyHandler = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			if (timer.current) clearTimeout(timer.current);
			timer.current = setTimeout(() => setCopied(false), 1500);
		} catch (err: any) {
			console.log('ERROR, copyHandler:', err.message);
		}
	};

	return (
		<span className={`inline-flex items-center gap-1 ${className}`}>
			<button
				type="button"
				onClick={copyHandler}
				aria-label={label}
				title={label}
				className="flex h-7 w-7 items-center justify-center rounded-card p-0 text-muted transition-colors duration-150 ease-out hover:bg-surface hover:text-ink active:scale-95 motion-reduce:transform-none"
			>
				{copied ? (
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d="M3 8.5l3 3 7-7" stroke="#1E8E5A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				) : (
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<rect x="5" y="5" width="8.5" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
						<path d="M10.5 5V3.5A1 1 0 009.5 2.5h-6a1 1 0 00-1 1v6a1 1 0 001 1H5" stroke="currentColor" strokeWidth="1.4" />
					</svg>
				)}
			</button>
			<span aria-live="polite" className={`text-small leading-none text-ok ${copied ? '' : 'sr-only'}`}>
				{copied ? t('Copied') : ''}
			</span>
		</span>
	);
};

export default CopyButton;
