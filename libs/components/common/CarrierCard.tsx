import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';

interface CarrierCardProps {
	carrier: Member;
	likeMemberHandler?: any;
}

const CarrierCard = (props: CarrierCardProps) => {
	const { carrier, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = carrier?.memberImage
		? `${REACT_APP_API_URL}/${carrier?.memberImage}`
		: '/img/profile/defaultUser.svg';

	if (device === 'mobile') {
		return <div>CARRIER CARD</div>;
	} else {
		return (
			<Stack className="agent-general-card">
				<Link
					href={{
						pathname: '/carrier/detail',
						query: { carrierId: carrier?._id },
					}}
				>
					<Box
						component={'div'}
						className={'agent-img'}
						style={{
							backgroundImage: `url(${imagePath})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
						}}
					>
						<div>rank {carrier?.memberRank ?? 0}</div>
					</Box>
				</Link>

				<Stack className={'agent-desc'}>
					<Box component={'div'} className={'agent-info'}>
						<Link
							href={{
								pathname: '/carrier/detail',
								query: { carrierId: carrier?._id },
							}}
						>
							<strong>{carrier?.memberFullName ?? carrier?.memberNick}</strong>
						</Link>
						<span>Carrier</span>
					</Box>
					<Box component={'div'} className={'buttons'}>
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{carrier?.memberViews}</Typography>
						<IconButton color={'default'} onClick={() => likeMemberHandler?.(user, carrier?._id)}>
							{carrier?.meLiked && carrier?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon color={'primary'} />
							) : (
								<FavoriteBorderIcon />
							)}
						</IconButton>
						<Typography className="view-cnt">{carrier?.memberLikes}</Typography>
					</Box>
				</Stack>
			</Stack>
		);
	}
};

export default CarrierCard;
