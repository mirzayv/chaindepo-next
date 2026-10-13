import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopShipmentCard from './TopShipmentCard';
import { ShipmentsInquiry } from '../../types/shipment/shipment.input';
import { Shipment } from '../../types/shipment/shipment';
import { useMutation, useQuery } from '@apollo/client';
import { GET_SHIPMENTS } from '../../../apollo/user/query';
import { LIKE_TARGET_SHIPMENT } from '../../../apollo/user/mutation';
import { T } from '../../types/common';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';

interface TopShipmentsProps {
	initialInput: ShipmentsInquiry;
}

const TopShipments = (props: TopShipmentsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [topShipments, setTopShipments] = useState<Shipment[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetShipment] = useMutation(LIKE_TARGET_SHIPMENT);

	const {
		loading: getShipmentsLoading,
		data: getShipmentsData,
		error: getShipmentsError,
		refetch: getShipmentsRefetch,
	} = useQuery(GET_SHIPMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopShipments(data?.getShipments?.list);
		},
	});

	/** HANDLERS **/
	const likeShipmentHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetShipment({
				variables: { input: id },
			});
			await getShipmentsRefetch({ input: initialInput });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeShipmentHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return (
			<Stack className={'top-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Top shipments</span>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'top-property-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={15}
							modules={[Autoplay]}
						>
							{topShipments.map((shipment: Shipment) => {
								return (
									<SwiperSlide className={'top-property-slide'} key={shipment?._id}>
										<TopShipmentCard shipment={shipment} likeShipmentHandler={likeShipmentHandler} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'top-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Top shipments</span>
							<p>Check out our top-ranked shipments</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<WestIcon className={'swiper-top-prev'} />
								<div className={'swiper-top-pagination'}></div>
								<EastIcon className={'swiper-top-next'} />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'top-property-swiper'}
							slidesPerView={'auto'}
							spaceBetween={15}
							modules={[Autoplay, Navigation, Pagination]}
							navigation={{
								nextEl: '.swiper-top-next',
								prevEl: '.swiper-top-prev',
							}}
							pagination={{
								el: '.swiper-top-pagination',
							}}
						>
							{topShipments.map((shipment: Shipment) => {
								return (
									<SwiperSlide className={'top-property-slide'} key={shipment?._id}>
										<TopShipmentCard shipment={shipment} likeShipmentHandler={likeShipmentHandler} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TopShipments.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'shipmentRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopShipments;
