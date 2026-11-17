import React from 'react';
import Link from 'next/link';
import { ShipmentType } from '../../enums/shipment.enum';
import { shipmentListHref } from './shipmentListHref';
import { useTranslation } from 'next-i18next';

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

/** key: translation key in home:types */
const TYPES: { type: ShipmentType; key: string; icon: React.ReactNode }[] = [
	{
		type: ShipmentType.DOCUMENT,
		key: 'document',
		icon: (
			<svg {...ICON_PROPS}>
				<path d="M8 4h8l5 5v15H8z" />
				<path d="M16 4v5h5M11 14h7M11 18h7" />
			</svg>
		),
	},
	{
		type: ShipmentType.PARCEL,
		key: 'parcel',
		icon: (
			<svg {...ICON_PROPS}>
				<path d="M4 9l10-5 10 5v10l-10 5-10-5z" />
				<path d="M4 9l10 5 10-5M14 14v10" />
			</svg>
		),
	},
	{
		type: ShipmentType.PALLET,
		key: 'pallet',
		icon: (
			<svg {...ICON_PROPS}>
				<path d="M7 5h14v13H7z" />
				<path d="M7 11.5h14M4 18h20v3H4zM7 21v2M14 21v2M21 21v2" />
			</svg>
		),
	},
	{
		type: ShipmentType.CONTAINER,
		key: 'container',
		icon: (
			<svg {...ICON_PROPS}>
				<path d="M3 8h22v13H3z" />
				<path d="M8 11v7M12 11v7M16 11v7M20 11v7" />
			</svg>
		),
	},
];

const ShipmentTypes = () => {
	const { t } = useTranslation('home');
	return (
		<section className="w-full bg-surface">
			<div className="mx-auto max-w-[1440px] px-4 py-20 md:px-10 md:py-28">
				<div className="mb-12 flex flex-col items-center gap-3 text-center">
					<h2 className="m-0 text-section font-extrabold text-ink">{t('types.title')}</h2>
					<p className="m-0 text-[1.1875rem] font-medium text-ink/75">{t('types.sub')}</p>
				</div>

				<ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
					{TYPES.map((item) => (
						<li key={item.type} className="flex">
							<Link
								href={shipmentListHref({ typeList: [item.type] })}
								className="group flex w-full min-w-0 flex-col gap-4 whitespace-normal rounded-[24px] bg-card p-7 text-ink transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(19,20,22,0.08)] motion-reduce:transform-none"
							>
								<span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
									{item.icon}
								</span>
								<h3 className="m-0 mt-4 text-[1.5rem] font-bold tracking-[-0.02em] text-ink">{t(`types.${item.key}.title`)}</h3>
								<p className="m-0 text-body text-ink/70">{t(`types.${item.key}.text`)}</p>
								<span className="mt-auto pt-2 text-[0.9375rem] font-semibold text-accent">{t('types.browse')} →</span>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
};

export default ShipmentTypes;
