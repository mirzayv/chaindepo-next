import React from 'react';
import Link from 'next/link';
import { communityCategories } from '../../config';

interface CommunityNavProps {
	/** current board, highlighted */
	active?: string;
}

/** board list + write button, shared by the community list and detail pages */
const CommunityNav = ({ active }: CommunityNavProps) => {
	return (
		<nav aria-label="Community boards" className="flex flex-col gap-3">
			<ul className="m-0 flex list-none gap-1 overflow-x-auto p-0 lg:flex-col">
				{communityCategories.map((category) => {
					const isActive = category.value === active;
					return (
						<li key={category.value} className="shrink-0">
							<Link
								href={{ pathname: '/community', query: { articleCategory: category.value } }}
								aria-current={isActive ? 'page' : undefined}
								className={`flex h-10 items-center rounded-card px-3 text-small font-medium transition-colors duration-150 ease-out ${
									isActive ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-surface hover:text-accent'
								}`}
							>
								{category.label}
							</Link>
						</li>
					);
				})}
			</ul>
			<Link
				href="/community/write"
				className="inline-flex h-10 items-center justify-center rounded-card bg-accent px-4 text-small font-semibold text-white transition-colors duration-150 ease-out hover:bg-accent-hover"
			>
				Write a post
			</Link>
		</nav>
	);
};

export default CommunityNav;
