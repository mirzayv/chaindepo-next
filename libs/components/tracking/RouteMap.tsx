import React, { useMemo } from 'react';
import moment from 'moment';
import { ShipmentLocation, ShipmentStatus } from '../../enums/shipment.enum';
import { Shipment } from '../../types/shipment/shipment';
import { TrackingEvent } from '../../types/tracking-event/tracking-event';
import { labelOf } from '../../utils';
import MapView, { MapMarker } from '../ui/map/MapView';
import { CITIES } from '../ui/map/cities';

interface RouteMapProps {
	shipment: Shipment;
	events: TrackingEvent[];
	className?: string;
}

const coords = (location: ShipmentLocation): [number, number] => [CITIES[location].lat, CITIES[location].lng];

/** drops repeats in a row: SEOUL, SEOUL, DAEJON → SEOUL, DAEJON */
const compact = (locations: ShipmentLocation[]) =>
	locations.filter((location, index) => index === 0 || location !== locations[index - 1]);

/**
 * Origin → each event location in order → destination.
 * Solid line for the part travelled so far, dashed for what is still ahead.
 */
const RouteMap = ({ shipment, events, className = '' }: RouteMapProps) => {
	const { markers, path, pendingPath } = useMemo(() => {
		const origin = shipment.shipmentOrigin;
		const destination = shipment.shipmentDestination;

		const travelled = compact([origin, ...events.map((event) => event.eventLocation)]);
		const last = travelled[travelled.length - 1];
		const finished =
			shipment.shipmentStatus === ShipmentStatus.DELIVERED ||
			shipment.shipmentStatus === ShipmentStatus.CANCELLED ||
			shipment.shipmentStatus === ShipmentStatus.DELETE;
		const ahead = !finished && last !== destination ? [last, destination] : [];

		// one marker per city; popup lists what happened there
		const lines = new Map<ShipmentLocation, string[]>();
		const add = (location: ShipmentLocation, line: string) => lines.set(location, [...(lines.get(location) ?? []), line]);
		add(origin, 'Origin');
		events.forEach((event) =>
			add(event.eventLocation, `${labelOf(event.eventStatus)} · ${moment(event.createdAt).format('MM.DD HH:mm')}`),
		);
		if (destination !== origin) add(destination, 'Destination');

		const reached = new Set<ShipmentLocation>(travelled);
		const markerList: MapMarker[] = Array.from(lines.entries()).map(([location, popupLines]) => ({
			id: location,
			lat: CITIES[location].lat,
			lng: CITIES[location].lng,
			title: CITIES[location].name,
			lines: popupLines,
			tone: reached.has(location) ? 'accent' : 'muted',
		}));

		return {
			markers: markerList,
			path: travelled.map(coords),
			pendingPath: ahead.map(coords),
		};
	}, [shipment, events]);

	return (
		<MapView
			markers={markers}
			path={path}
			pendingPath={pendingPath}
			className={className}
			ariaLabel={`Route map from ${CITIES[shipment.shipmentOrigin].name} to ${CITIES[shipment.shipmentDestination].name}`}
		/>
	);
};

export default RouteMap;
