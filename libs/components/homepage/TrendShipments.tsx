import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import { Shipment } from '../../types/shipment/shipment';
import { ShipmentsInquiry } from '../../types/shipment/shipment.input';
import TrendShipmentCard from './TrendShipmentCard';
import { useMutation, useQuery } from '@apollo/client';
import { GET_SHIPMENTS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_SHIPMENT } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';

interface TrendShipmentsProps {
	initialInput: ShipmentsInquiry;
}

const TrendShipments = (props: TrendShipmentsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [trendShipments, setTrendShipments] = useState<Shipment[]>([]);

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
			setTrendShipments(data?.getShipments?.list);
		},
	});

	/** HANDLERS **/
	const likeShipmentHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

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

	if (!trendShipments) return null;

	if (device === 'mobile') {
		return (
			<Stack className={'trend-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Trend Shipments</span>
					</Stack>
					<Stack className={'card-box'}>
						{trendShipments.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								Trends Empty
							</Box>
						) : (
							<Swiper
								className={'trend-property-swiper'}
								slidesPerView={'auto'}
								centeredSlides={true}
								spaceBetween={15}
								modules={[Autoplay]}
							>
								{trendShipments.map((shipment: Shipment) => {
									return (
										<SwiperSlide key={shipment._id} className={'trend-property-slide'}>
											<TrendShipmentCard shipment={shipment} likeShipmentHandler={likeShipmentHandler} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'trend-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Trend Shipments</span>
							<p>Trend is based on likes</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<WestIcon className={'swiper-trend-prev'} />
								<div className={'swiper-trend-pagination'}></div>
								<EastIcon className={'swiper-trend-next'} />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						{trendShipments.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								Trends Empty
							</Box>
						) : (
							<Swiper
								className={'trend-property-swiper'}
								slidesPerView={'auto'}
								spaceBetween={15}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-trend-next',
									prevEl: '.swiper-trend-prev',
								}}
								pagination={{
									el: '.swiper-trend-pagination',
								}}
							>
								{trendShipments.map((shipment: Shipment) => {
									return (
										<SwiperSlide key={shipment._id} className={'trend-property-slide'}>
											<TrendShipmentCard shipment={shipment} likeShipmentHandler={likeShipmentHandler} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TrendShipments.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'shipmentLikes',
		direction: 'DESC',
		search: {},
	},
};

export default TrendShipments;
