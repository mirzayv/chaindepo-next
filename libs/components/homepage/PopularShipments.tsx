import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import PopularShipmentCard from './PopularShipmentCard';
import { Shipment } from '../../types/shipment/shipment';
import Link from 'next/link';
import { ShipmentsInquiry } from '../../types/shipment/shipment.input';
import { useQuery } from '@apollo/client';
import { T } from '../../types/common';
import { GET_SHIPMENTS } from '../../../apollo/user/query';

interface PopularShipmentsProps {
	initialInput: ShipmentsInquiry;
}

const PopularShipments = (props: PopularShipmentsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [popularShipments, setPopularShipments] = useState<Shipment[]>([]);

	/** APOLLO REQUESTS **/
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
			setPopularShipments(data?.getShipments?.list);
		},
	});

	/** HANDLERS **/

	if (!popularShipments) return null;

	if (device === 'mobile') {
		return (
			<Stack className={'popular-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Popular shipments</span>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'popular-property-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={25}
							modules={[Autoplay]}
						>
							{popularShipments.map((shipment: Shipment) => {
								return (
									<SwiperSlide key={shipment._id} className={'popular-property-slide'}>
										<PopularShipmentCard shipment={shipment} />
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
			<Stack className={'popular-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Popular shipments</span>
							<p>Popularity is based on views</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'more-box'}>
								<Link href={'/shipment'}>
									<span>See All Shipments</span>
								</Link>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'popular-property-swiper'}
							slidesPerView={'auto'}
							spaceBetween={25}
							modules={[Autoplay, Navigation, Pagination]}
							navigation={{
								nextEl: '.swiper-popular-next',
								prevEl: '.swiper-popular-prev',
							}}
							pagination={{
								el: '.swiper-popular-pagination',
							}}
						>
							{popularShipments.map((shipment: Shipment) => {
								return (
									<SwiperSlide key={shipment._id} className={'popular-property-slide'}>
										<PopularShipmentCard shipment={shipment} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
					<Stack className={'pagination-box'}>
						<WestIcon className={'swiper-popular-prev'} />
						<div className={'swiper-popular-pagination'}></div>
						<EastIcon className={'swiper-popular-next'} />
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

PopularShipments.defaultProps = {
	initialInput: {
		page: 1,
		limit: 7,
		sort: 'shipmentViews',
		direction: 'DESC',
		search: {},
	},
};

export default PopularShipments;
