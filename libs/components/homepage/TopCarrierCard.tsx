import React from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';

interface TopCarrierProps {
	carrier: Member;
}
const TopCarrierCard = (props: TopCarrierProps) => {
	const { carrier } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const carrierImage = carrier?.memberImage
		? `${process.env.REACT_APP_API_URL}/${carrier?.memberImage}`
		: '/img/profile/defaultUser.svg';

	/** HANDLERS **/
	const goCarrierDetailPage = () => {
		router.push(`/carrier/detail?carrierId=${carrier?._id}`);
	};

	if (device === 'mobile') {
		return (
			<Stack className="top-agent-card" onClick={goCarrierDetailPage}>
				<img src={carrierImage} alt="" />

				<strong>{carrier?.memberNick}</strong>
				<span>{carrier?.memberType}</span>
			</Stack>
		);
	} else {
		return (
			<Stack className="top-agent-card" onClick={goCarrierDetailPage}>
				<img src={carrierImage} alt="" />

				<strong>{carrier?.memberNick}</strong>
				<span>{carrier?.memberType}</span>
			</Stack>
		);
	}
};

export default TopCarrierCard;
