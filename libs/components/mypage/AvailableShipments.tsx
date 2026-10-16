import React, { useState } from 'react';
import { NextPage } from 'next';
import { Button, Pagination, Stack, Typography } from '@mui/material';
import { ShipmentCard } from './ShipmentCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Shipment } from '../../types/shipment/shipment';
import { ShipmentsInquiry } from '../../types/shipment/shipment.input';
import { T } from '../../types/common';
import { ShipmentStatus } from '../../enums/shipment.enum';
import { MemberType } from '../../enums/member.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { CLAIM_SHIPMENT } from '../../../apollo/user/mutation';
import { GET_SHIPMENTS } from '../../../apollo/user/query';
import { sweetConfirmAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';

/**
 * CREATED shipments a carrier can claim.
 * The backend has no "unassigned only" filter, so already-assigned shipments are
 * filtered out on the client; a page may therefore show fewer rows than `limit`.
 */
const AvailableShipments: NextPage = ({ initialInput, ...props }: any) => {
	const [searchFilter, setSearchFilter] = useState<ShipmentsInquiry>(initialInput);
	const [availableShipments, setAvailableShipments] = useState<Shipment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const [claimShipment] = useMutation(CLAIM_SHIPMENT);

	const { refetch: getShipmentsRefetch } = useQuery(GET_SHIPMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: user?.memberType !== MemberType.CARRIER,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAvailableShipments((data?.getShipments?.list ?? []).filter((shipment: Shipment) => !shipment.carrierId));
			setTotal(data?.getShipments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	const claimShipmentHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Do you want to take this shipment?')) {
				await claimShipment({ variables: { input: id } });
				await sweetTopSmallSuccessAlert('Claimed', 800);
				await getShipmentsRefetch({ input: searchFilter });
			}
		} catch (err: any) {
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
						<Typography className="main-title">Available Shipments</Typography>
						<Typography className="sub-title">Unassigned shipments waiting for a carrier</Typography>
					</Stack>
				</Stack>
				<Stack className="property-list-box">
					<Stack className="list-box">
						<Stack className="listing-title-box">
							<Typography className="title-text">Shipment</Typography>
							<Typography className="title-text">Date Created</Typography>
							<Typography className="title-text">Status</Typography>
							<Typography className="title-text">Views</Typography>
						</Stack>

						{availableShipments?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No unassigned shipments right now!</p>
							</div>
						) : (
							availableShipments.map((shipment: Shipment) => (
								<ShipmentCard key={shipment._id} shipment={shipment}>
									<Button
										variant={'contained'}
										size={'small'}
										sx={{ ml: '12px' }}
										onClick={() => claimShipmentHandler(shipment._id)}
									>
										Claim
									</Button>
								</ShipmentCard>
							))
						)}

						{total > searchFilter.limit && (
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
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

AvailableShipments.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			statusList: [ShipmentStatus.CREATED],
		},
	},
};

export default AvailableShipments;
