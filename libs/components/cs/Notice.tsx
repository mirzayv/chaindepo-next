import React from 'react';

interface NoticeItem {
	title: string;
	date: string;
	body: string;
}

/** static ChainDepo notices, newest first */
const NOTICES: NoticeItem[] = [
	{
		title: 'Tracking events are anchored on Ethereum Sepolia',
		date: '2026.10.14',
		body: 'Every new tracking event hash is written to the ChainDepo contract on the Sepolia test network. The shipment page shows the transaction link for each anchored event, and you can check it on Sepolia Etherscan.',
	},
	{
		title: 'Track any shipment with its code, no account needed',
		date: '2026.10.10',
		body: 'Paste a tracking code such as CD261013A1B2C3D4 into the form on the home page or the shipment list. The shipment page shows the route, the event timeline and the chain check.',
	},
	{
		title: 'Carriers can claim open shipments',
		date: '2026.10.06',
		body: 'Shipments without a carrier are listed in My Page for carrier accounts. A carrier claims a shipment, then adds the pickup, transit and delivery events.',
	},
	{
		title: 'Prices are shown in Korean won',
		date: '2026.10.01',
		body: 'All shipment prices are entered and displayed in KRW without decimals.',
	},
];

const Notice = () => {
	return (
		<ul className="m-0 flex list-none flex-col gap-3 p-0">
			{NOTICES.map((notice) => (
				<li key={notice.title} className="rounded-card border border-line bg-card p-4 md:p-5">
					<article className="flex flex-col gap-1.5">
						<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
							<h3 className="m-0 text-[0.9375rem] font-semibold text-ink">{notice.title}</h3>
							<time className="text-small text-muted" dateTime={notice.date.replace(/\./g, '-')}>
								{notice.date}
							</time>
						</div>
						<p className="m-0 text-small leading-relaxed text-muted">{notice.body}</p>
					</article>
				</li>
			))}
		</ul>
	);
};

export default Notice;
