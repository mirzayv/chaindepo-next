/**
 * ============================================================================
 *  FRONTEND: pages/shipment/detail.tsx   →   URL: localhost:3000/shipment/detail?id=6512ab...
 *                                                 yoki /shipment/detail?code=CD261013A1B2C3D4
 *  Shipment tracking page
 * ============================================================================
 *
 *  OQIM:
 *  parametr yo'q → bo'sh "Track a shipment" formasi
 *  ?id=   → setShipmentId(id) → GET_SHIPMENT ketadi
 *  ?code= → GET_SHIPMENT_BY_TRACKING_CODE → _id topiladi → setShipmentId(_id) → GET_SHIPMENT ketadi
 *           kod topilmasa → forma ostida xato matni
 *  shipmentId bor → useShipmentChain (eventlar, zanjir tekshiruvi, Sepolia anchor) + Comments
 */

import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import moment from 'moment';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { userVar } from '../../apollo/store';
import { GET_MEMBER, GET_SHIPMENT, GET_SHIPMENT_BY_TRACKING_CODE } from '../../apollo/user/query';
import { LIKE_TARGET_SHIPMENT } from '../../apollo/user/mutation';
import { Shipment } from '../../libs/types/shipment/shipment';
import { Member } from '../../libs/types/member/member';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { REACT_APP_API_URL } from '../../libs/config';
import { formatKRW, labelOf } from '../../libs/utils';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import useShipmentChain from '../../libs/hooks/useShipmentChain';
import TrackForm from '../../libs/components/ui/TrackForm';
import StatusPill from '../../libs/components/ui/StatusPill';
import CopyButton from '../../libs/components/ui/CopyButton';
import ImageWithFallback from '../../libs/components/ui/ImageWithFallback';
import { cityName } from '../../libs/components/ui/map/cities';
import ProgressSteps from '../../libs/components/tracking/ProgressSteps';
import RouteMap from '../../libs/components/tracking/RouteMap';
import Timeline from '../../libs/components/tracking/Timeline';
import ChainCard from '../../libs/components/tracking/ChainCard';
import Comments from '../../libs/components/tracking/Comments';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});
// Faqat tarjimalar (SSG). Yuk ma'lumoti brauzerda keladi (CSR).

/** H1 + tracking form; used with no params and when a code or id is not found */
const TrackEmptyState = ({ code, error }: { code?: string; error?: string }) => (
	<div className="mx-auto flex max-w-page flex-col px-4 py-16 md:px-6 md:py-24">
		<div className="flex w-full max-w-xl flex-col gap-3">
			<h1 className="m-0 text-display font-bold text-ink">Track a shipment</h1>
			<p className="m-0 text-[1.0625rem] leading-relaxed text-muted">
				Enter a tracking code to see every event, where it happened and whether the record still checks out on chain.
			</p>
			{/* key: remount with the new code when the URL changes */}
			<TrackForm key={code ?? ''} defaultValue={code} error={error} className="mt-4" />
		</div>
	</div>
);

const Fact = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<div className="flex min-w-0 flex-col gap-1">
		<dt className="text-small leading-snug text-muted">{label}</dt>
		<dd className="m-0 truncate text-[0.9375rem] font-medium leading-snug text-ink">{children}</dd>
	</div>
);

