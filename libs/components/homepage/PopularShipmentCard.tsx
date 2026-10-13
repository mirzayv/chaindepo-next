import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { Shipment } from '../../types/shipment/shipment';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';

interface PopularShipmentCardProps {
	shipment: Shipment;
}

const PopularShipmentCard = (props: PopularShipmentCardProps) => {
	const { shipment } = props;
	const router = useRouter();

	/** HANDLERS **/
	const pushDetailHandler = async (shipmentId: string) => {
		await router.push({ pathname: '/shipment/detail', query: { id: shipmentId } });
	};

	return (
		<Stack className="popular-card-box">
			<Box
				component={'div'}
				className={'card-img'}
				style={{ backgroundImage: `url(${REACT_APP_API_URL}/${shipment?.shipmentImages[0]})` }}
				onClick={() => {
					pushDetailHandler(shipment._id);
				}}
			>
				{shipment?.shipmentRank && shipment?.shipmentRank >= 50 ? (
					<div className={'status'}>
						<img src="/img/icons/electricity.svg" alt="" />
						<span>top</span>
					</div>
				) : (
					''
				)}

				<div className={'price'}>${shipment.shipmentPrice}</div>
			</Box>
			<Box component={'div'} className={'info'}>
				<strong
					className={'title'}
					onClick={() => {
						pushDetailHandler(shipment._id);
					}}
				>
					{shipment.shipmentTitle}
				</strong>
				<p className={'desc'}>{shipment.shipmentTrackingCode}</p>
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
					<p>{shipment?.shipmentStatus}</p>
					<div className="view-like-box">
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{shipment?.shipmentViews}</Typography>
					</div>
				</div>
			</Box>
		</Stack>
	);
};

export default PopularShipmentCard;
