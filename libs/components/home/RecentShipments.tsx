import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_SHIPMENTS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';
import { Shipment } from '../../types/shipment/shipment';
import { ShipmentsInquiry } from '../../types/shipment/shipment.input';
import ShipmentTile from '../ui/ShipmentTile';
import { useTranslation } from 'next-i18next';

const RECENT_INPUT: ShipmentsInquiry = {
	page: 1,
	limit: 6,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const SkeletonTile = () => (
	<div className="flex flex-col overflow-hidden rounded-card border border-line bg-card" aria-hidden="true">
		<div className="aspect-[16/10] w-full animate-pulse bg-surface motion-reduce:animate-none" />
		<div className="flex flex-col gap-3 p-4">
			<div className="h-5 w-3/4 animate-pulse rounded bg-surface motion-reduce:animate-none" />
			<div className="h-4 w-1/2 animate-pulse rounded bg-surface motion-reduce:animate-none" />
			<div className="h-4 w-full animate-pulse rounded bg-surface motion-reduce:animate-none" />
		</div>
	</div>
);

const RecentShipments = () => {
	const { t } = useTranslation('home');
	const { data, loading, error } = useQuery(GET_SHIPMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: RECENT_INPUT },
	});

	const shipments: Shipment[] = data?.getShipments?.list ?? [];
	const showSkeleton = loading && shipments.length === 0;

	return (
		<section className="w-full bg-page">
			<div className="mx-auto max-w-[1440px] px-4 py-20 md:px-10 md:py-28">
				<div className="mb-12 flex items-end justify-between gap-4">
					<div className="flex min-w-0 flex-col gap-3">
						<h2 className="m-0 text-section font-extrabold text-ink">{t('recent.title')}</h2>
						<p className="m-0 text-[1.1875rem] font-medium text-ink/75">{t('recent.sub')}</p>
					</div>
					<Link
						href={'/shipment'}
						className="hidden h-12 shrink-0 items-center rounded-full border-[1.5px] border-ink px-6 text-[1rem] font-medium text-ink transition duration-150 hover:bg-ink hover:text-page sm:inline-flex"
					>
						{t('recent.viewAll')}
					</Link>
				</div>

				{showSkeleton ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6" aria-busy="true">
						{Array.from({ length: 3 }).map((_, index) => (
							<SkeletonTile key={index} />
						))}
					</div>
				) : shipments.length > 0 ? (
					<ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
						{shipments.map((shipment) => (
							<li key={shipment._id} className="flex">
								<ShipmentTile shipment={shipment} />
							</li>
						))}
					</ul>
				) : (
					<p className="m-0 rounded-card border border-line bg-surface px-5 py-8 text-center text-body text-muted">
						{error ? t('recent.error') : t('recent.empty')}
					</p>
				)}
			</div>
		</section>
	);
};

export default RecentShipments;
