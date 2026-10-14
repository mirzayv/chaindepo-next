import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Shipment } from '../../types/shipment/shipment';
import Link from 'next/link';
import { formatKRW } from '../../utils';
import { IMAGE_PLACEHOLDER, REACT_APP_API_URL, topShipmentRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface ShipmentCardType {
	shipment: Shipment;
	likeShipmentHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const ShipmentCard = (props: ShipmentCardType) => {
	const { shipment, likeShipmentHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const imagePath: string = shipment?.shipmentImages[0]
		? `${REACT_APP_API_URL}/${shipment?.shipmentImages[0]}`
		: IMAGE_PLACEHOLDER;

	if (device === 'mobile') {
		return <div>SHIPMENT CARD</div>;
	} else {
		return (
			<Stack className="card-config">
				<Stack className="top">
					<Link
						href={{
							pathname: '/shipment/detail',
							query: { id: shipment?._id },
						}}
					>
						<img src={imagePath} alt="" />
					</Link>
					{shipment && shipment?.shipmentRank >= topShipmentRank && (
						<Box component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>TOP</Typography>
						</Box>
					)}
					<Box component={'div'} className={'price-box'}>
						<Typography>{formatKRW(shipment?.shipmentPrice)}</Typography>
					</Box>
				</Stack>
				<Stack className="bottom">
					<Stack className="name-address">
						<Stack className="name">
							<Link
								href={{
									pathname: '/shipment/detail',
									query: { id: shipment?._id },
								}}
							>
								<Typography>{shipment.shipmentTitle}</Typography>
							</Link>
						</Stack>
						<Stack className="address">
							<Typography>{shipment.shipmentTrackingCode}</Typography>
						</Stack>
					</Stack>
					<Stack className="options">
						<Stack className="option">
							<img src="/img/icons/room.svg" alt="" />{' '}
							<Typography>
								{shipment.shipmentOrigin} → {shipment.shipmentDestination}
							</Typography>
						</Stack>
						<Stack className="option">
							<img src="/img/icons/expand.svg" alt="" /> <Typography>{shipment.shipmentWeight} kg</Typography>
						</Stack>
					</Stack>
					<Stack className="divider"></Stack>
					<Stack className="type-buttons">
						<Stack className="type">
							<Typography sx={{ fontWeight: 500, fontSize: '13px' }}>{shipment.shipmentStatus}</Typography>
							<Typography sx={{ fontWeight: 500, fontSize: '13px' }} className={'disabled-type'}>
								{shipment.shipmentType}
							</Typography>
						</Stack>
						{!recentlyVisited && (
							<Stack className="buttons">
								<IconButton color={'default'}>
									<RemoveRedEyeIcon />
								</IconButton>
								<Typography className="view-cnt">{shipment?.shipmentViews}</Typography>
								<IconButton color={'default'} onClick={() => likeShipmentHandler(user, shipment?._id)}>
									{myFavorites ? (
										<FavoriteIcon color="primary" />
									) : shipment?.meLiked && shipment?.meLiked[0]?.myFavorite ? (
										<FavoriteIcon color="primary" />
									) : (
										<FavoriteBorderIcon />
									)}
								</IconButton>
								<Typography className="view-cnt">{shipment?.shipmentLikes}</Typography>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default ShipmentCard;
