import React, { useState } from 'react';
import { NextPage } from 'next';
import { Button, MenuItem, Pagination, Select, Stack, TextField, Typography } from '@mui/material';
import { ShipmentCard } from './ShipmentCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Shipment } from '../../types/shipment/shipment';
import { MyShipmentsInquiry } from '../../types/shipment/shipment.input';
import { TrackingEventInput } from '../../types/tracking-event/tracking-event.input';
import { T } from '../../types/common';
import { ShipmentLocation, ShipmentStatus } from '../../enums/shipment.enum';
import { MemberType } from '../../enums/member.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { CREATE_TRACKING_EVENT } from '../../../apollo/user/mutation';
import { GET_CARRIER_SHIPMENTS } from '../../../apollo/user/query';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { carrierNextStatuses } from '../../config';
import { labelOf } from '../../utils';

const statusTabs: ShipmentStatus[] = [
	ShipmentStatus.CREATED,
	ShipmentStatus.PICKED_UP,
	ShipmentStatus.IN_TRANSIT,
	ShipmentStatus.DELIVERED,
	ShipmentStatus.CANCELLED,
];

interface AddEventFormProps {
	shipment: Shipment;
	createEventHandler: (input: TrackingEventInput) => Promise<void>;
}

/** inline form that appends the next tracking event to the hash chain **/
const AddEventForm = (props: AddEventFormProps) => {
	const { shipment, createEventHandler } = props;
	const nextStatuses = carrierNextStatuses[shipment.shipmentStatus] ?? [];
	const [eventStatus, setEventStatus] = useState<ShipmentStatus>(nextStatuses[0]);
	const [eventLocation, setEventLocation] = useState<ShipmentLocation>(shipment.shipmentOrigin);
	const [eventNote, setEventNote] = useState<string>('');

	if (nextStatuses.length === 0) return null;

	return (
		<Stack direction={'row'} spacing={1} alignItems={'center'} sx={{ ml: '12px' }}>
			<Select size={'small'} value={eventStatus} onChange={(e: any) => setEventStatus(e.target.value)}>
				{nextStatuses.map((status) => (
					<MenuItem value={status} key={status}>
						{labelOf(status)}
					</MenuItem>
				))}
			</Select>
			<Select size={'small'} value={eventLocation} onChange={(e: any) => setEventLocation(e.target.value)}>
				{Object.values(ShipmentLocation).map((location) => (
					<MenuItem value={location} key={location}>
						{labelOf(location)}
					</MenuItem>
				))}
			</Select>
			<TextField
				size={'small'}
				placeholder={'Note (optional)'}
				value={eventNote}
				onChange={(e) => setEventNote(e.target.value)}
				sx={{ width: '140px' }}
			/>
			<Button
				variant={'contained'}
				size={'small'}
				onClick={async () => {
					await createEventHandler({
						shipmentId: shipment._id,
						eventStatus,
						eventLocation,
						...(eventNote.trim() ? { eventNote: eventNote.trim() } : {}),
					});
					setEventNote('');
				}}
			>
				Add
			</Button>
		</Stack>
	);
};

const CarrierShipments: NextPage = ({ initialInput, ...props }: any) => {
	const [searchFilter, setSearchFilter] = useState<MyShipmentsInquiry>(initialInput);
	const [carrierShipments, setCarrierShipments] = useState<Shipment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const [createTrackingEvent] = useMutation(CREATE_TRACKING_EVENT);

	const { refetch: getCarrierShipmentsRefetch } = useQuery(GET_CARRIER_SHIPMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: user?.memberType !== MemberType.CARRIER,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setCarrierShipments(data?.getCarrierShipments?.list);
			setTotal(data?.getCarrierShipments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: ShipmentStatus) => {
		setSearchFilter({ ...searchFilter, page: 1, search: { shipmentStatus: value } });
	};

	const createEventHandler = async (input: TrackingEventInput) => {
		try {
			await createTrackingEvent({ variables: { input } });
			await sweetTopSmallSuccessAlert('Event added', 800);
			await getCarrierShipmentsRefetch({ input: searchFilter });
		} catch (err: any) {
			// backend messages: INVALID_STATUS_TRANSITION, SAME_LOCATION_AS_LAST_EVENT, CHAIN_CONFLICT, ...
			await sweetErrorHandling(err);
		}
	};

	if (user?.memberType !== MemberType.CARRIER) {
		router.back();
	}

	// same layout at every width; scss/pc/mypage/responsive.scss stacks it below 768px
	{
		return (
			<div id="my-property-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Assigned Shipments</Typography>
						<Typography className="sub-title">Every status update is written to the hash chain</Typography>
					</Stack>
				</Stack>
				<Stack className="property-list-box">
					<Stack className="tab-name-box">
						{statusTabs.map((status) => (
							<Typography
								key={status}
								onClick={() => changeStatusHandler(status)}
								className={searchFilter.search.shipmentStatus === status ? 'active-tab-name' : 'tab-name'}
							>
								{labelOf(status)}
							</Typography>
						))}
					</Stack>
					<Stack className="list-box">
						<Stack className="listing-title-box">
							<Typography className="title-text">Shipment</Typography>
							<Typography className="title-text">Date Created</Typography>
							<Typography className="title-text">Status</Typography>
							<Typography className="title-text">Views</Typography>
						</Stack>

						{carrierShipments?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Shipment found!</p>
							</div>
						) : (
							carrierShipments.map((shipment: Shipment) => (
								<ShipmentCard key={shipment._id} shipment={shipment}>
									{/* key on status so the form resets to the new "next" options after each event */}
									<AddEventForm
										key={`${shipment._id}-${shipment.shipmentStatus}-${shipment.lastEventHash}`}
										shipment={shipment}
										createEventHandler={createEventHandler}
									/>
								</ShipmentCard>
							))
						)}

						{carrierShipments.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{total} shipment(s)</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

CarrierShipments.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'updatedAt',
		search: {
			shipmentStatus: 'CREATED',
		},
	},
};

export default CarrierShipments;
