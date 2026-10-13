import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, Box, Modal, Divider, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { shipmentWeights } from '../../config';
import { ShipmentLocation, ShipmentStatus, ShipmentType } from '../../enums/shipment.enum';
import { ShipmentsInquiry } from '../../types/shipment/shipment.input';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	bgcolor: 'background.paper',
	borderRadius: '12px',
	outline: 'none',
	boxShadow: 24,
};

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

interface HeaderFilterProps {
	initialInput: ShipmentsInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t, i18n } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<ShipmentsInquiry>(initialInput);
	const originRef: any = useRef();
	const typeRef: any = useRef();
	const destinationRef: any = useRef();
	const router = useRouter();
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [openOrigin, setOpenOrigin] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [openDestination, setOpenDestination] = useState(false);
	const [shipmentLocations] = useState<ShipmentLocation[]>(Object.values(ShipmentLocation));
	const [shipmentTypes] = useState<ShipmentType[]>(Object.values(ShipmentType));
	const [statusCheck, setStatusCheck] = useState<string>('all');

	/** LIFECYCLES **/
	useEffect(() => {
		const clickHandler = (event: MouseEvent) => {
			if (!originRef?.current?.contains(event.target)) {
				setOpenOrigin(false);
			}

			if (!typeRef?.current?.contains(event.target)) {
				setOpenType(false);
			}

			if (!destinationRef?.current?.contains(event.target)) {
				setOpenDestination(false);
			}
		};

		document.addEventListener('mousedown', clickHandler);

		return () => {
			document.removeEventListener('mousedown', clickHandler);
		};
	}, []);

	/** HANDLERS **/
	const advancedFilterHandler = (status: boolean) => {
		setOpenOrigin(false);
		setOpenDestination(false);
		setOpenType(false);
		setOpenAdvancedFilter(status);
	};

	const originStateChangeHandler = () => {
		setOpenOrigin((prev) => !prev);
		setOpenDestination(false);
		setOpenType(false);
	};

	const typeStateChangeHandler = () => {
		setOpenType((prev) => !prev);
		setOpenOrigin(false);
		setOpenDestination(false);
	};

	const destinationStateChangeHandler = () => {
		setOpenDestination((prev) => !prev);
		setOpenType(false);
		setOpenOrigin(false);
	};

	const disableAllStateHandler = () => {
		setOpenDestination(false);
		setOpenType(false);
		setOpenOrigin(false);
	};

	const shipmentOriginSelectHandler = useCallback(
		async (value: any) => {
			setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, originList: [value] } });
			typeStateChangeHandler();
		},
		[searchFilter],
	);

	const shipmentTypeSelectHandler = useCallback(
		async (value: any) => {
			setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, typeList: [value] } });
			destinationStateChangeHandler();
		},
		[searchFilter],
	);

	const shipmentDestinationSelectHandler = useCallback(
		async (value: any) => {
			setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, destinationList: [value] } });
			disableAllStateHandler();
		},
		[searchFilter],
	);

	const shipmentStatusSelectHandler = useCallback(
		async (e: any) => {
			const value = e.target.value;
			setStatusCheck(value);

			if (value !== 'all') {
				setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, statusList: [value] } });
			} else {
				delete searchFilter.search.statusList;
				setSearchFilter({ ...searchFilter, search: { ...searchFilter.search } });
			}
		},
		[searchFilter],
	);

	const shipmentWeightHandler = useCallback(
		async (e: any, type: 'start' | 'end') => {
			const value = parseInt(e.target.value);
			setSearchFilter({
				...searchFilter,
				search: {
					...searchFilter.search,
					weightsRange: { ...(searchFilter.search.weightsRange as any), [type]: value },
				},
			});
		},
		[searchFilter],
	);

	const resetFilterHandler = () => {
		setSearchFilter(initialInput);
		setStatusCheck('all');
	};

	const pushSearchHandler = async () => {
		try {
			if (searchFilter?.search?.originList?.length == 0) delete searchFilter.search.originList;
			if (searchFilter?.search?.destinationList?.length == 0) delete searchFilter.search.destinationList;
			if (searchFilter?.search?.typeList?.length == 0) delete searchFilter.search.typeList;
			if (searchFilter?.search?.statusList?.length == 0) delete searchFilter.search.statusList;

			await router.push(
				`/shipment?input=${JSON.stringify(searchFilter)}`,
				`/shipment?input=${JSON.stringify(searchFilter)}`,
			);
		} catch (err: any) {
			console.log('ERROR, pushSearchHandler:', err);
		}
	};

	if (device === 'mobile') {
		return <div>HEADER FILTER MOBILE</div>;
	} else {
		return (
			<>
				<Stack className={'search-box'}>
					<Stack className={'select-box'}>
						<Box component={'div'} className={`box ${openOrigin ? 'on' : ''}`} onClick={originStateChangeHandler}>
							<span>{searchFilter?.search?.originList ? searchFilter?.search?.originList[0] : t('Origin')} </span>
							<ExpandMoreIcon />
						</Box>
						<Box className={`box ${openType ? 'on' : ''}`} onClick={typeStateChangeHandler}>
							<span> {searchFilter?.search?.typeList ? searchFilter?.search?.typeList[0] : t('Shipment type')} </span>
							<ExpandMoreIcon />
						</Box>
						<Box className={`box ${openDestination ? 'on' : ''}`} onClick={destinationStateChangeHandler}>
							<span>
								{searchFilter?.search?.destinationList ? searchFilter?.search?.destinationList[0] : t('Destination')}
							</span>
							<ExpandMoreIcon />
						</Box>
					</Stack>
					<Stack className={'search-box-other'}>
						<Box className={'advanced-filter'} onClick={() => advancedFilterHandler(true)}>
							<img src="/img/icons/tune.svg" alt="" />
							<span>{t('Advanced')}</span>
						</Box>
						<Box className={'search-btn'} onClick={pushSearchHandler}>
							<img src="/img/icons/search_white.svg" alt="" />
						</Box>
					</Stack>

					{/*MENU */}
					<div className={`filter-location ${openOrigin ? 'on' : ''}`} ref={originRef}>
						{shipmentLocations.map((location: string) => {
							return (
								<div onClick={() => shipmentOriginSelectHandler(location)} key={location}>
									<img src={`img/banner/cities/${location}.webp`} alt="" />
									<span>{location}</span>
								</div>
							);
						})}
					</div>

					<div className={`filter-type ${openType ? 'on' : ''}`} ref={typeRef}>
						{shipmentTypes.map((type: string) => {
							return (
								<div onClick={() => shipmentTypeSelectHandler(type)} key={type}>
									<span>{type}</span>
								</div>
							);
						})}
					</div>

					<div className={`filter-rooms ${openDestination ? 'on' : ''}`} ref={destinationRef}>
						{shipmentLocations.map((location: string) => {
							return (
								<span onClick={() => shipmentDestinationSelectHandler(location)} key={location}>
									{location}
								</span>
							);
						})}
					</div>
				</Stack>

				{/* ADVANCED FILTER MODAL */}
				<Modal
					open={openAdvancedFilter}
					onClose={() => advancedFilterHandler(false)}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					{/* @ts-ignore */}
					<Box sx={style}>
						<Box className={'advanced-filter-modal'}>
							<div className={'close'} onClick={() => advancedFilterHandler(false)}>
								<CloseIcon />
							</div>
							<div className={'top'}>
								<span>Find shipments</span>
								<div className={'search-input-box'}>
									<img src="/img/icons/search.svg" alt="" />
									<input
										value={searchFilter?.search?.text ?? ''}
										type="text"
										placeholder={'Title or tracking code'}
										onChange={(e: any) => {
											setSearchFilter({
												...searchFilter,
												search: { ...searchFilter.search, text: e.target.value },
											});
										}}
									/>
								</div>
							</div>
							<Divider sx={{ mt: '30px', mb: '35px' }} />
							<div className={'middle'}>
								<div className={'row-box'}>
									<div className={'box'}>
										<span>status</span>
										<div className={'inside'}>
											<FormControl>
												<Select
													value={statusCheck}
													onChange={shipmentStatusSelectHandler}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
												>
													<MenuItem value={'all'}>All Statuses</MenuItem>
													{Object.values(ShipmentStatus)
														.filter((status) => status !== ShipmentStatus.DELETE)
														.map((status: string) => (
															<MenuItem value={status} key={status}>
																{status}
															</MenuItem>
														))}
												</Select>
											</FormControl>
										</div>
									</div>
									<div className={'box'}>
										<span>weight (kg)</span>
										<div className={'inside space-between align-center'}>
											<FormControl sx={{ width: '122px' }}>
												<Select
													value={searchFilter?.search?.weightsRange?.start}
													onChange={(e: any) => shipmentWeightHandler(e, 'start')}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
													MenuProps={MenuProps}
												>
													{shipmentWeights.map((weight: number) => (
														<MenuItem
															value={weight}
															disabled={(searchFilter?.search?.weightsRange?.end || 0) < weight}
															key={weight}
														>
															{weight}
														</MenuItem>
													))}
												</Select>
											</FormControl>
											<div className={'minus-line'}></div>
											<FormControl sx={{ width: '122px' }}>
												<Select
													value={searchFilter?.search?.weightsRange?.end}
													onChange={(e: any) => shipmentWeightHandler(e, 'end')}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
													MenuProps={MenuProps}
												>
													{shipmentWeights.map((weight: number) => (
														<MenuItem
															value={weight}
															disabled={(searchFilter?.search?.weightsRange?.start || 0) > weight}
															key={weight}
														>
															{weight}
														</MenuItem>
													))}
												</Select>
											</FormControl>
										</div>
									</div>
								</div>
							</div>
							<Divider sx={{ mt: '60px', mb: '18px' }} />
							<div className={'bottom'}>
								<div onClick={resetFilterHandler}>
									<img src="/img/icons/reset.svg" alt="" />
									<span>Reset all filters</span>
								</div>
								<Button
									startIcon={<img src={'/img/icons/search.svg'} />}
									className={'search-btn'}
									onClick={pushSearchHandler}
								>
									Search
								</Button>
							</div>
						</Box>
					</Box>
				</Modal>
			</>
		);
	}
};

HeaderFilter.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			weightsRange: {
				start: 0,
				end: 5000,
			},
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default HeaderFilter;
