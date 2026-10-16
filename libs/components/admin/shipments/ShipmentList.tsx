import React from 'react';
import Link from 'next/link';
import {
	TableCell,
	TableHead,
	TableBody,
	TableRow,
	Table,
	TableContainer,
	Button,
	Menu,
	Fade,
	MenuItem,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { Stack } from '@mui/material';
import { Shipment } from '../../../types/shipment/shipment';
import { IMAGE_PLACEHOLDER, REACT_APP_API_URL } from '../../../config';
import { formatKRW, labelOf } from '../../../utils';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import { ShipmentStatus } from '../../../enums/shipment.enum';

interface Data {
	code: string;
	title: string;
	price: string;
	shipper: string;
	route: string;
	type: string;
	status: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'code',
		numeric: true,
		disablePadding: false,
		label: 'TRACKING CODE',
	},
	{
		id: 'title',
		numeric: true,
		disablePadding: false,
		label: 'TITLE',
	},
	{
		id: 'price',
		numeric: false,
		disablePadding: false,
		label: 'PRICE',
	},
	{
		id: 'shipper',
		numeric: false,
		disablePadding: false,
		label: 'SHIPPER',
	},
	{
		id: 'route',
		numeric: false,
		disablePadding: false,
		label: 'ROUTE',
	},
	{
		id: 'type',
		numeric: false,
		disablePadding: false,
		label: 'TYPE',
	},
	{
		id: 'status',
		numeric: false,
		disablePadding: false,
		label: 'STATUS',
	},
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'left' : 'center'}
						padding={headCell.disablePadding ? 'none' : 'normal'}
					>
						{headCell.label}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface ShipmentPanelListType {
	shipments: Shipment[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updateShipmentHandler: any;
	removeShipmentHandler: any;
}

export const ShipmentPanelList = (props: ShipmentPanelListType) => {
	const {
		shipments,
		anchorEl,
		menuIconClickHandler,
		menuIconCloseHandler,
		updateShipmentHandler,
		removeShipmentHandler,
	} = props;

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					{/*@ts-ignore*/}
					<EnhancedTableHead />
					<TableBody>
						{shipments.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={8}>
									<span className={'no-data'}>data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{shipments.length !== 0 &&
							shipments.map((shipment: Shipment, index: number) => {
								const shipmentImage = shipment?.shipmentImages?.[0]
									? `${REACT_APP_API_URL}/${shipment.shipmentImages[0]}`
									: IMAGE_PLACEHOLDER;

								return (
									<TableRow hover key={shipment?._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
										<TableCell align="left">{shipment.shipmentTrackingCode}</TableCell>
										<TableCell align="left" className={'name'}>
											{shipment.shipmentStatus !== ShipmentStatus.DELETE ? (
												<Stack direction={'row'}>
													<Link href={`/shipment/detail?id=${shipment?._id}`}>
														<div>
															<Avatar alt="shipment" src={shipmentImage} sx={{ ml: '2px', mr: '10px' }} />
														</div>
													</Link>
													<Link href={`/shipment/detail?id=${shipment?._id}`}>
														<div>{shipment.shipmentTitle}</div>
													</Link>
												</Stack>
											) : (
												<Stack direction={'row'}>
													<div>
														<Avatar alt="shipment" src={shipmentImage} sx={{ ml: '2px', mr: '10px' }} />
													</div>

													<div style={{ marginTop: '10px' }}>{shipment.shipmentTitle}</div>
												</Stack>
											)}
										</TableCell>
										<TableCell align="center">{formatKRW(shipment.shipmentPrice)}</TableCell>
										<TableCell align="center">{shipment.memberData?.memberNick}</TableCell>
										<TableCell align="center">
											{labelOf(shipment.shipmentOrigin)} → {labelOf(shipment.shipmentDestination)}
										</TableCell>
										<TableCell align="center">{labelOf(shipment.shipmentType)}</TableCell>
										<TableCell align="center">
											{shipment.shipmentStatus === ShipmentStatus.DELETE ? (
												<Button
													variant="outlined"
													sx={{ p: '3px', border: 'none', ':hover': { border: '1px solid #000000' } }}
													onClick={() => removeShipmentHandler(shipment._id)}
												>
													<DeleteIcon fontSize="small" />
												</Button>
											) : (
												<>
													<Button onClick={(e: any) => menuIconClickHandler(e, index)} className={'badge success'}>
														{labelOf(shipment.shipmentStatus)}
													</Button>

													{/* backend: updateShipmentByAdmin only accepts DELETE (soft delete);
													    lifecycle statuses go through the tracking-event hash chain */}
													<Menu
														className={'menu-modal'}
														MenuListProps={{
															'aria-labelledby': 'fade-button',
														}}
														anchorEl={anchorEl[index]}
														open={Boolean(anchorEl[index])}
														onClose={menuIconCloseHandler}
														TransitionComponent={Fade}
														sx={{ p: 1 }}
													>
														<MenuItem
															onClick={() =>
																updateShipmentHandler({ _id: shipment._id, shipmentStatus: ShipmentStatus.DELETE })
															}
														>
															<Typography variant={'subtitle1'} component={'span'}>
																Delete
															</Typography>
														</MenuItem>
													</Menu>
												</>
											)}
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
