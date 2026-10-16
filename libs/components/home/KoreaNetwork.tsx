import React from 'react';
import Link from 'next/link';
import { ShipmentLocation } from '../../enums/shipment.enum';
import MapView, { MapMarker } from '../ui/map/MapView';
import { CITIES } from '../ui/map/cities';
import { shipmentListHref } from './shipmentListHref';

const LOCATIONS = Object.values(ShipmentLocation);

const MARKERS: MapMarker[] = LOCATIONS.map((location) => ({
	id: location,
	lat: CITIES[location].lat,
	lng: CITIES[location].lng,
	title: CITIES[location].name,
	href: shipmentListHref({ originList: [location] }),
	linkText: 'See shipments from here',
}));

const KoreaNetwork = () => {
	return (
		<section className="w-full bg-page">
			<div className="mx-auto grid max-w-page items-center gap-8 px-4 py-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 md:px-6 md:py-20">
				<div className="flex flex-col gap-3">
					<h2 className="m-0 text-h2 font-semibold text-ink">Nine cities, one record</h2>
					<p className="m-0 text-body text-muted">
						Shipments run between nine Korean cities. Pick a city on the map, or below, to see shipments leaving it.
					</p>
					{/* the same links as the map popups, reachable by keyboard */}
					<ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
						{LOCATIONS.map((location) => (
							<li key={location}>
								<Link
									href={shipmentListHref({ originList: [location] })}
									className="inline-flex h-8 items-center rounded-full border border-line bg-card px-3 text-small font-medium text-ink transition-colors duration-150 ease-out hover:border-accent hover:text-accent"
								>
									{CITIES[location].name}
								</Link>
							</li>
						))}
					</ul>
				</div>

				{/* taller than wide on desktop so the fit is Korea, not the sea around it */}
				<div className="h-[420px] w-full md:h-[540px]">
					<MapView
						markers={MARKERS}
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
