import React from 'react';
import { CHAINDEPO_CONTRACT, SEPOLIA_ADDRESS_URL } from '../../config';
import EthereumMark from '../ui/EthereumMark';
import { useTranslation } from 'next-i18next';

/** an example of how each tracking event is chained: shown as a sample, the contract link is real */
const EVENTS = [
	{ status: 'pickedUp', place: 'seoul', hash: '0x4be1…9a07' },
	{ status: 'inTransit', place: 'daejeon', hash: '0x91c3…2f5d' },
	{ status: 'arrived', place: 'busan', hash: '0x7d0a…c41e' },
];

/**
 * Floating "proof" card on the hero photo: three linked events, each with its hash,
 * the last one anchored on Ethereum. Makes the blockchain part visible at first glance.
 */
const ProofCard = ({ className = '' }: { className?: string }) => {
	const { t } = useTranslation('home');
	const shortContract = `${CHAINDEPO_CONTRACT.slice(0, 6)}…${CHAINDEPO_CONTRACT.slice(-4)}`;

	return (
		<div
			className={`w-[340px] rounded-[24px] border border-white/60 bg-white/85 p-5 text-[#131416] shadow-[0_24px_60px_rgba(19,20,22,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1A1C1F]/85 dark:text-[#F2F3F5] ${className}`}
		>
			<div className="flex items-center justify-between">
				<span className="text-[0.8125rem] font-semibold uppercase tracking-[0.06em] opacity-60">{t('proof.example')}</span>
				<span className="inline-flex items-center gap-1.5 rounded-full bg-ok/10 px-2.5 py-1 text-[0.75rem] font-semibold text-ok">
					<span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden="true" />
					{t('proof.verified')}
				</span>
			</div>

			<ol className="m-0 mt-4 list-none p-0">
				{EVENTS.map((event, i) => {
					const last = i === EVENTS.length - 1;
					return (
						<li key={event.hash} className="relative flex gap-3 pb-4 last:pb-0">
							{/* chain line between events */}
							{!last && <span className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-[2px] bg-accent/25" aria-hidden="true" />}
							<span
								className={`relative mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${
									last ? 'bg-accent text-white' : 'bg-accent/15 text-accent'
								}`}
								aria-hidden="true"
							>
								{last ? (
									<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
										<path d="m2.5 6.2 2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								) : (
									<span className="h-2 w-2 rounded-full bg-accent" />
								)}
							</span>
							<div className="min-w-0 flex-1">
								<div className="flex items-baseline justify-between gap-2">
									<span className="text-[0.9375rem] font-bold">{t(`proof.${event.status}`)}</span>
									<span className="text-[0.8125rem] font-medium opacity-60">{t(`proof.${event.place}`)}</span>
								</div>
								<span className="font-mono text-[0.75rem] opacity-60">sha256 {event.hash}</span>
							</div>
						</li>
					);
				})}
			</ol>

			<a
				href={`${SEPOLIA_ADDRESS_URL}${CHAINDEPO_CONTRACT}`}
				target="_blank"
				rel="noreferrer"
				className="mt-4 flex items-center gap-2 rounded-2xl bg-[#131416] px-4 py-3 text-white transition-colors duration-150 hover:bg-accent dark:bg-white/10"
			>
				<EthereumMark size={18} />
				<span className="flex min-w-0 flex-col leading-tight">
					<span className="text-[0.875rem] font-semibold">{t('proof.anchored')}</span>
					<span className="truncate font-mono text-[0.75rem] opacity-70">Sepolia · {shortContract}</span>
				</span>
				<span className="ml-auto text-[0.875rem]" aria-hidden="true">
					↗
				</span>
			</a>
		</div>
	);
};

export default ProofCard;
