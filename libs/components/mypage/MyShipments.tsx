import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ShipmentCard } from './ShipmentCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Shipment } from '../../types/shipment/shipment';
import { MyShipmentsInquiry } from '../../types/shipment/shipment.input';
import { T } from '../../types/common';
import { ShipmentStatus } from '../../enums/shipment.enum';
import { MemberType } from '../../enums/member.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { UPDATE_SHIPMENT } from '../../../apollo/user/mutation';
import { GET_MY_SHIPMENTS } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';

/** tabs for the shipper's own shipments (DELETE is hidden) **/
const statusTabs: ShipmentStatus[] = [
	ShipmentStatus.CREATED,
	ShipmentStatus.PICKED_UP,
	ShipmentStatus.IN_TRANSIT,
	ShipmentStatus.DELIVERED,
	ShipmentStatus.CANCELLED,
];

const MyShipments: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const [searchFilter, setSearchFilter] = useState<MyShipmentsInquiry>(initialInput);
	const [myShipments, setMyShipments] = useState<Shipment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/

	const [updateShipment] = useMutation(UPDATE_SHIPMENT);

	const {
		loading: getMyShipmentsLoading,
		data: getMyShipmentsData,
		error: getMyShipmentsError,
		refetch: getMyShipmentsRefetch,
	} = useQuery(GET_MY_SHIPMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: user?.memberType !== MemberType.USER,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMyShipments(data?.getMyShipments?.list);
			setTotal(data?.getMyShipments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const changeStatusHandler = (value: ShipmentStatus) => {
		setSearchFilter({ ...searchFilter, page: 1, search: { shipmentStatus: value } });
	};

	const deleteShipmentHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Do you want to delete the shipment ?')) {
				await updateShipment({
					variables: {
						input: {
							_id: id,
							shipmentStatus: ShipmentStatus.DELETE,
						},
					},
				});

				await getMyShipmentsRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const updateShipmentHandler = async (status: string, id: string) => {
		try {
			if (await sweetConfirmAlert(`Do you want to change the shipment to ${status} ?`)) {
				await updateShipment({
					variables: {
						input: {
							_id: id,
							shipmentStatus: status,
						},
					},
				});

				await getMyShipmentsRefetch({ input: searchFilter });
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (user?.memberType !== MemberType.USER) {
		router.back();
	}

	if (device === 'mobile') {
		return <div>MY SHIPMENTS MOBILE</div>;
	} else {
		return (
			<div id="my-property-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Shipments</Typography>
						<Typography className="sub-title">Shipments you created as a shipper</Typography>
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
								{status}
							</Typography>
						))}
					</Stack>
					<Stack className="list-box">
						<Stack className="listing-title-box">
							<Typography className="title-text">Shipment</Typography>
							<Typography className="title-text">Date Created</Typography>
							<Typography className="title-text">Status</Typography>
							<Typography className="title-text">View</Typography>
							{searchFilter.search.shipmentStatus === ShipmentStatus.CREATED && (
								<Typography className="title-text">Action</Typography>
							)}
						</Stack>

						{myShipments?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Shipment found!</p>
							</div>
						) : (
							myShipments.map((shipment: Shipment) => {
								return (
									<ShipmentCard
										key={shipment._id}
										shipment={shipment}
										deleteShipmentHandler={deleteShipmentHandler}
										updateShipmentHandler={updateShipmentHandler}
									/>
								);
							})
						)}

						{myShipments.length !== 0 && (
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

MyShipments.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			shipmentStatus: 'CREATED',
		},
	},
};

export default MyShipments;
