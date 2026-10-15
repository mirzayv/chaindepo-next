import React, { useCallback, useEffect, useState } from 'react';
import {
	Stack,
	Typography,
	Checkbox,
	OutlinedInput,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Tooltip,
	IconButton,
} from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ShipmentLocation, ShipmentStatus, ShipmentType } from '../../enums/shipment.enum';
import { ShipmentsInquiry } from '../../types/shipment/shipment.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { shipmentWeights } from '../../config';
import RefreshIcon from '@mui/icons-material/Refresh';

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

/** statuses a visitor can filter by (DELETE is never listed publicly) **/
const filterStatuses = Object.values(ShipmentStatus).filter((status) => status !== ShipmentStatus.DELETE);

type ListKey = 'originList' | 'destinationList' | 'typeList' | 'statusList';

interface FilterType {
	searchFilter: ShipmentsInquiry;
	setSearchFilter: any;
	initialInput: ShipmentsInquiry;
}

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [shipmentLocations] = useState<ShipmentLocation[]>(Object.values(ShipmentLocation));
	const [shipmentTypes] = useState<ShipmentType[]>(Object.values(ShipmentType));
	const [searchText, setSearchText] = useState<string>('');
	const [trackingCode, setTrackingCode] = useState<string>('');
	const [showMoreOrigin, setShowMoreOrigin] = useState<boolean>(false);
	const [showMoreDestination, setShowMoreDestination] = useState<boolean>(false);

	/** LIFECYCLES **/
	useEffect(() => {
		const emptyListKeys: ListKey[] = ['originList', 'destinationList', 'typeList', 'statusList'];
		let isChanged = false;

		emptyListKeys.forEach((key) => {
			if (searchFilter?.search?.[key]?.length == 0) {
				delete searchFilter.search[key];
				if (key === 'originList') setShowMoreOrigin(false);
				if (key === 'destinationList') setShowMoreDestination(false);
				isChanged = true;
			}
		});

		if (isChanged) pushFilter({ ...searchFilter, search: { ...searchFilter.search } });

		if (searchFilter?.search?.originList) setShowMoreOrigin(true);
		if (searchFilter?.search?.destinationList) setShowMoreDestination(true);
	}, [searchFilter]);

	/** HANDLERS **/
	const pushFilter = async (filter: ShipmentsInquiry) => {
		await router.push(`/shipment?input=${JSON.stringify(filter)}`, `/shipment?input=${JSON.stringify(filter)}`, {
			scroll: false,
		});
	};

	const listSelectHandler = useCallback(
		async (key: ListKey, e: any) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				const current: string[] = (searchFilter?.search?.[key] as string[]) || [];

				if (isChecked) {
					await pushFilter({ ...searchFilter, search: { ...searchFilter.search, [key]: [...current, value] } });
				} else if (current.includes(value)) {
					await pushFilter({
						...searchFilter,
						search: { ...searchFilter.search, [key]: current.filter((item: string) => item !== value) },
					});
				}
			} catch (err: any) {
				console.log(`ERROR, listSelectHandler(${key}):`, err);
			}
		},
		[searchFilter],
	);

	const shipmentWeightHandler = useCallback(
		async (e: any, type: 'start' | 'end') => {
			const value = e.target.value;
			await pushFilter({
				...searchFilter,
				search: {
					...searchFilter.search,
					weightsRange: { ...(searchFilter.search.weightsRange as any), [type]: value },
				},
			});
		},
		[searchFilter],
	);

	const shipmentPriceHandler = useCallback(
		async (value: number, type: 'start' | 'end') => {
			await pushFilter({
				...searchFilter,
				search: {
					...searchFilter.search,
					// backend PricesRange is Int
					pricesRange: { ...(searchFilter.search.pricesRange as any), [type]: Math.floor(value * 1) },
				},
			});
		},
		[searchFilter],
	);

	const trackingCodeHandler = async () => {
		const code = trackingCode.trim();
		if (!code) return;
		await router.push(`/shipment/detail?code=${encodeURIComponent(code)}`);
	};

	const refreshHandler = async () => {
		try {
			setSearchText('');
			await pushFilter(initialInput);
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	const renderChecklist = (key: ListKey, values: string[]) =>
		values.map((value: string) => {
			const id = `${key}-${value}`;
			return (
				<Stack className={'input-box'} key={id}>
					<Checkbox
						id={id}
						className="property-checkbox"
						color="default"
						size="small"
						value={value}
						checked={((searchFilter?.search?.[key] as string[]) || []).includes(value)}
						onChange={(e) => listSelectHandler(key, e)}
					/>
					<label htmlFor={id} style={{ cursor: 'pointer' }}>
						<Typography className="property-type">{value}</Typography>
					</label>
				</Stack>
			);
		});

	if (device === 'mobile') {
		return <div>SHIPMENTS FILTER</div>;
	} else {
		return (
			<Stack className={'filter-main'}>
				<Stack className={'find-your-home'} mb={'40px'}>
					<Typography className={'title-main'}>Find Shipments</Typography>
					<Stack className={'input-box'}>
						<OutlinedInput
							value={searchText}
							type={'text'}
							className={'search-input'}
							placeholder={'Title or tracking code'}
							onChange={(e: any) => setSearchText(e.target.value)}
							onKeyDown={(event: any) => {
								if (event.key == 'Enter') {
									setSearchFilter({
										...searchFilter,
										search: { ...searchFilter.search, text: searchText },
									});
								}
							}}
							endAdornment={
								<>
									<CancelRoundedIcon
										onClick={() => {
											setSearchText('');
											setSearchFilter({
												...searchFilter,
												search: { ...searchFilter.search, text: '' },
											});
										}}
									/>
								</>
							}
						/>
						<img src={'/img/icons/search_icon.png'} alt={''} />
						<Tooltip title="Reset">
							<IconButton onClick={refreshHandler}>
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Track by code</Typography>
					<Stack className={'input-box'}>
						<OutlinedInput
							value={trackingCode}
							type={'text'}
							className={'search-input'}
							placeholder={'CD261013A1B2C3D4'}
							onChange={(e: any) => setTrackingCode(e.target.value)}
							onKeyDown={(event: any) => {
								if (event.key == 'Enter') trackingCodeHandler();
							}}
						/>
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<p className={'title'} style={{ textShadow: '0px 3px 4px #b9b9b9' }}>
						Origin
					</p>
					<Stack
						className={`property-location`}
						style={{ height: showMoreOrigin ? '253px' : '115px' }}
						onMouseEnter={() => setShowMoreOrigin(true)}
						onMouseLeave={() => {
							if (!searchFilter?.search?.originList) setShowMoreOrigin(false);
						}}
					>
						{renderChecklist('originList', shipmentLocations)}
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<p className={'title'} style={{ textShadow: '0px 3px 4px #b9b9b9' }}>
						Destination
					</p>
					<Stack
						className={`property-location`}
						style={{ height: showMoreDestination ? '253px' : '115px' }}
						onMouseEnter={() => setShowMoreDestination(true)}
						onMouseLeave={() => {
							if (!searchFilter?.search?.destinationList) setShowMoreDestination(false);
						}}
					>
						{renderChecklist('destinationList', shipmentLocations)}
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Shipment Type</Typography>
					{renderChecklist('typeList', shipmentTypes)}
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Status</Typography>
					{renderChecklist('statusList', filterStatuses)}
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Weight (kg)</Typography>
					<Stack className="square-year-input">
						<FormControl>
							<InputLabel id="weight-min-label">Min</InputLabel>
							<Select
								labelId="weight-min-label"
								id="weight-min"
								value={searchFilter?.search?.weightsRange?.start ?? 0}
								label="Min"
								onChange={(e: any) => shipmentWeightHandler(e, 'start')}
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
						<div className="central-divider"></div>
						<FormControl>
							<InputLabel id="weight-max-label">Max</InputLabel>
							<Select
								labelId="weight-max-label"
								id="weight-max"
								value={searchFilter?.search?.weightsRange?.end ?? 5000}
								label="Max"
								onChange={(e: any) => shipmentWeightHandler(e, 'end')}
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
					</Stack>
				</Stack>
				<Stack className={'find-your-home'}>
					<Typography className={'title'}>Price range (₩)</Typography>
					<Stack className="square-year-input">
						<input
							type="number"
							placeholder="₩ min"
							min={0}
							value={searchFilter?.search?.pricesRange?.start ?? 0}
							onChange={(e: any) => {
								if (e.target.value >= 0) {
									shipmentPriceHandler(e.target.value, 'start');
								}
							}}
						/>
						<div className="central-divider"></div>
						<input
							type="number"
							placeholder="₩ max"
							value={searchFilter?.search?.pricesRange?.end ?? 0}
							onChange={(e: any) => {
								if (e.target.value >= 0) {
									shipmentPriceHandler(e.target.value, 'end');
								}
							}}
						/>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Filter;
