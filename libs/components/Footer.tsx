import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { CHAINDEPO_CONTRACT, SEPOLIA_ADDRESS_URL } from '../config';
import Logo from './ui/Logo';

const FOOTER_COLUMNS = [
	{
		title: 'Product',
		links: [
			{ label: 'Track', href: '/shipment/detail' },
			{ label: 'Shipments', href: '/shipment' },
			{ label: 'Carriers', href: '/carrier' },
		],
	},
	{
		title: 'Community',
		links: [
			{ label: 'Community', href: '/community?articleCategory=FREE' },
			{ label: 'Help center', href: '/cs' },
			{ label: 'About', href: '/about' },
		],
	},
];

const Footer = () => {
	const { t } = useTranslation('common');
	const shortContract = `${CHAINDEPO_CONTRACT.slice(0, 6)}…${CHAINDEPO_CONTRACT.slice(-4)}`;

	return (
		<footer className="cd-ui w-full bg-surface">
			<div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 md:grid-cols-[1.5fr_1fr_1fr] md:px-10 md:py-20">
				<div className="flex max-w-sm flex-col gap-4">
					<Link href={'/'} aria-label="ChainDepo home" className="w-fit">
						<Logo size={28} />
					</Link>
					<p className="m-0 text-[0.9375rem] leading-relaxed text-muted">
						{t('Shipment tracking across Korea. Every event is hash-chained and anchored on Ethereum Sepolia.')}
					</p>
					<div className="flex flex-col gap-1">
						<span className="text-small leading-snug text-muted">{t('Verification contract')}</span>
						<a
							href={`${SEPOLIA_ADDRESS_URL}${CHAINDEPO_CONTRACT}`}
							target="_blank"
							rel="noreferrer"
							title={CHAINDEPO_CONTRACT}
							className="w-fit font-mono text-small text-accent underline-offset-2 transition-colors duration-150 hover:text-accent-hover hover:underline"
						>
							{shortContract} · Sepolia
						</a>
					</div>
				</div>

				{FOOTER_COLUMNS.map((column) => (
					<div key={column.title} className="flex flex-col gap-3">
						<h2 className="m-0 text-[1rem] font-bold leading-snug text-ink">{t(column.title)}</h2>
						<ul className="m-0 flex list-none flex-col gap-2 p-0">
							{column.links.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className="text-[1rem] font-medium leading-relaxed text-ink/65 transition-colors duration-150 ease-out hover:text-ink"
									>
										{t(link.label)}
									</Link>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
			<div className="border-t border-line">
				{/* mobile: extra bottom room so the floating chat button (48px + safe area) never covers the last line */}
				<div className="mx-auto flex max-w-[1440px] px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-5 sm:pb-5 md:px-10">
					<span className="text-small leading-snug text-muted">© {new Date().getFullYear()} ChainDepo</span>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
