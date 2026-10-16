import React from 'react';

interface PaginationProps {
	page: number;
	count: number;
	onChange: (page: number) => void;
	className?: string;
}

/** page numbers with ellipses: 1 … 4 5 6 … 12 */
const pagesAround = (page: number, count: number): (number | 'gap')[] => {
	if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
	const pages: (number | 'gap')[] = [1];
	const start = Math.max(2, page - 1);
	const end = Math.min(count - 1, page + 1);
	if (start > 2) pages.push('gap');
	for (let i = start; i <= end; i++) pages.push(i);
	if (end < count - 1) pages.push('gap');
	pages.push(count);
	return pages;
};

const baseButton =
	'inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-card border px-3 text-small font-medium transition-colors duration-150 ease-out disabled:cursor-default disabled:opacity-40';

/** accent pagination for the Tailwind pages */
const Pagination = ({ page, count, onChange, className = '' }: PaginationProps) => {
	if (count <= 1) return null;

	return (
		<nav aria-label="Pagination" className={`flex flex-wrap items-center justify-center gap-1.5 ${className}`}>
			<button
				type="button"
				className={`${baseButton} border-line bg-card text-ink hover:border-accent hover:text-accent`}
				onClick={() => onChange(page - 1)}
				disabled={page <= 1}
				aria-label="Previous page"
			>
				←
			</button>
			{pagesAround(page, count).map((item, index) =>
				item === 'gap' ? (
					<span key={`gap-${index}`} className="px-1 text-small text-muted" aria-hidden="true">
						…
					</span>
				) : (
					<button
						key={item}
						type="button"
						className={
							item === page
								? `${baseButton} border-accent bg-accent text-white`
								: `${baseButton} border-line bg-card text-ink hover:border-accent hover:text-accent`
						}
						onClick={() => onChange(item)}
						aria-current={item === page ? 'page' : undefined}
					>
						{item}
					</button>
				),
			)}
			<button
				type="button"
				className={`${baseButton} border-line bg-card text-ink hover:border-accent hover:text-accent`}
				onClick={() => onChange(page + 1)}
				disabled={page >= count}
				aria-label="Next page"
			>
				→
			</button>
		</nav>
	);
};

export default Pagination;
