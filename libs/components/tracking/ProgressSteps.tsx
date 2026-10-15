import React from 'react';
import { ShipmentStatus } from '../../enums/shipment.enum';

const STEPS: { status: ShipmentStatus; label: string }[] = [
	{ status: ShipmentStatus.CREATED, label: 'Created' },
	{ status: ShipmentStatus.PICKED_UP, label: 'Picked up' },
	{ status: ShipmentStatus.IN_TRANSIT, label: 'In transit' },
	{ status: ShipmentStatus.DELIVERED, label: 'Delivered' },
];

interface ProgressStepsProps {
	status: ShipmentStatus;
}

/** 4-step bar; a cancelled shipment shows a red notice instead */
const ProgressSteps = ({ status }: ProgressStepsProps) => {
	if (status === ShipmentStatus.CANCELLED || status === ShipmentStatus.DELETE) {
		return (
			<p className="m-0 rounded-card border border-bad/40 bg-bad/5 px-4 py-3 text-[0.9375rem] font-medium leading-snug text-bad">
				This shipment was cancelled. No further events will be added.
			</p>
		);
	}

	const current = Math.max(
		0,
		STEPS.findIndex((step) => step.status === status),
	);
	const delivered = status === ShipmentStatus.DELIVERED;

	return (
		<ol className="m-0 grid list-none grid-cols-4 gap-2 p-0" aria-label="Shipment progress">
			{STEPS.map((step, index) => {
				const done = index <= current;
				const isCurrent = index === current;
				return (
					<li key={step.status} className="flex flex-col gap-2" aria-current={isCurrent ? 'step' : undefined}>
						<span
							className={`h-1.5 w-full rounded-full transition-colors duration-150 ${
								done ? (delivered ? 'bg-ok' : 'bg-accent') : 'bg-line'
							}`}
							aria-hidden="true"
						/>
						<span
							className={`text-small leading-snug ${
								isCurrent ? 'font-semibold text-ink' : done ? 'text-ink' : 'text-muted'
							}`}
						>
							{step.label}
						</span>
					</li>
				);
			})}
		</ol>
	);
};

export default ProgressSteps;
