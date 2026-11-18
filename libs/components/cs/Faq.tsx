import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { CHAINDEPO_CONTRACT, SEPOLIA_ADDRESS_URL } from '../../config';

type FaqTab = 'tracking' | 'shipments' | 'carriers' | 'verification' | 'account';

interface FaqItem {
	question: string;
	/** plain text; `code` spans and the {contract} link are rendered by RichText */
	answer: string;
}

const TABS: { id: FaqTab; label: string }[] = [
	{ id: 'tracking', label: 'Tracking' },
	{ id: 'shipments', label: 'Shipments' },
	{ id: 'carriers', label: 'Carriers' },
	{ id: 'verification', label: 'Verification' },
	{ id: 'account', label: 'Account' },
];

const Code = ({ children }: { children: React.ReactNode }) => (
	<code className="rounded bg-surface px-1 py-0.5 font-mono text-[0.8125rem] text-ink">{children}</code>
);

/** renders `code` spans and the {contract} placeholder inside a (translated) answer */
const RichText = ({ text }: { text: string }) => (
	<>
		{text.split(/(`[^`]+`|\{contract\})/g).map((part, i) => {
			if (part === '{contract}')
				return (
					<a
						key={i}
						href={`${SEPOLIA_ADDRESS_URL}${CHAINDEPO_CONTRACT}`}
						target="_blank"
						rel="noopener noreferrer"
						className="break-all font-mono text-accent hover:text-accent-hover hover:underline"
					>
						{CHAINDEPO_CONTRACT}
					</a>
				);
			if (part.startsWith('`') && part.endsWith('`')) return <Code key={i}>{part.slice(1, -1)}</Code>;
			return <React.Fragment key={i}>{part}</React.Fragment>;
		})}
	</>
);

const FAQ: Record<FaqTab, FaqItem[]> = {
	tracking: [
		{
			question: 'What does a tracking code look like?',
			answer:
				'It starts with `CD`, then the creation date as YYMMDD, then 8 letters or digits, for example `CD261013A1B2C3D4`. The shipper gets it when the shipment is created.',
		},
		{
			question: 'Do I need an account to track a shipment?',
			answer: 'No. Anyone with the tracking code can open the shipment page and see its route, timeline and chain check.',
		},
		{
			question: 'What do the statuses mean?',
			answer:
				'Created: the shipment is posted. Picked up: the carrier has it. In transit: it is moving between cities, and there can be several in-transit events. Delivered: it reached the destination. Cancelled: an admin stopped the shipment.',
		},
		{
			question: 'Why is my shipment still "Created"?',
			answer: 'No carrier has picked it up yet. The status changes when the carrier adds the pickup event.',
		},
	],
	shipments: [
		{
			question: 'How do I create a shipment?',
			answer:
				'Log in with a shipper account, open My Page and choose "Create shipment". Enter the title, route, type, weight and price in KRW, add photos, and save. You get the tracking code right away.',
		},
		{
			question: 'Which cities are supported?',
			answer: 'Shipments run between nine Korean cities. You can see them on the home page map and in the shipment filters.',
		},
		{
			question: 'Can I change a shipment after it is created?',
			answer:
				'While it is still Created, you can edit, cancel or delete it in My Page → My shipments. After pickup the details are locked. Tracking events can never be edited or deleted, because each one is linked to the one before it.',
		},
		{
			question: 'How are prices shown?',
			answer: 'In Korean won, without decimals, for example ₩85,000.',
		},
	],
	carriers: [
		{
			question: 'How does a carrier get a shipment?',
			answer:
				'Either the shipper assigns a carrier when creating the shipment, or a carrier claims an open shipment from My Page. Only one carrier can hold a shipment.',
		},
		{
			question: 'Who can add tracking events?',
			answer: 'Only the carrier assigned to the shipment. Each event records the status, the city and the time.',
		},
		{
			question: 'In which order are events added?',
			answer:
				'Created → Picked up → In transit (one or more, each in a different city) → Delivered. The system rejects events out of order.',
		},
		{
			question: 'Can I see a carrier before choosing them?',
			answer: 'Yes. The Carriers page lists every carrier with their profile, their shipments, and the likes and views they have received.',
		},
	],
	verification: [
		{
			question: 'What is the hash chain?',
			answer:
				'Every tracking event gets a SHA-256 hash of its data plus the hash of the previous event (`prevHash` → `eventHash`). Changing any past event changes its hash and breaks every link after it.',
		},
		{
			question: 'What does "anchored on Sepolia" mean?',
			answer:
				'Each event hash is also written to the ChainDepo contract on Ethereum Sepolia ({contract}). The record then exists outside our database, so we cannot quietly rewrite it either.',
		},
		{
			question: 'How do I verify a shipment myself?',
			answer:
				'Open the shipment page and use "Verify again". It recomputes every hash and checks each one against the contract. Each anchored event also links to its transaction on Sepolia Etherscan.',
		},
		{
			question: 'Why is an event "pending"?',
			answer:
				'Anchoring takes a short time after the event is saved. The hash chain is valid right away, and the Sepolia link appears once the transaction is confirmed.',
		},
		{
			question: 'Is Sepolia real money?',
			answer: 'No. Sepolia is an Ethereum test network. Anchoring there costs no real ETH.',
		},
	],
	account: [
		{
			question: 'What is the difference between a shipper and a carrier account?',
			answer:
				'A shipper creates shipments and shares tracking codes. A carrier claims shipments and adds tracking events. You choose the type when you sign up.',
		},
		{
			question: 'How do I change my profile photo or details?',
			answer: 'Open My Page → My Profile. A new photo is saved as soon as you upload it, and the other fields are saved with "Update profile".',
		},
		{
			question: 'I forgot my password.',
			answer: 'Password reset is not available yet. Ask an admin through the community General board.',
		},
	],
};

const Faq = () => {
	const { t } = useTranslation('common');
	const [tab, setTab] = useState<FaqTab>('tracking');

	return (
		<div className="flex flex-col gap-4">
			<div role="tablist" aria-label={t('FAQ topics')} className="flex gap-1 overflow-x-auto border-b border-line">
				{TABS.map((item) => {
					const selected = item.id === tab;
					return (
						<button
							key={item.id}
							type="button"
							role="tab"
							id={`faq-tab-${item.id}`}
							aria-selected={selected}
							aria-controls={`faq-panel-${item.id}`}
							onClick={() => setTab(item.id)}
							className={`-mb-px h-10 shrink-0 cursor-pointer border-0 border-b-2 bg-transparent px-3 text-small font-medium transition-colors duration-150 ease-out ${
								selected ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'
							}`}
						>
							{t(item.label)}
						</button>
					);
				})}
			</div>

			<div role="tabpanel" id={`faq-panel-${tab}`} aria-labelledby={`faq-tab-${tab}`} className="flex flex-col gap-2">
				{FAQ[tab].map((item, index) => (
					<details
						key={item.question}
						open={index === 0}
						className="group rounded-card border border-line bg-card [&_summary::-webkit-details-marker]:hidden"
					>
						<summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-[0.9375rem] font-semibold text-ink hover:text-accent">
							{t(item.question)}
							<span
								className="shrink-0 text-muted transition-transform duration-150 ease-out group-open:rotate-180 motion-reduce:transition-none"
								aria-hidden="true"
							>
								⌄
							</span>
						</summary>
						<div className="px-4 pb-4 text-small leading-relaxed text-muted"><RichText text={t(item.answer)} /></div>
					</details>
				))}
			</div>
		</div>
	);
};

export default Faq;
