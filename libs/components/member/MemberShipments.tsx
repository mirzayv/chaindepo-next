import React, { useEffect, useState } from 'react';
import { Pagination, Stack, Typography } from '@mui/material';
import { ShipmentCard } from '../mypage/ShipmentCard';
import { Shipment } from '../../types/shipment/shipment';
import { ShipmentsInquiry } from '../../types/shipment/shipment.input';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { GET_SHIPMENTS } from '../../../apollo/user/query';
import { useQuery } from '@apollo/client';

interface MemberShipmentsProps {
	/** true: shipments this carrier carries (search.carrierId); false: shipments this shipper created (search.memberId) */
	byCarrier?: boolean;
}

const initialInput: ShipmentsInquiry = {
	page: 1,
	limit: 5,
	sort: 'createdAt',
	search: {},
};

const MemberShipments = ({ byCarrier = false }: MemberShipmentsProps) => {
	const router = useRouter();
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<ShipmentsInquiry>({ ...initialInput });
	const [memberShipments, setMemberShipments] = useState<Shipment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const searchKey = byCarrier ? 'carrierId' : 'memberId';

	/** APOLLO REQUESTS **/
	const { refetch: getShipmentsRefetch } = useQuery(GET_SHIPMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter?.search?.[searchKey],
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberShipments(data?.getShipments?.list ?? []);
			setTotal(data?.getShipments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (searchFilter?.search?.[searchKey]) getShipmentsRefetch({ input: searchFilter }).then();
	}, [searchFilter]);

	useEffect(() => {
		if (memberId) setSearchFilter({ ...initialInput, search: { [searchKey]: memberId as string } });
	}, [memberId, searchKey]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	// same layout at every width; scss/pc/responsive.scss stacks it below 768px
	{
		return (
			<div id="member-properties-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">{byCarrier ? 'Carried shipments' : 'Shipments'}</Typography>
					</Stack>
				</Stack>
				<Stack className="properties-list-box">
					<Stack className="list-box">
						{memberShipments?.length > 0 && (
							<Stack className="listing-title-box">
								<Typography className="title-text">Shipment</Typography>
								<Typography className="title-text">Date Created</Typography>
								<Typography className="title-text">Status</Typography>
								<Typography className="title-text">Views</Typography>
							</Stack>
						)}
						{memberShipments?.length === 0 && (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No shipments yet</p>
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

export default MemberShipments;
