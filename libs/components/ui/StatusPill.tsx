import React from 'react';
import { ShipmentStatus } from '../../enums/shipment.enum';
import useLabel from '../../hooks/useLabel';

/** dot colour per status; the label stays ink so it reads on white */
export const DOT_CLASS: Record<ShipmentStatus, string> = {
	[ShipmentStatus.CREATED]: 'bg-muted',
	[ShipmentStatus.PICKED_UP]: 'bg-warn',
	[ShipmentStatus.IN_TRANSIT]: 'bg-warn',
	[ShipmentStatus.DELIVERED]: 'bg-ok',
	[ShipmentStatus.CANCELLED]: 'bg-bad',
	[ShipmentStatus.DELETE]: 'bg-bad',
};

interface StatusPillProps {
	status: ShipmentStatus;
	className?: string;
}

const StatusPill = ({ status, className = '' }: StatusPillProps) => {
	const label = useLabel();
	return (
		<span
			className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-card px-2.5 text-small font-medium leading-none text-ink ${className}`}
		>
			<span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[status] ?? 'bg-muted'}`} aria-hidden="true" />
			{label(status)}
		</span>
	);
};

export default StatusPill;
