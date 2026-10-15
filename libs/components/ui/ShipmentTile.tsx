import React from 'react';
import Link from 'next/link';
import { Shipment } from '../../types/shipment/shipment';
import { REACT_APP_API_URL } from '../../config';
import { formatKRW, labelOf } from '../../utils';
import StatusPill from './StatusPill';
import ImageWithFallback from './ImageWithFallback';

interface ShipmentTileProps {
	shipment: Shipment;
}

/** compact shipment card: photo, title, route, status, tracking code and price */
const ShipmentTile = ({ shipment }: ShipmentTileProps) => {
	const image = shipment.shipmentImages?.[0] ? `${REACT_APP_API_URL}/${shipment.shipmentImages[0]}` : null;

	return (
		<Link
			href={`/shipment/detail?id=${shipment._id}`}
			className="group flex w-full flex-col overflow-hidden rounded-card border border-line bg-white text-ink transition-colors duration-150 ease-out hover:border-accent"
		>
			<div className="aspect-[16/10] w-full overflow-hidden bg-surface">
				<ImageWithFallback src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
			</div>
			<div className="flex flex-1 flex-col gap-3 p-4">
				<div className="flex items-start justify-between gap-3">
					<h3 className="m-0 line-clamp-2 text-h3 font-semibold text-ink">{shipment.shipmentTitle}</h3>
					<StatusPill status={shipment.shipmentStatus} className="shrink-0" />
				</div>
				<p className="m-0 text-small text-muted">
					{labelOf(shipment.shipmentOrigin)} → {labelOf(shipment.shipmentDestination)} · {labelOf(shipment.shipmentType)}
				</p>
				<div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
					<span className="truncate font-mono text-small text-muted">{shipment.shipmentTrackingCode}</span>
					<span className="shrink-0 text-[0.9375rem] font-semibold leading-snug text-ink">
						{formatKRW(shipment.shipmentPrice)}
					</span>
				</div>
			</div>
		</Link>
	);
};

export default ShipmentTile;
