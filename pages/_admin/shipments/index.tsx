import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, List, ListItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import { ShipmentPanelList } from '../../../libs/components/admin/shipments/ShipmentList';
import { AllShipmentsInquiry } from '../../../libs/types/shipment/shipment.input';
import { Shipment } from '../../../libs/types/shipment/shipment';
import { ShipmentLocation, ShipmentStatus } from '../../../libs/enums/shipment.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { ShipmentUpdate } from '../../../libs/types/shipment/shipment.update';
import { useMutation, useQuery } from '@apollo/client';
import { REMOVE_SHIPMENT_BY_ADMIN, UPDATE_SHIPMENT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_ALL_SHIPMENTS_BY_ADMIN } from '../../../apollo/admin/query';
import { T } from '../../../libs/types/common';

const AdminShipments: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [shipmentsInquiry, setShipmentsInquiry] = useState<AllShipmentsInquiry>(initialInquiry);
	const [shipments, setShipments] = useState<Shipment[]>([]);
	const [shipmentsTotal, setShipmentsTotal] = useState<number>(0);
	const [value, setValue] = useState<string>(
		shipmentsInquiry?.search?.shipmentStatus ? shipmentsInquiry?.search?.shipmentStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/
	const [updateShipmentByAdmin] = useMutation(UPDATE_SHIPMENT_BY_ADMIN);
	const [removeShipmentByAdmin] = useMutation(REMOVE_SHIPMENT_BY_ADMIN);

	const {
		loading: getAllShipmentsByAdminLoading,
		data: getAllShipmentsByAdminData,
		error: getAllShipmentsByAdminError,
		refetch: getAllShipmentsByAdminRefetch,
	} = useQuery(GET_ALL_SHIPMENTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: shipmentsInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setShipments(data?.getAllShipmentsByAdmin?.list);
			setShipmentsTotal(data?.getAllShipmentsByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		getAllShipmentsByAdminRefetch({ input: shipmentsInquiry }).then();
	}, [shipmentsInquiry]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		shipmentsInquiry.page = newPage + 1;
		await getAllShipmentsByAdminRefetch({ input: shipmentsInquiry });
		setShipmentsInquiry({ ...shipmentsInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		shipmentsInquiry.limit = parseInt(event.target.value, 10);
		shipmentsInquiry.page = 1;
		await getAllShipmentsByAdminRefetch({ input: shipmentsInquiry });
		setShipmentsInquiry({ ...shipmentsInquiry });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);

		if (newValue === 'ALL') {
			delete shipmentsInquiry?.search?.shipmentStatus;
			setShipmentsInquiry({ ...shipmentsInquiry, page: 1, sort: 'createdAt' });
		} else {
			setShipmentsInquiry({
				...shipmentsInquiry,
				page: 1,
				sort: 'createdAt',
				search: { ...shipmentsInquiry.search, shipmentStatus: newValue as ShipmentStatus },
			});
		}
	};

	const removeShipmentHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to remove?')) {
				await removeShipmentByAdmin({
					variables: {
						input: id,
					},
				});
				await getAllShipmentsByAdminRefetch({ input: shipmentsInquiry });
			}
			menuIconCloseHandler();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setShipmentsInquiry({
					...shipmentsInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...shipmentsInquiry.search,
						shipmentOriginList: [newValue as ShipmentLocation],
					},
				});
			} else {
				delete shipmentsInquiry?.search?.shipmentOriginList;
				setShipmentsInquiry({ ...shipmentsInquiry });
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const updateShipmentHandler = async (updateData: ShipmentUpdate) => {
		try {
			await updateShipmentByAdmin({
				variables: {
					input: updateData,
				},
			});
			menuIconCloseHandler();
			await getAllShipmentsByAdminRefetch({ input: shipmentsInquiry });
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '24px' }}>
				Shipment List
			</Typography>
			<Box component={'div'} className={'table-wrap'}>
				<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
					<TabContext value={value}>
						<Box component={'div'}>
							<List className={'tab-menu'}>
								{['ALL', ...Object.values(ShipmentStatus)].map((status: string) => (
									<ListItem
										key={status}
										onClick={(e: any) => tabChangeHandler(e, status)}
										value={status}
										className={value === status ? 'li on' : 'li'}
									>
										{status === 'ALL' ? 'All' : status}
									</ListItem>
								))}
							</List>
							<Divider />
							<Stack className={'search-area'} sx={{ m: '24px' }}>
								<Select sx={{ width: '160px', mr: '20px' }} value={searchType}>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										ALL ORIGINS
									</MenuItem>
									{Object.values(ShipmentLocation).map((location: string) => (
										<MenuItem value={location} onClick={() => searchTypeHandler(location)} key={location}>
											{location}
										</MenuItem>
									))}
								</Select>
							</Stack>
							<Divider />
						</Box>
						<ShipmentPanelList
							shipments={shipments}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updateShipmentHandler={updateShipmentHandler}
							removeShipmentHandler={removeShipmentHandler}
						/>

						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={shipmentsTotal}
							rowsPerPage={shipmentsInquiry?.limit}
							page={shipmentsInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
						/>
					</TabContext>
				</Box>
			</Box>
		</Box>
	);
};

AdminShipments.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminShipments);
