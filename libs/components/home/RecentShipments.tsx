import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_SHIPMENTS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { Shipment } from '../../types/shipment/shipment';
import { ShipmentsInquiry } from '../../types/shipment/shipment.input';
import ShipmentTile from '../ui/ShipmentTile';

const RECENT_INPUT: ShipmentsInquiry = {
	page: 1,
	limit: 6,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const SkeletonTile = () => (
	<div className="flex flex-col overflow-hidden rounded-card border border-line bg-white" aria-hidden="true">
		<div className="aspect-[16/10] w-full animate-pulse bg-surface motion-reduce:animate-none" />
		<div className="flex flex-col gap-3 p-4">
			<div className="h-5 w-3/4 animate-pulse rounded bg-surface motion-reduce:animate-none" />
			<div className="h-4 w-1/2 animate-pulse rounded bg-surface motion-reduce:animate-none" />
			<div className="h-4 w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
		</div>
	</div>
);

const RecentShipments = () => {
	const { data, loading, error } = useQuery(GET_SHIPMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: RECENT_INPUT },
	});

	const shipments: Shipment[] = data?.getShipments?.list ?? [];
	const showSkeleton = loading && shipments.length === 0;

	return (
		<section className="w-full bg-white">
			<div className="mx-auto max-w-page px-4 py-14 md:px-6 md:py-20">
				<div className="mb-8 flex items-end justify-between gap-4">
					<div className="flex flex-col gap-2">
						<h2 className="m-0 text-h2 font-semibold text-ink">Recent shipments</h2>
						<p className="m-0 text-body text-muted">The latest shipments posted on ChainDepo.</p>
					</div>
					<Link
						href={'/shipment'}
						className="shrink-0 text-[0.9375rem] font-semibold leading-snug text-accent transition-colors duration-150 hover:text-accent-hover"
					>
						View all →
					</Link>
				</div>

				{showSkeleton ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6" aria-busy="true">
						{Array.from({ length: 3 }).map((_, index) => (
							<SkeletonTile key={index} />
						))}
					</div>
				) : shipments.length > 0 ? (
					<ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
						{shipments.map((shipment) => (
							<li key={shipment._id} className="flex">
								<ShipmentTile shipment={shipment} />
							</li>
						))}
					</ul>
				) : (
					<p className="m-0 rounded-card border border-line bg-surface px-5 py-8 text-center text-body text-muted">
						{error ? 'Shipments could not be loaded right now.' : 'No shipments yet.'}
					</p>
				)}
			</div>
		</section>
	);
};

export default RecentShipments;
