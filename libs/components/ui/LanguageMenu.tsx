import React, { useEffect, useId, useRef, useState } from 'react';

export interface LanguageOption {
	code: string;
	/** short code shown on the button */
	label: string;
	/** the language's own name, shown in the list */
	name: string;
}

/** small rounded flags, drawn inline so they look the same on every OS (emoji flags do not render on Windows) */
const Flag = ({ code, size = 20 }: { code: string; size?: number }) => {
	const common = { width: size, height: size, viewBox: '0 0 20 20', 'aria-hidden': true } as const;
	return (
		<svg {...common} className="shrink-0 overflow-hidden rounded-full shadow-[0_0_0_1px_rgba(19,20,22,0.12)]">
			{/* the svg itself is clipped to a circle by rounded-full + overflow-hidden */}
			<g>
				{code === 'en' && (
					<>
						<rect width="20" height="20" fill="#FFFFFF" />
						{[0, 2, 4, 6, 8, 10, 12].map((i) => (
							<rect key={i} y={i * 1.54} width="20" height="1.54" fill="#B22234" />
						))}
						<rect width="10" height="10.8" fill="#3C3B6E" />
						{[2.2, 5, 7.8].map((x) => [2.2, 5.4, 8.6].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.7" fill="#fff" />))}
					</>
				)}
				{code === 'kr' && (
					<>
						<rect width="20" height="20" fill="#FFFFFF" />
						<path d="M5.6 10a4.4 4.4 0 0 1 8.8 0 2.2 2.2 0 0 1-4.4 0 2.2 2.2 0 0 0-4.4 0z" fill="#CD2E3A" />
						<path d="M14.4 10a4.4 4.4 0 0 1-8.8 0 2.2 2.2 0 0 1 4.4 0 2.2 2.2 0 0 0 4.4 0z" fill="#0047A0" />
						<g stroke="#111" strokeWidth="0.9">
							<path d="M2.4 5.6 4.6 3M3 6.2l2.2-2.6M3.6 6.8l2.2-2.6" />
							<path d="M14.4 3.2l2.2 2.6M15 2.6l2.2 2.6M15.6 2l2.2 2.6" />
							<path d="M2.4 14.4 4.6 17M3 13.8l2.2 2.6M3.6 13.2l2.2 2.6" />
							<path d="M14.4 16.8l2.2-2.6M15 17.4l2.2-2.6M15.6 18l2.2-2.6" />
						</g>
					</>
				)}
				{code === 'ru' && (
					<>
						<rect width="20" height="6.67" fill="#FFFFFF" />
						<rect y="6.67" width="20" height="6.67" fill="#0039A6" />
						<rect y="13.33" width="20" height="6.67" fill="#D52B1E" />
					</>
				)}
			</g>
		</svg>
	);
};

interface LanguageMenuProps {
	value: string;
	options: LanguageOption[];
	onChange: (code: string) => void;
	label: string;
	/** open the list below (header) or above (bottom of the mobile menu) */
	placement?: 'down' | 'up';
	className?: string;
}

/** language picker: flag + code button, list of flags with each language's own name */
const LanguageMenu = ({ value, options, onChange, label, placement = 'down', className = '' }: LanguageMenuProps) => {
	const [open, setOpen] = useState<boolean>(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const listId = useId();
	const current = options.find((option) => option.code === value) ?? options[0];

	/** LIFECYCLES **/
	useEffect(() => {
		if (!open) return;
		const onPointerDown = (e: PointerEvent) => {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
		};
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [open]);

	return (
		<div ref={rootRef} className={`relative ${className}`}>
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listId}
				aria-label={`${label}: ${current.name}`}
				className="flex h-11 items-center gap-2 rounded-full bg-transparent px-3 text-[0.9375rem] font-semibold text-ink transition-colors duration-150 hover:bg-surface"
			>
				<Flag code={current.code} />
				<span>{current.label}</span>
				<svg
					width="12"
					height="12"
					viewBox="0 0 12 12"
					fill="none"
					aria-hidden="true"
					className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
				>
					<path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</button>

			<ul
				id={listId}
				role="listbox"
				aria-label={label}
				className={`absolute right-0 z-[1300] m-0 w-48 list-none rounded-2xl bg-card p-1.5 shadow-[0_12px_40px_rgba(19,20,22,0.16)] ring-1 ring-line transition duration-150 ease-out motion-reduce:transition-opacity ${
					placement === 'up' ? 'bottom-full mb-2 origin-bottom-right' : 'top-full mt-2 origin-top-right'
				} ${open ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0 motion-reduce:scale-100'}`}
			>
				{options.map((option) => {
					const selected = option.code === value;
					return (
						<li key={option.code} role="option" aria-selected={selected}>
							<button
								type="button"
								onClick={() => {
									setOpen(false);
									if (!selected) onChange(option.code);
								}}
								className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.9375rem] font-medium transition-colors duration-150 ${
									selected ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-surface'
								}`}
							>
								<Flag code={option.code} size={22} />
								<span className="flex-1">{option.name}</span>
								{selected && (
									<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
										<path d="m3 7.3 2.6 2.6L11 4.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								)}
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default LanguageMenu;
