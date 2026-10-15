import React, { useEffect } from 'react';
import Link from 'next/link';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapMarker {
	id: string;
	lat: number;
	lng: number;
	title: string;
	/** extra popup lines, e.g. "Picked up · 2026.10.14 13:20" */
	lines?: string[];
	href?: string;
	linkText?: string;
	/** muted for stops not reached yet */
	tone?: 'accent' | 'muted';
}

export interface KoreaMapProps {
	markers: MapMarker[];
	/** solid teal line: the part of the route already travelled */
	path?: [number, number][];
	/** dashed line: the part still ahead (last event → destination) */
	pendingPath?: [number, number][];
	className?: string;
	ariaLabel: string;
}

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
	'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const ACCENT = '#2F8FB5';
const MUTED = '#5A6B7B';

/** whole South Korea incl. Jeju, used before markers are known */
const KOREA_BOUNDS: LatLngBoundsExpression = [
	[33.1, 125.9],
	[38.5, 129.6],
];

const boundsOf = (points: [number, number][]): LatLngBoundsExpression => {
	if (points.length === 0) return KOREA_BOUNDS;
	const lats = points.map(([lat]) => lat);
	const lngs = points.map(([, lng]) => lng);
	return [
		[Math.min(...lats), Math.min(...lngs)],
		[Math.max(...lats), Math.max(...lngs)],
	];
};

/** MapContainer props are fixed after mount, so refit when the points change (e.g. events arrive) */
const FitToPoints = ({ points }: { points: [number, number][] }) => {
	const map = useMap();
	const key = points.map(([lat, lng]) => `${lat},${lng}`).join('|');

	useEffect(() => {
		map.fitBounds(boundsOf(points), { padding: [36, 36], maxZoom: 9 });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map, key]);

	return null;
};

const KoreaMap = ({ markers, path = [], pendingPath = [], className = '', ariaLabel }: KoreaMapProps) => {
	const points: [number, number][] = [...markers.map((m) => [m.lat, m.lng] as [number, number]), ...path, ...pendingPath];

	return (
		// isolate: Leaflet panes use z-index 400+, keep them under the sticky header and the widget
		<div
			role="region"
			aria-label={ariaLabel}
			className={`cd-map relative isolate overflow-hidden rounded-card border border-line ${className}`}
		>
			<MapContainer
				bounds={boundsOf(points)}
				boundsOptions={{ padding: [36, 36], maxZoom: 9 }}
				scrollWheelZoom={false}
				zoomControl
				attributionControl
				className="h-full w-full"
			>
				<TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} subdomains="abcd" maxZoom={18} />
				<FitToPoints points={points} />

				{path.length > 1 && (
					<Polyline positions={path as LatLngExpression[]} pathOptions={{ color: ACCENT, weight: 3, opacity: 0.9 }} />
				)}
				{pendingPath.length > 1 && (
					<Polyline
						positions={pendingPath as LatLngExpression[]}
						pathOptions={{ color: ACCENT, weight: 2, opacity: 0.7, dashArray: '6 6' }}
					/>
				)}

				{markers.map((marker) => (
					<CircleMarker
						key={marker.id}
						center={[marker.lat, marker.lng]}
						radius={7}
						pathOptions={{
							color: '#FFFFFF',
							weight: 2,
							fillColor: marker.tone === 'muted' ? MUTED : ACCENT,
							fillOpacity: 1,
						}}
					>
						<Popup closeButton={false} offset={[0, -4]}>
							<p>
								<strong>{marker.title}</strong>
							</p>
							{marker.lines?.map((line) => (
								<p key={line} style={{ color: MUTED }}>
									{line}
								</p>
							))}
							{marker.href && (
								<p style={{ marginTop: 6 }}>
									<Link href={marker.href}>{marker.linkText ?? 'Open'} →</Link>
								</p>
							)}
						</Popup>
					</CircleMarker>
				))}
			</MapContainer>
		</div>
	);
};

export default KoreaMap;
