import React from 'react';
import moment from 'moment';
import { ChainVerification } from '../../types/tracking-event/tracking-event';
import { CHAINDEPO_CONTRACT, SEPOLIA_ADDRESS_URL } from '../../config';

interface ChainCardProps {
	chain: ChainVerification | null;
	loading: boolean;
	failed: boolean;
	verifying: boolean;
	checkedAt: Date | null;
	onVerify: () => void;
}

type Tone = 'ok' | 'bad' | 'neutral';

const TONE_CLASS: Record<Tone, { box: string; icon: string; title: string }> = {
	ok: { box: 'border-ok/30 bg-ok/5', icon: 'bg-ok', title: 'text-ok' },
	bad: { box: 'border-bad/40 bg-bad/5', icon: 'bg-bad', title: 'text-bad' },
	neutral: { box: 'border-line bg-surface', icon: 'bg-muted', title: 'text-ink' },
};

const ChainCard = ({ chain, loading, failed, verifying, checkedAt, onVerify }: ChainCardProps) => {
	const shortContract = `${CHAINDEPO_CONTRACT.slice(0, 6)}…${CHAINDEPO_CONTRACT.slice(-4)}`;

	let tone: Tone = 'neutral';
	let title = 'Checking chain…';
	let detail = 'Recomputing every event hash.';

	if (failed && !chain) {
		title = 'Could not check the chain';
		detail = 'The verification service did not answer. Try again.';
	} else if (chain && chain.totalEvents === 0) {
		title = 'Nothing to verify yet';
		detail = 'The chain starts with the first carrier event.';
	} else if (chain && chain.valid) {
		tone = 'ok';
		title = 'Chain verified';
		detail = `${chain.totalEvents} of ${chain.totalEvents} events check out.`;
	} else if (chain && !chain.valid) {
		tone = 'bad';
		const index = chain.brokenAtIndex ?? 0;
		if (index >= chain.totalEvents) {
			title = 'Chain tip does not match';
			detail = `All ${chain.totalEvents} events link up, but the last hash differs from the shipment record.`;
		} else {
			title = `Chain broken at event #${index}`;
			detail = `${index} of ${chain.totalEvents} events check out. Events from #${index} on cannot be trusted.`;
		}
	}

	const anchoredLine =
		!chain || chain.totalEvents === 0
			? null
			: chain.anchoredEvents === null
			? 'Anchoring off'
			: `${chain.anchoredEvents} of ${chain.totalEvents} anchored on Sepolia`;

	const styles = TONE_CLASS[tone];

	return (
		<section className="flex flex-col gap-4 rounded-card border border-line bg-card p-5" aria-labelledby="chain-card-title">
			<h2 id="chain-card-title" className="m-0 text-h3 font-semibold text-ink">
				Verification
			</h2>

			<div className={`flex gap-3 rounded-card border p-4 ${styles.box}`} aria-live="polite">
				<span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${styles.icon}`} aria-hidden="true">
					{tone === 'ok' && (
						<svg width="11" height="11" viewBox="0 0 12 12" fill="none">
							<path d="M2.5 6.2l2.3 2.3L9.5 3.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					)}
					{tone === 'bad' && (
						<svg width="11" height="11" viewBox="0 0 12 12" fill="none">
							<path d="M3.5 3.5l5 5M8.5 3.5l-5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
						</svg>
					)}
				</span>
				<div className="flex min-w-0 flex-col gap-1">
					<p className={`m-0 text-[0.9375rem] font-semibold leading-snug ${styles.title}`}>
						{title}
					</p>
					<p className="m-0 text-small leading-snug text-muted">{detail}</p>
					{anchoredLine && <p className="m-0 text-small leading-snug text-muted">{anchoredLine}</p>}
				</div>
			</div>

			<div className="flex items-center justify-between gap-3">
				<button
					type="button"
					onClick={onVerify}
					disabled={verifying || loading}
					aria-busy={verifying}
					className="inline-flex h-10 items-center gap-2 rounded-card border border-line bg-card px-4 text-[0.875rem] font-semibold text-ink transition duration-150 ease-out hover:border-accent hover:text-accent active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 motion-reduce:transform-none"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 16 16"
						fill="none"
						aria-hidden="true"
						className={verifying ? 'animate-spin motion-reduce:animate-none' : ''}
					>
						<path d="M13.5 8a5.5 5.5 0 11-1.6-3.9M13.5 2.5v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
					{verifying ? 'Verifying…' : 'Verify again'}
				</button>
				{checkedAt && (
					<span className="text-small leading-snug text-muted">Checked {moment(checkedAt).format('HH:mm:ss')}</span>
				)}
			</div>

			<div className="flex flex-col gap-1 border-t border-line pt-4">
				<span className="text-small leading-snug text-muted">Contract on Sepolia</span>
				<a
					href={`${SEPOLIA_ADDRESS_URL}${CHAINDEPO_CONTRACT}`}
					target="_blank"
					rel="noreferrer"
					title={CHAINDEPO_CONTRACT}
					className="w-fit font-mono text-small text-accent transition-colors duration-150 hover:text-accent-hover hover:underline"
				>
					{shortContract} ↗
				</a>
			</div>
		</section>
	);
};

export default ChainCard;
