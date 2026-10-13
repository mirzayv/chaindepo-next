import React, { useEffect } from 'react';
import { Chip, Divider, Stack, Typography } from '@mui/material';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import { GET_EVENT_ANCHOR_STATUSES, GET_TRACKING_EVENTS, VERIFY_SHIPMENT_CHAIN } from '../../../apollo/user/query';
import { ChainVerification, EventAnchorStatus, TrackingEvent } from '../../types/tracking-event/tracking-event';
import { SEPOLIA_TX_URL } from '../../config';

interface TrackingTimelineProps {
	shipmentId: string | null;
	/** changes whenever the chain tip moves (shipment.lastEventHash) so the timeline refetches **/
	refreshKey?: string;
}

const shortHash = (hash?: string | null) => (hash ? `${hash.slice(0, 10)}…${hash.slice(-6)}` : '-');

const TrackingTimeline = (props: TrackingTimelineProps) => {
	const { shipmentId, refreshKey } = props;

	/** APOLLO REQUESTS **/
	const { data: eventsData, refetch: eventsRefetch } = useQuery(GET_TRACKING_EVENTS, {
		fetchPolicy: 'network-only',
		variables: { input: shipmentId },
		skip: !shipmentId,
	});

	const { data: chainData, refetch: chainRefetch } = useQuery(VERIFY_SHIPMENT_CHAIN, {
		fetchPolicy: 'network-only',
		variables: { input: shipmentId },
		skip: !shipmentId,
	});

	const { data: anchorData, refetch: anchorRefetch } = useQuery(GET_EVENT_ANCHOR_STATUSES, {
		fetchPolicy: 'network-only',
		variables: { input: shipmentId },
		skip: !shipmentId,
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!shipmentId || !refreshKey) return;
		eventsRefetch({ input: shipmentId }).then();
		chainRefetch({ input: shipmentId }).then();
		anchorRefetch({ input: shipmentId }).then();
	}, [refreshKey]);

	const events: TrackingEvent[] = eventsData?.getTrackingEvents ?? [];
	const chain: ChainVerification | undefined = chainData?.verifyShipmentChain;
	const anchorMap: Record<string, EventAnchorStatus> = {};
	(anchorData?.getEventAnchorStatuses ?? []).forEach((status: EventAnchorStatus) => {
		anchorMap[status.eventId] = status;
	});

	const chainLabel = !chain
		? 'Verifying…'
		: chain.valid
		? `Chain valid · ${chain.totalEvents} events · ${
				chain.anchoredEvents === null ? 'anchoring off' : `${chain.anchoredEvents} anchored`
		  }`
		: `Chain broken at #${chain.brokenAtIndex ?? '?'} (${chain.totalEvents} events)`;

	return (
		<Stack className={'prop-desc-config'} sx={{ mt: '30px' }}>
			<Stack className={'top'}>
				<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
					<Typography className={'title'}>Tracking Timeline</Typography>
					<Chip label={chainLabel} color={!chain ? 'default' : chain.valid ? 'success' : 'error'} size={'small'} />
				</Stack>
				{events.length === 0 && <Typography className={'desc'}>No tracking events yet.</Typography>}
				{events.map((event: TrackingEvent, index: number) => {
					const anchor = anchorMap[event._id];
					const txHash = anchor?.eventTxHash ?? event.eventTxHash;
					const anchoredMark = anchor?.anchored === true ? '✓' : anchor?.anchored === false ? '✗' : '–';
					return (
						<Stack key={event._id} sx={{ mt: '16px' }}>
							<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
								<Typography sx={{ fontWeight: 600 }}>
									#{index} · {event.eventStatus} · {event.eventLocation}
								</Typography>
								<Typography sx={{ fontSize: '13px', color: '#717171' }}>
									{moment(event.createdAt).format('YYYY.MM.DD HH:mm')}
								</Typography>
							</Stack>
							{event.eventNote && <Typography sx={{ fontSize: '14px' }}>{event.eventNote}</Typography>}
							<Typography sx={{ fontSize: '12px', color: '#717171', fontFamily: 'monospace' }}>
								hash {shortHash(event.eventHash)} · on-chain {anchoredMark}{' '}
								{txHash && (
									<a href={`${SEPOLIA_TX_URL}${txHash}`} target={'_blank'} rel={'noreferrer'}>
										tx {shortHash(txHash)}
									</a>
								)}
							</Typography>
							{index !== events.length - 1 && <Divider sx={{ mt: '12px' }} />}
						</Stack>
					);
				})}
			</Stack>
		</Stack>
	);
};

export default TrackingTimeline;
