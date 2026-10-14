import { Menu, MenuItem, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import { Shipment } from '../../types/shipment/shipment';
import { formatKRW } from '../../utils';
import { IMAGE_PLACEHOLDER } from '../../config';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { ShipmentStatus } from '../../enums/shipment.enum';

interface ShipmentCardProps {
	shipment: Shipment;
	deleteShipmentHandler?: any;
	memberPage?: boolean;
	updateShipmentHandler?: any;
	/** extra controls rendered at the end of the row (carrier event form) **/
	children?: React.ReactNode;
}

export const ShipmentCard = (props: ShipmentCardProps) => {
	const { shipment, deleteShipmentHandler, memberPage, updateShipmentHandler, children } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	// the shipper can only edit, cancel or delete while the shipment is still CREATED (backend rule)
	const editable = !memberPage && !children && shipment.shipmentStatus === ShipmentStatus.CREATED;

	/** HANDLERS **/
	const pushEditShipment = async (id: string) => {
		await router.push({
			pathname: '/mypage',
			query: { category: 'addShipment', shipmentId: id },
		});
	};

	const pushShipmentDetail = async (id: string) => {
		await router.push({
			pathname: '/shipment/detail',
			query: { id: id },
		});
	};

	const handleClick = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	if (device === 'mobile') {
		return <div>MOBILE SHIPMENT CARD</div>;
	} else
		return (
			<Stack className="property-card-box">
				<Stack className="image-box" onClick={() => pushShipmentDetail(shipment?._id)}>
					<img
						src={
							shipment.shipmentImages?.[0]
								? `${process.env.REACT_APP_API_URL}/${shipment.shipmentImages[0]}`
								: IMAGE_PLACEHOLDER
						}
						alt=""
					/>
				</Stack>
				<Stack className="information-box" onClick={() => pushShipmentDetail(shipment?._id)}>
					<Typography className="name">{shipment.shipmentTitle}</Typography>
					<Typography className="address">
						{shipment.shipmentTrackingCode} · {shipment.shipmentOrigin} → {shipment.shipmentDestination}
					</Typography>
					<Typography className="price">
						<strong>{formatKRW(shipment?.shipmentPrice)}</strong>
					</Typography>
				</Stack>
				<Stack className="date-box">
					<Typography className="date">
						<Moment format="DD MMMM, YYYY">{shipment.createdAt}</Moment>
					</Typography>
				</Stack>
				<Stack className="status-box">
					<Stack className="coloured-box" sx={{ background: '#E5F0FD' }} onClick={handleClick}>
						<Typography className="status" sx={{ color: '#3554d1' }}>
							{shipment.shipmentStatus}
						</Typography>
					</Stack>
				</Stack>
				{editable && (
					<Menu
						anchorEl={anchorEl}
						open={open}
						onClose={handleClose}
						PaperProps={{
							elevation: 0,
							sx: {
								width: '90px',
								mt: 1,
								ml: '10px',
								overflow: 'visible',
								filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
							},
							style: {
								padding: 0,
								display: 'flex',
								justifyContent: 'center',
							},
						}}
					>
						<MenuItem
							disableRipple
							onClick={() => {
								handleClose();
								updateShipmentHandler(ShipmentStatus.CANCELLED, shipment?._id);
							}}
						>
							Cancel
						</MenuItem>
					</Menu>
				)}

				<Stack className="views-box">
					<Typography className="views">{shipment.shipmentViews.toLocaleString()}</Typography>
				</Stack>
				{editable && (
					<Stack className="action-box">
						<IconButton className="icon-button" onClick={() => pushEditShipment(shipment._id)}>
							<ModeIcon className="buttons" />
						</IconButton>
						<IconButton className="icon-button" onClick={() => deleteShipmentHandler(shipment._id)}>
							<DeleteIcon className="buttons" />
						</IconButton>
					</Stack>
				)}
				{children}
			</Stack>
		);
};
