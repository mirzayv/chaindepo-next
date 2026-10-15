import React from 'react';
import Link from 'next/link';
import { ShipmentType } from '../../enums/shipment.enum';
import { shipmentListHref } from './shipmentListHref';

const ICON_PROPS = {
	width: 28,
	height: 28,
	viewBox: '0 0 28 28',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 1.5,
	strokeLinejoin: 'round' as const,
	strokeLinecap: 'round' as const,
	'aria-hidden': true,
};

const TYPES: { type: ShipmentType; title: string; text: string; icon: React.ReactNode }[] = [
	{
		type: ShipmentType.DOCUMENT,
		title: 'Document',
		text: 'Contracts, certificates and paperwork.',
		icon: (
			<svg {...ICON_PROPS}>
				<path d="M8 4h8l5 5v15H8z" />
				<path d="M16 4v5h5M11 14h7M11 18h7" />
			</svg>
		),
	},
	{
		type: ShipmentType.PARCEL,
		title: 'Parcel',
		text: 'Boxes and packages up to a few dozen kg.',
		icon: (
			<svg {...ICON_PROPS}>
				<path d="M4 9l10-5 10 5v10l-10 5-10-5z" />
				<path d="M4 9l10 5 10-5M14 14v10" />
			</svg>
		),
	},
	{
		type: ShipmentType.PALLET,
		title: 'Pallet',
		text: 'Stacked goods moved by forklift.',
		icon: (
			<svg {...ICON_PROPS}>
				<path d="M7 5h14v13H7z" />
				<path d="M7 11.5h14M4 18h20v3H4zM7 21v2M14 21v2M21 21v2" />
			</svg>
		),
	},
	{
		type: ShipmentType.CONTAINER,
		title: 'Container',
		text: 'Full containers between ports and depots.',
		icon: (
			<svg {...ICON_PROPS}>
				<path d="M3 8h22v13H3z" />
				<path d="M8 11v7M12 11v7M16 11v7M20 11v7" />
			</svg>
		),
	},
];

const ShipmentTypes = () => {
	return (
		<section className="w-full bg-surface">
			<div className="mx-auto max-w-page px-4 py-14 md:px-6 md:py-20">
				<div className="mb-8 flex flex-col gap-2">
					<h2 className="m-0 text-h2 font-semibold text-ink">What we move</h2>
					<p className="m-0 text-body text-muted">Browse open shipments by type.</p>
				</div>

				<ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
					{TYPES.map((item) => (
						<li key={item.type} className="flex">
							<Link
								href={shipmentListHref({ typeList: [item.type] })}
								className="group flex w-full min-w-0 flex-col gap-3 whitespace-normal rounded-card border border-line bg-white p-5 text-ink transition-colors duration-150 ease-out hover:border-accent"
							>
								<span className="text-accent">{item.icon}</span>
								<h3 className="m-0 text-h3 font-semibold text-ink">{item.title}</h3>
								<p className="m-0 text-small text-muted">{item.text}</p>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
};

export default ShipmentTypes;
