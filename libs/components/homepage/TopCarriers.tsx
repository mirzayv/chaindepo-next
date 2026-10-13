import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopCarrierCard from './TopCarrierCard';
import { Member } from '../../types/member/member';
import { CarriersInquiry } from '../../types/member/member.input';
import { useQuery } from '@apollo/client';
import { GET_CARRIERS } from '../../../apollo/user/query';
import { T } from '../../types/common';

interface TopCarriersProps {
	initialInput: CarriersInquiry;
}

const TopCarriers = (props: TopCarriersProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [topCarriers, setTopCarriers] = useState<Member[]>([]);

	/** APOLLO REQUESTS **/
	const {
		loading: getCarriersLoading,
		data: getCarriersData,
		error: getCarriersError,
		refetch: getCarriersRefetch,
	} = useQuery(GET_CARRIERS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setTopCarriers(data?.getCarriers?.list);
		},
	});

	/** HANDLERS **/

	if (device === 'mobile') {
		return (
			<Stack className={'top-agents'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Top Carriers</span>
					</Stack>
					<Stack className={'wrapper'}>
						<Swiper
							className={'top-agents-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={29}
							modules={[Autoplay]}
						>
							{topCarriers.map((carrier: Member) => {
								return (
									<SwiperSlide className={'top-agents-slide'} key={carrier?._id}>
										<TopCarrierCard carrier={carrier} key={carrier?.memberNick} />
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
			<Stack className={'top-agents'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Top Carriers</span>
							<p>Our top carriers are always ready to move your cargo</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'more-box'} onClick={() => router.push('/carrier')}>
								<span>See All Carriers</span>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Box>
					</Stack>
					<Stack className={'wrapper'}>
						<Box component={'div'} className={'switch-btn swiper-agents-prev'}>
							<ArrowBackIosNewIcon />
						</Box>
						<Box component={'div'} className={'card-wrapper'}>
							<Swiper
								className={'top-agents-swiper'}
								slidesPerView={'auto'}
								spaceBetween={29}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-agents-next',
									prevEl: '.swiper-agents-prev',
								}}
							>
								{topCarriers.map((carrier: Member) => {
									return (
										<SwiperSlide className={'top-agents-slide'} key={carrier?._id}>
											<TopCarrierCard carrier={carrier} key={carrier?.memberNick} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						</Box>
						<Box component={'div'} className={'switch-btn swiper-agents-next'}>
							<ArrowBackIosNewIcon />
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TopCarriers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopCarriers;
