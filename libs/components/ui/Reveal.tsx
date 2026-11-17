import React, { ElementType, ReactNode, useEffect, useRef, useState } from 'react';

interface RevealProps {
	children: ReactNode;
	as?: ElementType;
	className?: string;
	/** extra delay in ms, for staggering items in a row */
	delay?: number;
}

/** fades and lifts its content in the first time it scrolls into view (no motion with prefers-reduced-motion) */
const Reveal = ({ children, as: Tag = 'div', className = '', delay = 0 }: RevealProps) => {
	const ref = useRef<HTMLElement>(null);
	const [visible, setVisible] = useState<boolean>(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ rootMargin: '0px 0px -10% 0px' },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<Tag
			ref={ref}
			className={`cd-reveal ${visible ? 'is-visible' : ''} ${className}`}
			style={delay ? { transitionDelay: `${delay}ms` } : undefined}
		>
			{children}
		</Tag>
	);
};

export default Reveal;
