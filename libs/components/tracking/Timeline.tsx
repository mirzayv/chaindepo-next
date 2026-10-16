import React from 'react';
import moment from 'moment';
import { EventAnchorStatus, TrackingEvent } from '../../types/tracking-event/tracking-event';
import { SEPOLIA_TX_URL } from '../../config';
import { labelOf } from '../../utils';
import { DOT_CLASS } from '../ui/StatusPill';
import CopyButton from '../ui/CopyButton';
import { cityName } from '../ui/map/cities';

interface TimelineProps {
	events: TrackingEvent[];
	anchorMap: Record<string, EventAnchorStatus>;
	/** index of the first event whose hash does not check out (from verifyShipmentChain) */
	brokenAtIndex?: number | null;
	loading?: boolean;
}

export const shortHash = (hash?: string | null) => (hash ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : '');

const AnchorTag = ({ anchored }: { anchored: boolean | null | undefined }) => {
	if (anchored === true)
		return (
			<span className="inline-flex h-5 items-center rounded-full border border-ok/30 bg-ok/10 px-2 text-[0.75rem] font-medium leading-none text-ok">
				Anchored
			</span>
		);
	if (anchored === false)
		return (
			<span className="inline-flex h-5 items-center rounded-full border border-line bg-surface px-2 text-[0.75rem] font-medium leading-none text-muted">
				Pending
			</span>
		);
	return null;
};

/** chronological list of hash-chained events, oldest first */
const Timeline = ({ events, anchorMap, brokenAtIndex = null, loading = false }: TimelineProps) => {
	if (loading && events.length === 0) {
		return (
			<div className="flex flex-col gap-4" aria-busy="true">
				{Array.from({ length: 3 }).map((_, index) => (
					<div key={index} className="h-16 animate-pulse rounded-card bg-surface motion-reduce:animate-none" />
				))}
			</div>
		);
	}

	if (events.length === 0) {
		return <p className="m-0 text-body text-muted">No tracking events yet. The carrier adds them at pickup.</p>;
	}

	return (
		<ol className="m-0 list-none p-0">
			{events.map((event, index) => {
				const anchor = anchorMap[event._id];
				const txHash = anchor?.eventTxHash ?? event.eventTxHash ?? null;
				const broken = brokenAtIndex === index;
				const last = index === events.length - 1;

				return (
					<li key={event._id} className="relative flex gap-4 pb-6 last:pb-0">
						{/* rail */}
						{!last && <span className="absolute bottom-0 left-[7px] top-5 w-px bg-line" aria-hidden="true" />}
						<span
							className={`relative z-[1] mt-1.5 h-[15px] w-[15px] shrink-0 rounded-full border-[3px] border-white ring-1 ${
								broken ? 'bg-bad ring-bad' : `${DOT_CLASS[event.eventStatus] ?? 'bg-muted'} ring-line`
							}`}
							aria-hidden="true"
						/>

						<div
							className={`flex min-w-0 flex-1 flex-col gap-1.5 ${
								broken ? 'rounded-card border border-bad/40 bg-bad/5 p-3' : ''
							}`}
						>
							{/* below 640px the date goes under the title instead of competing for the same line */}
							<div className="flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-4 sm:gap-y-1">
								<p className="m-0 min-w-0 break-words text-[0.9375rem] font-semibold leading-snug text-ink">
									{labelOf(event.eventStatus)}
									<span className="font-normal text-muted"> · {cityName(event.eventLocation)}</span>
								</p>
								<time
									dateTime={moment(event.createdAt).toISOString()}
									className="whitespace-nowrap text-small leading-snug text-muted"
								>
									{moment(event.createdAt).format('YYYY.MM.DD HH:mm')}
								</time>
							</div>

							{event.eventNote && <p className="m-0 text-[0.9375rem] leading-relaxed text-ink">{event.eventNote}</p>}

							{broken && (
								<p className="m-0 text-small font-medium leading-snug text-bad">
									This event's hash does not match the chain.
								</p>
							)}

							<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
								<span className="flex items-center gap-0.5">
									<span className="text-small leading-snug text-muted">#{index}</span>
									<span className="ml-1.5 font-mono text-small leading-snug text-muted" title={event.eventHash}>
										{shortHash(event.eventHash)}
									</span>
									<CopyButton value={event.eventHash} label={`Copy hash of event ${index}`} />
								</span>
								<AnchorTag anchored={anchor?.anchored} />
								{txHash && (
									<a
										href={`${SEPOLIA_TX_URL}${txHash}`}
										target="_blank"
										rel="noreferrer"
										className="text-small font-medium leading-snug text-accent transition-colors duration-150 hover:text-accent-hover hover:underline"
									>
										View on Etherscan ↗
									</a>
								)}
							</div>
						</div>
					</li>
				);
			})}
		</ol>
	);
};

export default Timeline;
