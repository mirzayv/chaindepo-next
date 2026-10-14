import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Shipment } from '../../types/shipment/shipment';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { IMAGE_PLACEHOLDER, REACT_APP_API_URL } from '../../config';
import { formatKRW } from '../../utils';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface TopShipmentCardProps {
	shipment: Shipment;
	likeShipmentHandler: any;
}

const TopShipmentCard = (props: TopShipmentCardProps) => {
	const { shipment, likeShipmentHandler } = props;
	const router = useRouter();
	const user = useReactiveVar(userVar);

	/** HANDLERS **/
	const pushDetailHandler = async (shipmentId: string) => {
		await router.push({ pathname: '/shipment/detail', query: { id: shipmentId } });
	};

	return (
		<Stack className="top-card-box">
			<Box
				component={'div'}
				className={'card-img'}
				style={{
					backgroundImage: `url(${
						shipment?.shipmentImages?.[0] ? `${REACT_APP_API_URL}/${shipment.shipmentImages[0]}` : IMAGE_PLACEHOLDER
					})`,
				}}
				onClick={() => {
					pushDetailHandler(shipment._id);
				}}
			>
				<div>{formatKRW(shipment?.shipmentPrice)}</div>
			</Box>
			<Box component={'div'} className={'info'}>
				<strong
					className={'title'}
					onClick={() => {
						pushDetailHandler(shipment._id);
					}}
				>
					{shipment?.shipmentTitle}
				</strong>
				<p className={'desc'}>{shipment?.shipmentTrackingCode}</p>
				<div className={'options'}>
					<div>
						<img src="/img/icons/room.svg" alt="" />
						<span>
							{shipment?.shipmentOrigin} → {shipment?.shipmentDestination}
						</span>
					</div>
					<div>
						<img src="/img/icons/expand.svg" alt="" />
						<span>{shipment?.shipmentWeight} kg</span>
					</div>
				</div>
				<Divider sx={{ mt: '15px', mb: '17px' }} />
				<div className={'bott'}>
					<p>
						{shipment?.shipmentStatus} / {shipment?.shipmentType}
					</p>
					<div className="view-like-box">
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{shipment?.shipmentViews}</Typography>
						<IconButton color={'default'} onClick={() => likeShipmentHandler(user, shipment?._id)}>
							{shipment?.meLiked && shipment?.meLiked[0]?.myFavorite ? (
								<FavoriteIcon style={{ color: 'red' }} />
							) : (
								<FavoriteIcon />
							)}
						</IconButton>
						<Typography className="view-cnt">{shipment?.shipmentLikes}</Typography>
					</div>
				</div>
			</Box>
		</Stack>
	);
};

export default TopShipmentCard;
