import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_EVENT_ANCHOR_STATUSES, GET_TRACKING_EVENTS, VERIFY_SHIPMENT_CHAIN } from '../../apollo/user/query';
import { ChainVerification, EventAnchorStatus, TrackingEvent } from '../types/tracking-event/tracking-event';

/**
 * Tracking events, chain verification and Sepolia anchor status for one shipment.
 * refreshKey is the chain tip (shipment.lastEventHash): when it moves, everything refetches.
 */
const useShipmentChain = (shipmentId: string | null, refreshKey?: string | null) => {
	const [verifying, setVerifying] = useState<boolean>(false);
	const [checkedAt, setCheckedAt] = useState<Date | null>(null);

	/** APOLLO REQUESTS **/
	const {
		data: eventsData,
		loading: eventsLoading,
		refetch: eventsRefetch,
	} = useQuery(GET_TRACKING_EVENTS, {
		fetchPolicy: 'network-only',
		variables: { input: shipmentId },
		skip: !shipmentId,
	});

	const {
		data: chainData,
		loading: chainLoading,
		error: chainError,
		refetch: chainRefetch,
	} = useQuery(VERIFY_SHIPMENT_CHAIN, {
		fetchPolicy: 'network-only',
		variables: { input: shipmentId },
		skip: !shipmentId,
		onCompleted: () => setCheckedAt(new Date()),
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refreshKey]);

	/** HANDLERS **/
	const verifyAgain = async () => {
		if (!shipmentId || verifying) return;
		setVerifying(true);
		try {
			await Promise.all([chainRefetch({ input: shipmentId }), anchorRefetch({ input: shipmentId })]);
			setCheckedAt(new Date());
		} catch (err: any) {
			console.log('ERROR, verifyAgain:', err.message);
		} finally {
			setVerifying(false);
		}
	};

	const events: TrackingEvent[] = eventsData?.getTrackingEvents ?? [];
	const chain: ChainVerification | null = chainData?.verifyShipmentChain ?? null;
	const anchorMap = useMemo(() => {
		const map: Record<string, EventAnchorStatus> = {};
		(anchorData?.getEventAnchorStatuses ?? []).forEach((status: EventAnchorStatus) => {
			map[status.eventId] = status;
		});
		return map;
	}, [anchorData]);

	return {
		events,
		eventsLoading,
		chain,
		chainLoading,
		chainError,
		anchorMap,
		verifying,
		checkedAt,
		verifyAgain,
	};
};

export default useShipmentChain;
