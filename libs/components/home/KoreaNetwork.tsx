import React from 'react';
import Link from 'next/link';
import { ShipmentLocation } from '../../enums/shipment.enum';
import { shipmentListHref } from './shipmentListHref';

/**
 * Simple equirectangular projection for South Korea.
 * x is scaled by cos(36°) relative to y so the shape keeps its proportions.
 */
const VIEW_W = 390;
const VIEW_H = 640;
const project = (lat: number, lng: number) => ({ x: (lng - 125.6) * 90, y: (38.75 - lat) * 111 });

/** simplified mainland coastline, clockwise from the north-west, as [lat, lng] */
const MAINLAND: [number, number][] = [
	[37.75, 126.6],
	[38.0, 127.1],
	[38.3, 127.6],
	[38.6, 128.35],
	[38.2, 128.6],
	[37.75, 128.9],
	[37.45, 129.15],
	[37.0, 129.35],
	[36.5, 129.4],
	[36.05, 129.55],
	[35.5, 129.45],
	[35.15, 129.15],
	[35.0, 128.7],
	[34.85, 128.2],
	[34.75, 127.7],
	[34.5, 127.3],
	[34.4, 126.85],
	[34.4, 126.35],
	[34.75, 126.3],
	[35.1, 126.45],
	[35.55, 126.45],
	[36.0, 126.7],
	[36.35, 126.5],
	[36.75, 126.15],
	[37.0, 126.6],
	[37.4, 126.6],
];

const mainlandPath =
	MAINLAND.map(([lat, lng], index) => {
		const { x, y } = project(lat, lng);
		return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
	}).join(' ') + ' Z';

const jeju = project(33.38, 126.55);

/** which side the label sits on, so close cities (Seoul/Incheon, Daegu/Gyeongju) don't overlap */
// name uses today's romanisation; the enum keeps the backend spelling (DAEJON, CHONJU)
const CITIES: { city: ShipmentLocation; name: string; lat: number; lng: number; side: 'left' | 'right' }[] = [
	{ city: ShipmentLocation.SEOUL, name: 'Seoul', lat: 37.57, lng: 126.98, side: 'right' },
	{ city: ShipmentLocation.INCHEON, name: 'Incheon', lat: 37.46, lng: 126.7, side: 'left' },
	{ city: ShipmentLocation.DAEJON, name: 'Daejeon', lat: 36.35, lng: 127.38, side: 'right' },
	{ city: ShipmentLocation.CHONJU, name: 'Jeonju', lat: 35.82, lng: 127.15, side: 'left' },
	{ city: ShipmentLocation.GWANGJU, name: 'Gwangju', lat: 35.16, lng: 126.85, side: 'left' },
	{ city: ShipmentLocation.DAEGU, name: 'Daegu', lat: 35.87, lng: 128.6, side: 'left' },
	{ city: ShipmentLocation.GYEONGJU, name: 'Gyeongju', lat: 35.86, lng: 129.21, side: 'right' },
	{ city: ShipmentLocation.BUSAN, name: 'Busan', lat: 35.18, lng: 129.08, side: 'right' },
	{ city: ShipmentLocation.JEJU, name: 'Jeju', lat: 33.5, lng: 126.53, side: 'right' },
];

const KoreaNetwork = () => {
	return (
		<section className="w-full bg-white">
			<div className="mx-auto grid max-w-page items-center gap-10 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20">
				<div className="flex max-w-md flex-col gap-3">
					<h2 className="m-0 text-h2 font-semibold text-ink">Nine cities, one record</h2>
					<p className="m-0 text-body text-muted">
						Shipments run between Seoul, Incheon, Daejeon, Jeonju, Gwangju, Daegu, Gyeongju, Busan and Jeju. Pick
						a city to see shipments leaving it.
					</p>
				</div>

				<div className="relative mx-auto aspect-[390/640] w-full max-w-[340px]">
					<svg
						viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
						className="absolute inset-0 h-full w-full"
						role="img"
						aria-label="Map of South Korea with the nine ChainDepo cities"
					>
						<path d={mainlandPath} fill="#F5F7F9" stroke="#E3E8EE" strokeWidth={2} strokeLinejoin="round" />
						<ellipse cx={jeju.x} cy={jeju.y} rx={36} ry={19} fill="#F5F7F9" stroke="#E3E8EE" strokeWidth={2} />
						{CITIES.map(({ city, lat, lng }) => {
							const { x, y } = project(lat, lng);
							return <circle key={city} cx={x} cy={y} r={6} fill="#2F8FB5" stroke="#FFFFFF" strokeWidth={2} />;
						})}
					</svg>

					{/* labels are HTML links placed over the dots so they stay crisp and keyboard reachable */}
					{CITIES.map(({ city, name, lat, lng, side }) => {
						const { x, y } = project(lat, lng);
						return (
							<Link
								key={city}
								href={shipmentListHref({ originList: [city] })}
								style={{ left: `${(x / VIEW_W) * 100}%`, top: `${(y / VIEW_H) * 100}%` }}
								className={`absolute -translate-y-1/2 whitespace-nowrap rounded px-1 text-small font-medium leading-tight text-ink transition-colors duration-150 ease-out hover:text-accent hover:underline ${
									side === 'right' ? 'translate-x-2.5' : '-translate-x-[calc(100%+10px)]'
								}`}
							>
								{name}
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default KoreaNetwork;
