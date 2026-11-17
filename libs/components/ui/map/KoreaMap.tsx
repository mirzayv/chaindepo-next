import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useColorMode from '../../../hooks/useColorMode';

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
	/** which side of the pin the name label sits on (to keep close cities apart) */
	labelSide?: 'left' | 'right' | 'bottom';
}

export interface KoreaMapProps {
	markers: MapMarker[];
	/** solid line: the part of the route already travelled */
	path?: [number, number][];
	/** dashed line: the part still ahead (last event → destination) */
	pendingPath?: [number, number][];
	/** network view: curved, animated links between pairs of points (home page) */
	links?: [[number, number], [number, number]][];
	/** always show the city name next to each marker */
	showLabels?: boolean;
	className?: string;
	ariaLabel: string;
	/** fit to South Korea (incl. Jeju) and keep the view there: no zooming or panning out to the neighbours */
	lockToKorea?: boolean;
}

/**
 * Real, full-colour OpenStreetMap tiles (no API key). In dark mode the same tiles are inverted
 * by CSS (.cd-map-tiles in scss/tailwind.css), which keeps roads, water and labels readable.
 */
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** read the accent from the theme tokens so the map follows light/dark */
const accentColor = () => {
	if (typeof document === 'undefined') return '#2F7BFF';
	const channels = getComputedStyle(document.documentElement).getPropertyValue('--cd-accent').trim();
	return channels ? `rgb(${channels.split(/\s+/).join(',')})` : '#2F7BFF';
};

/** whole South Korea incl. Jeju, used before markers are known */
const KOREA_BOUNDS: LatLngBoundsExpression = [
	[33.1, 125.9],
	[38.5, 129.6],
];

/** how far a locked map may be panned: Korea plus a little sea */
const KOREA_MAX_BOUNDS: LatLngBoundsExpression = [
	[32.4, 124.2],
	[39.4, 131.2],
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

/** a gentle arc between two points (quadratic curve, bulging to one side), sampled for a polyline */
const arc = ([lat1, lng1]: [number, number], [lat2, lng2]: [number, number], steps = 32): [number, number][] => {
	const midLat = (lat1 + lat2) / 2;
	const midLng = (lng1 + lng2) / 2;
	const dLat = lat2 - lat1;
	const dLng = lng2 - lng1;
	// control point: perpendicular offset, 22% of the distance
	const cLat = midLat - dLng * 0.22;
	const cLng = midLng + dLat * 0.22;
	return Array.from({ length: steps + 1 }, (_, i) => {
		const t = i / steps;
		const u = 1 - t;
		return [u * u * lat1 + 2 * u * t * cLat + t * t * lat2, u * u * lng1 + 2 * u * t * cLng + t * t * lng2];
	});
};

/** pin: accent dot with a white ring and a soft pulsing halo, optional name label */
const pinIcon = (marker: MapMarker, showLabel: boolean) =>
	L.divIcon({
		className: 'cd-pin-wrap',
		iconSize: [0, 0],
		html: `<span class="cd-pin ${marker.tone === 'muted' ? 'is-muted' : ''} ${marker.labelSide ? `label-${marker.labelSide}` : ''}"><span class="cd-pin-halo"></span><span class="cd-pin-dot"></span>${
			showLabel ? `<span class="cd-pin-label">${marker.title.replace(/</g, '&lt;')}</span>` : ''
		}</span>`,
	});

/** MapContainer props are fixed after mount, so refit when the points change (e.g. events arrive) */
const FitToPoints = ({ points, lockToKorea }: { points: [number, number][]; lockToKorea: boolean }) => {
	const map = useMap();
	const key = points.map(([lat, lng]) => `${lat},${lng}`).join('|');

	useEffect(() => {
		if (lockToKorea) {
			map.fitBounds(KOREA_BOUNDS, { padding: [8, 8] });
			// the fitted zoom is the furthest out a user may go
			map.setMinZoom(map.getZoom());
			return;
		}
		map.fitBounds(boundsOf(points), { padding: [36, 36], maxZoom: 9 });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map, key, lockToKorea]);

	return null;
};

const KoreaMap = ({
	markers,
	path = [],
	pendingPath = [],
	links = [],
	showLabels = false,
	className = '',
	ariaLabel,
	lockToKorea = false,
}: KoreaMapProps) => {
	const { mode } = useColorMode();
	// recomputed when the theme flips, so lines pick up the new accent
	const accent = useMemo(accentColor, [mode]);
	const points: [number, number][] = [...markers.map((m) => [m.lat, m.lng] as [number, number]), ...path, ...pendingPath];
	const arcs = useMemo(() => links.map(([from, to]) => arc(from, to)), [links]);

	return (
		// isolate: Leaflet panes use z-index 400+, keep them under the sticky header and the widget
		<div role="region" aria-label={ariaLabel} className={`cd-map relative isolate overflow-hidden rounded-[24px] ${className}`}>
			<MapContainer
				bounds={lockToKorea ? KOREA_BOUNDS : boundsOf(points)}
				boundsOptions={lockToKorea ? { padding: [8, 8] } : { padding: [36, 36], maxZoom: 9 }}
				maxBounds={lockToKorea ? KOREA_MAX_BOUNDS : undefined}
				maxBoundsViscosity={lockToKorea ? 1 : undefined}
				zoomSnap={lockToKorea ? 0.25 : 1}
				scrollWheelZoom={false}
				zoomControl
				attributionControl
				className="h-full w-full"
			>
				<TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} className="cd-map-tiles" maxZoom={19} />
				<FitToPoints points={points} lockToKorea={lockToKorea} />

				{arcs.map((line, i) => (
					<Polyline
						key={`link-${i}`}
						positions={line as LatLngExpression[]}
						pathOptions={{ color: accent, weight: 2.5, opacity: 0.85, dashArray: '2 10', lineCap: 'round', className: 'cd-route-flow' }}
					/>
				))}

				{path.length > 1 && (
					<Polyline positions={path as LatLngExpression[]} pathOptions={{ color: accent, weight: 4, opacity: 0.95, lineCap: 'round' }} />
				)}
				{pendingPath.length > 1 && (
					<Polyline
						positions={pendingPath as LatLngExpression[]}
						pathOptions={{ color: accent, weight: 3, opacity: 0.8, dashArray: '2 10', lineCap: 'round', className: 'cd-route-flow' }}
					/>
				)}

				{markers.map((marker) => (
					<Marker key={marker.id} position={[marker.lat, marker.lng]} icon={pinIcon(marker, showLabels)} keyboard>
						<Popup closeButton={false} offset={[0, -8]}>
							<p>
								<strong>{marker.title}</strong>
							</p>
							{marker.lines?.map((line) => (
								<p key={line} className="cd-popup-muted">
									{line}
								</p>
							))}
							{marker.href && (
								<p style={{ marginTop: 6 }}>
									<Link href={marker.href}>{marker.linkText ?? 'Open'} →</Link>
								</p>
							)}
						</Popup>
					</Marker>
				))}
			</MapContainer>
		</div>
	);
};

export default KoreaMap;
