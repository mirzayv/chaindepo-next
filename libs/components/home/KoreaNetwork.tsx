import React, { useMemo } from 'react';
import Link from 'next/link';
import { ShipmentLocation } from '../../enums/shipment.enum';
import MapView, { MapMarker } from '../ui/map/MapView';
import { CITIES } from '../ui/map/cities';
import { shipmentListHref } from './shipmentListHref';
import { useTranslation } from 'next-i18next';

const LOCATIONS = Object.values(ShipmentLocation);

/** the freight corridors drawn as flowing arcs on the home map */
const CORRIDORS: [ShipmentLocation, ShipmentLocation][] = [
	[ShipmentLocation.INCHEON, ShipmentLocation.SEOUL],
	[ShipmentLocation.SEOUL, ShipmentLocation.DAEJON],
	[ShipmentLocation.DAEJON, ShipmentLocation.CHONJU],
	[ShipmentLocation.CHONJU, ShipmentLocation.GWANGJU],
	[ShipmentLocation.DAEJON, ShipmentLocation.DAEGU],
	[ShipmentLocation.DAEGU, ShipmentLocation.GYEONGJU],
	[ShipmentLocation.DAEGU, ShipmentLocation.BUSAN],
	[ShipmentLocation.GYEONGJU, ShipmentLocation.BUSAN],
	[ShipmentLocation.GWANGJU, ShipmentLocation.JEJU],
	[ShipmentLocation.BUSAN, ShipmentLocation.JEJU],
];
const LINKS: [[number, number], [number, number]][] = CORRIDORS.map(([a, b]) => [
	[CITIES[a].lat, CITIES[a].lng],
	[CITIES[b].lat, CITIES[b].lng],
]);

// label placement for cities that sit right next to another one
const LABEL_SIDE: Partial<Record<ShipmentLocation, 'left' | 'bottom'>> = {
	[ShipmentLocation.INCHEON]: 'left',
	[ShipmentLocation.GWANGJU]: 'left',
	[ShipmentLocation.CHONJU]: 'left',
	[ShipmentLocation.DAEGU]: 'bottom',
};

const markersFor = (linkText: string): MapMarker[] =>
	LOCATIONS.map((location) => ({
	id: location,
	lat: CITIES[location].lat,
	lng: CITIES[location].lng,
	title: CITIES[location].name,
	href: shipmentListHref({ originList: [location] }),
		linkText,
		labelSide: LABEL_SIDE[location] ?? ('right' as const),
	}));

const KoreaNetwork = () => {
	const { t } = useTranslation('home');
	const linkText = t('network.link');
	// stable array so the map does not rebuild its markers on every render
	const markers = useMemo(() => markersFor(linkText), [linkText]);
	return (
		<section className="w-full bg-page">
			<div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:px-10 md:py-28">
				<div className="flex flex-col gap-4">
					<h2 className="m-0 text-section font-extrabold text-ink">{t('network.title')}</h2>
					<p className="m-0 text-[1.1875rem] font-medium leading-[1.5] text-ink/75">
						{t('network.text')}
					</p>
					{/* the same links as the map popups, reachable by keyboard */}
					<ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
						{LOCATIONS.map((location) => (
							<li key={location}>
								<Link
									href={shipmentListHref({ originList: [location] })}
									className="inline-flex h-10 items-center rounded-full bg-surface px-4 text-[0.9375rem] font-medium text-ink transition-colors duration-150 ease-out hover:bg-accent hover:text-white"
								>
									{CITIES[location].name}
								</Link>
							</li>
						))}
					</ul>
				</div>

				{/* taller than wide on desktop so the fit is Korea, not the sea around it */}
				<div className="h-[460px] w-full overflow-hidden rounded-[28px] shadow-[0_24px_60px_rgba(19,20,22,0.12)] md:h-[640px]">
					<MapView
						markers={markers}
						links={LINKS}
						showLabels
						lockToKorea
						className="h-full w-full"
						ariaLabel="Map of the nine ChainDepo cities in South Korea"
					/>
				</div>
			</div>
		</section>
	);
};

export default KoreaNetwork;
