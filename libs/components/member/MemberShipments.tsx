import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ShipmentCard } from '../mypage/ShipmentCard';
import { Shipment } from '../../types/shipment/shipment';
import { ShipmentsInquiry } from '../../types/shipment/shipment.input';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { GET_SHIPMENTS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';

const MemberShipments: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<ShipmentsInquiry>({ ...initialInput });
	const [memberShipments, setMemberShipments] = useState<Shipment[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/

	const {
		loading: getShipmentsLoading,
		data: getShipmentsData,
		error: getShipmentsError,
		refetch: getShipmentsRefetch,
	} = useQuery(GET_SHIPMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter?.search?.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberShipments(data?.getShipments?.list);
			setTotal(data?.getShipments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (searchFilter?.search?.memberId) getShipmentsRefetch({ input: searchFilter }).then();
	}, [searchFilter]);

	useEffect(() => {
		if (memberId)
			setSearchFilter({ ...initialInput, search: { ...initialInput.search, memberId: memberId as string } });
	}, [memberId]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	if (device === 'mobile') {
		return <div>MEMBER SHIPMENTS MOBILE</div>;
	} else {
		return (
			<div id="member-properties-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Shipments</Typography>
					</Stack>
				</Stack>
				<Stack className="properties-list-box">
					<Stack className="list-box">
						{memberShipments?.length > 0 && (
							<Stack className="listing-title-box">
								<Typography className="title-text">Shipment</Typography>
								<Typography className="title-text">Date Created</Typography>
								<Typography className="title-text">Status</Typography>
								<Typography className="title-text">View</Typography>
							</Stack>
						)}
						{memberShipments?.length === 0 && (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Shipment found!</p>
							</div>
						)}
						{memberShipments?.map((shipment: Shipment) => {
							return <ShipmentCard shipment={shipment} memberPage={true} key={shipment?._id} />;
						})}

						{memberShipments.length !== 0 && (
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

MemberShipments.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			memberId: '',
		},
	},
};

export default MemberShipments;