const ShipmentDetail: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [shipmentId, setShipmentId] = useState<string | null>(null);
	const [trackingCode, setTrackingCode] = useState<string | null>(null);
	const [codeError, setCodeError] = useState<string>('');
	const [carrier, setCarrier] = useState<Member | null>(null);
	const [activeImage, setActiveImage] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [likeTargetShipment] = useMutation(LIKE_TARGET_SHIPMENT);

	// ?code= → _id
	const { loading: codeLoading } = useQuery(GET_SHIPMENT_BY_TRACKING_CODE, {
		fetchPolicy: 'network-only',
		variables: { input: trackingCode },
		skip: !trackingCode,
		onCompleted: (data: T) => {
			if (data?.getShipmentByTrackingCode?._id) setShipmentId(data.getShipmentByTrackingCode._id);
			else setCodeError(`No shipment found for ${trackingCode}.`);
		},
		onError: () => setCodeError(`No shipment found for ${trackingCode}. Check the code and try again.`),
	});

	const {
		data: shipmentData,
		loading: shipmentLoading,
		error: shipmentError,
		refetch: shipmentRefetch,
	} = useQuery(GET_SHIPMENT, {
		fetchPolicy: 'network-only',
		// backend getShipment records a view and fills meLiked, so always go to the server
		variables: { input: shipmentId },
		skip: !shipmentId,
		notifyOnNetworkStatusChange: true,
	});
	const shipment: Shipment | null = shipmentData?.getShipment ?? null;

	useQuery(GET_MEMBER, {
		fetchPolicy: 'cache-and-network',
		variables: { input: shipment?.carrierId },
		skip: !shipment?.carrierId,
		onCompleted: (data: T) => {
			if (data?.getMember) setCarrier(data.getMember);
		},
	});

	const { events, eventsLoading, chain, chainLoading, chainError, anchorMap, verifying, checkedAt, verifyAgain } =
		useShipmentChain(shipmentId, shipment?.lastEventHash);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;
		const id = (router.query.id as string) || null;
		const code = ((router.query.code as string) || '').trim().toUpperCase() || null;
		setCodeError('');
		setCarrier(null);
		setActiveImage('');
		setTrackingCode(id ? null : code);
		setShipmentId(id);
	}, [router.isReady, router.query.id, router.query.code]);

	useEffect(() => {
		if (shipment?.shipmentImages?.length && !activeImage) setActiveImage(shipment.shipmentImages[0]);
	}, [shipment, activeImage]);

	/** HANDLERS **/
	const likeHandler = async () => {
		try {
			if (!shipment?._id) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetShipment({ variables: { input: shipment._id } });
			await shipmentRefetch({ input: shipmentId });
		} catch (err: any) {
			console.log('ERROR, likeHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	/** RENDER **/
	let body: React.ReactNode;

	if (!router.isReady || codeLoading || (shipmentId && shipmentLoading && !shipment)) {
		body = (
			<div className="mx-auto flex max-w-page flex-col gap-4 px-4 py-12 md:px-6" aria-busy="true">
				<div className="h-5 w-48 animate-pulse rounded bg-surface motion-reduce:animate-none" />
				<div className="h-10 w-2/3 animate-pulse rounded bg-surface motion-reduce:animate-none" />
				<div className="h-24 w-full animate-pulse rounded-card bg-surface motion-reduce:animate-none" />
			</div>
		);
	} else if (!shipmentId && !trackingCode) {
		body = <TrackEmptyState />;
	} else if (codeError || (shipmentId && shipmentError) || !shipment) {
		body = (
			<TrackEmptyState
				code={trackingCode ?? undefined}
				error={codeError || 'We could not find that shipment. Check the link or enter the tracking code.'}
			/>
		);
	} else {
		const liked = Boolean(shipment.meLiked?.[0]?.myFavorite);
		const shipper = shipment.memberData;
		const shipperAvatar = shipper?.memberImage
			? `${REACT_APP_API_URL}/${shipper.memberImage}`
			: '/img/profile/defaultUser.svg';
		const images = shipment.shipmentImages ?? [];

		body = (
			<>
				<Head>
					<title>{`${shipment.shipmentTrackingCode} · ChainDepo`}</title>
				</Head>

				{/* header block */}
				<section className="w-full border-b border-line bg-surface">
					<div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-8 md:px-6 md:py-10">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="flex items-center gap-1">
								<span className="font-mono text-[0.9375rem] font-medium leading-snug text-ink">
									{shipment.shipmentTrackingCode}
								</span>
								<CopyButton value={shipment.shipmentTrackingCode} label="Copy tracking code" />
							</div>
							<div className="flex items-center gap-3">
								<span className="text-small leading-snug text-muted">{shipment.shipmentViews} views</span>
								<button
									type="button"
									onClick={likeHandler}
									aria-pressed={liked}
									aria-label={liked ? 'Remove from favorites' : 'Add to favorites'}
									className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-small font-medium text-ink transition-colors duration-150 ease-out hover:border-accent active:scale-95 motion-reduce:transform-none"
								>
									<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
										<path
											d="M8 13.5S2 10 2 5.8A3 3 0 018 4.3a3 3 0 016 1.5C14 10 8 13.5 8 13.5z"
											fill={liked ? '#C62828' : 'none'}
											stroke={liked ? '#C62828' : 'currentColor'}
											strokeWidth="1.4"
											strokeLinejoin="round"
										/>
									</svg>
									{shipment.shipmentLikes}
								</button>
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<div className="flex flex-wrap items-start gap-x-4 gap-y-2">
								<h1 className="m-0 min-w-0 break-words text-h2 font-bold text-ink md:text-[2.25rem] md:leading-[1.1]">
									{shipment.shipmentTitle}
								</h1>
								<StatusPill status={shipment.shipmentStatus} className="mt-1" />
							</div>
							<p className="m-0 text-[1.0625rem] font-medium leading-snug text-ink">
								{cityName(shipment.shipmentOrigin)} <span className="text-muted">→</span>{' '}
								{cityName(shipment.shipmentDestination)}
							</p>
							{shipment.shipmentAddress && (
								<p className="m-0 text-small leading-snug text-muted">Pickup: {shipment.shipmentAddress}</p>
							)}
						</div>

						<ProgressSteps status={shipment.shipmentStatus} />

						<dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 sm:grid-cols-3 lg:grid-cols-6">
							<Fact label="Weight">{shipment.shipmentWeight} kg</Fact>
							<Fact label="Price">{formatKRW(shipment.shipmentPrice)}</Fact>
							<Fact label="Type">{labelOf(shipment.shipmentType)}</Fact>
							<Fact label="Created">{moment(shipment.createdAt).format('YYYY.MM.DD')}</Fact>
							<Fact label="Shipper">
								{shipper?._id ? (
									<Link
										href={`/member?memberId=${shipper._id}`}
										className="inline-flex max-w-full items-center gap-2 text-ink transition-colors duration-150 hover:text-accent"
									>
										<img src={shipperAvatar} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />
										<span className="truncate">{shipper.memberNick}</span>
									</Link>
								) : (
									'—'
								)}
							</Fact>
							<Fact label="Carrier">
								{shipment.carrierId ? (
									<Link
										href={`/carrier/detail?carrierId=${shipment.carrierId}`}
										className="text-accent transition-colors duration-150 hover:text-accent-hover hover:underline"
									>
										{carrier?.memberNick ?? 'Assigned'}
									</Link>
								) : (
									<span className="font-normal text-muted">Not assigned</span>
								)}
							</Fact>
						</dl>
					</div>
				</section>

				<div className="mx-auto grid max-w-page gap-8 px-4 py-8 md:px-6 md:py-12 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-10">
					<div className="flex min-w-0 flex-col gap-10">
						<section className="flex flex-col gap-4" aria-labelledby="route-title">
							<h2 id="route-title" className="m-0 text-h3 font-semibold text-ink">
								Route
							</h2>
							<div className="h-[300px] w-full md:h-[380px]">
								<RouteMap shipment={shipment} events={events} className="h-full w-full" />
							</div>
						</section>

						<section className="flex flex-col gap-4" aria-labelledby="timeline-title">
							<div className="flex flex-wrap items-baseline justify-between gap-2">
								<h2 id="timeline-title" className="m-0 text-h3 font-semibold text-ink">
									Tracking events
								</h2>
								{shipment.deliveredAt && (
									<span className="text-small leading-snug text-muted">
										Delivered {moment(shipment.deliveredAt).format('YYYY.MM.DD HH:mm')}
									</span>
								)}
							</div>
							<Timeline
								events={events}
								anchorMap={anchorMap}
								brokenAtIndex={chain && !chain.valid ? chain.brokenAtIndex : null}
								loading={eventsLoading}
							/>
						</section>

						{images.length > 0 && (
							<section className="flex flex-col gap-4" aria-labelledby="photos-title">
								<h2 id="photos-title" className="m-0 text-h3 font-semibold text-ink">
									Cargo photos
								</h2>
								<div className="aspect-[16/10] w-full overflow-hidden rounded-card border border-line bg-surface">
									<ImageWithFallback
										src={activeImage ? `${REACT_APP_API_URL}/${activeImage}` : null}
										alt={shipment.shipmentTitle}
										className="h-full w-full object-cover"
									/>
								</div>
								{images.length > 1 && (
									<div className="flex flex-wrap gap-2">
										{images.map((image, index) => (
											<button
												key={image}
												type="button"
												onClick={() => setActiveImage(image)}
												aria-label={`Show photo ${index + 1}`}
												aria-pressed={image === activeImage}
												className={`h-16 w-20 overflow-hidden rounded-card border p-0 transition-colors duration-150 ${
													image === activeImage ? 'border-accent' : 'border-line hover:border-muted'
												}`}
											>
												<ImageWithFallback
													src={`${REACT_APP_API_URL}/${image}`}
													alt=""
													loading="lazy"
													className="h-full w-full object-cover"
												/>
											</button>
										))}
									</div>
								)}
							</section>
						)}

						{shipment.shipmentDesc && (
							<section className="flex flex-col gap-3" aria-labelledby="desc-title">
								<h2 id="desc-title" className="m-0 text-h3 font-semibold text-ink">
									Description
								</h2>
								<p className="m-0 whitespace-pre-line break-words text-body text-ink">{shipment.shipmentDesc}</p>
							</section>
						)}

						<Comments shipmentId={shipmentId} />
					</div>

					<aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
						<ChainCard
							chain={chain}
							loading={chainLoading && !chain}
							failed={Boolean(chainError)}
							verifying={verifying}
							checkedAt={checkedAt}
							onVerify={verifyAgain}
						/>
					</aside>
				</div>
			</>
		);
	}

	return <div className="cd-ui w-full bg-white">{body}</div>;
};

export default withLayoutFull(ShipmentDetail);
