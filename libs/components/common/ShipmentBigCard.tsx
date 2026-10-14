import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Shipment } from '../../types/shipment/shipment';
import { IMAGE_PLACEHOLDER, REACT_APP_API_URL } from '../../config';
import { formatKRW } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface ShipmentBigCardProps {
	shipment: Shipment;
	likeShipmentHandler?: any;
}

const ShipmentBigCard = (props: ShipmentBigCardProps) => {
	const { shipment, likeShipmentHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** HANDLERS **/
	const goShipmentDetailPage = (shipmentId: string) => {
		router.push(`/shipment/detail?id=${shipmentId}`);
	};

	if (device === 'mobile') {
		return <div>SHIPMENT BIG CARD</div>;
	} else {
		return (
			<Stack className="property-big-card-box" onClick={() => goShipmentDetailPage(shipment?._id)}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{
						backgroundImage: `url(${
							shipment?.shipmentImages?.[0] ? `${REACT_APP_API_URL}/${shipment.shipmentImages[0]}` : IMAGE_PLACEHOLDER
						})`,
					}}
				>
					{shipment?.shipmentRank && shipment?.shipmentRank >= 50 && (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>top</span>
						</div>
					)}

					<div className={'price'}>{formatKRW(shipment?.shipmentPrice)}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'}>{shipment?.shipmentTitle}</strong>
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
						<div>
							<p>{shipment?.shipmentStatus}</p>
							<span>{shipment?.shipmentType}</span>
						</div>
						<div className="buttons-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{shipment?.shipmentViews}</Typography>
							<IconButton
								color={'default'}
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
									e.stopPropagation();
									likeShipmentHandler?.(user, shipment?._id);
								}}
							>
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
	}
};

export default ShipmentBigCard;
