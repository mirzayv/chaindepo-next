import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ShipmentLocation, ShipmentStatus, ShipmentType } from '../../enums/shipment.enum';
import { ShipmentsInquiry } from '../../types/shipment/shipment.input';
import { shipmentWeights } from '../../config';
import { useTranslation } from 'next-i18next';
import useLabel from '../../hooks/useLabel';

/** statuses a visitor can filter by (DELETE is never listed publicly) **/
const filterStatuses = Object.values(ShipmentStatus).filter((status) => status !== ShipmentStatus.DELETE);
const shipmentLocations = Object.values(ShipmentLocation);
const shipmentTypes = Object.values(ShipmentType);

type ListKey = 'originList' | 'destinationList' | 'typeList' | 'statusList';

interface FilterType {
	searchFilter: ShipmentsInquiry;
	setSearchFilter: any;
	initialInput: ShipmentsInquiry;
}

const inputClass =
	'h-10 w-full min-w-0 rounded-card border border-line bg-card px-3 text-small text-ink outline-none transition-colors duration-150 ease-out placeholder:text-muted focus:border-accent';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
	<fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 border-t border-line p-0 pt-4">
		<legend className="float-left mb-2 w-full p-0 text-small font-semibold text-ink">{title}</legend>
		{children}
	</fieldset>
);

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const { t } = useTranslation('common');
	const label = useLabel();
	const router = useRouter();
	const [searchText, setSearchText] = useState<string>(searchFilter?.search?.text ?? '');
	const [trackingCode, setTrackingCode] = useState<string>('');

	/** LIFECYCLES **/
	useEffect(() => {
		const emptyListKeys: ListKey[] = ['originList', 'destinationList', 'typeList', 'statusList'];
		let isChanged = false;

		emptyListKeys.forEach((key) => {
			if (searchFilter?.search?.[key]?.length == 0) {
				delete searchFilter.search[key];
				isChanged = true;
			}
		});

		if (isChanged) pushFilter({ ...searchFilter, search: { ...searchFilter.search } });
	}, [searchFilter]);

	/** HANDLERS **/
	const pushFilter = async (filter: ShipmentsInquiry) => {
		await router.push(`/shipment?input=${JSON.stringify(filter)}`, `/shipment?input=${JSON.stringify(filter)}`, {
			scroll: false,
		});
	};

	const listSelectHandler = useCallback(
		async (key: ListKey, e: React.ChangeEvent<HTMLInputElement>) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				const current: string[] = (searchFilter?.search?.[key] as string[]) || [];

				if (isChecked) {
					await pushFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, [key]: [...current, value] } });
				} else if (current.includes(value)) {
					await pushFilter({
						...searchFilter,
						page: 1,
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
		async (value: number, type: 'start' | 'end') => {
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

	const searchHandler = (text: string) => {
		setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, text } });
	};

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

	const renderChecklist = (key: ListKey, values: string[], columns = 1) => (
		<div className={`grid gap-x-3 gap-y-1.5 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
			{values.map((value: string) => {
				const id = `${key}-${value}`;
				return (
					<label key={id} htmlFor={id} className="flex cursor-pointer items-center gap-2 text-small text-ink">
						<input
							id={id}
							type="checkbox"
							className="m-0 h-4 w-4 shrink-0 cursor-pointer accent-accent"
							value={value}
							checked={((searchFilter?.search?.[key] as string[]) || []).includes(value)}
							onChange={(e) => listSelectHandler(key, e)}
						/>
						<span className="truncate">{label(value)}</span>
					</label>
				);
			})}
		</div>
	);

	return (
		<div className="flex flex-col gap-4 rounded-card border border-line bg-card p-4 md:p-5">
			<div className="flex items-center justify-between gap-3">
				<h2 className="m-0 text-h3 font-semibold text-ink">{t('Filters')}</h2>
				<button
					type="button"
					onClick={refreshHandler}
					className="cursor-pointer border-0 bg-transparent p-0 text-small font-medium text-accent hover:text-accent-hover hover:underline"
				>
					{t('Reset')}
				</button>
			</div>

			<form
				className="flex gap-2"
				role="search"
				onSubmit={(e) => {
					e.preventDefault();
					searchHandler(searchText);
				}}
			>
				<label htmlFor="shipment-search" className="sr-only">
					{t('Search shipments')}
				</label>
				<input
					id="shipment-search"
					type="search"
					className={inputClass}
					placeholder={t('Title or tracking code')}
					value={searchText}
					onChange={(e) => {
						setSearchText(e.target.value);
						if (e.target.value === '') searchHandler('');
					}}
				/>
			</form>

			<Section title={t('Track by code')}>
				<form
					className="flex gap-2"
					onSubmit={(e) => {
						e.preventDefault();
						trackingCodeHandler();
					}}
				>
					<label htmlFor="filter-tracking-code" className="sr-only">
						{t('Tracking code')}
					</label>
					<input
						id="filter-tracking-code"
						type="text"
						className={`${inputClass} font-mono`}
						placeholder="CD261013A1B2C3D4"
						value={trackingCode}
						onChange={(e) => setTrackingCode(e.target.value)}
					/>
					<button
						type="submit"
						className="h-10 shrink-0 cursor-pointer rounded-card border-0 bg-accent px-3 text-small font-semibold text-white transition-colors duration-150 ease-out hover:bg-accent-hover"
					>
						{t('Track button')}
					</button>
				</form>
			</Section>

			<Section title={t('Origin')}>{renderChecklist('originList', shipmentLocations, 2)}</Section>
			<Section title={t('Destination')}>{renderChecklist('destinationList', shipmentLocations, 2)}</Section>
			<Section title={t('Shipment type')}>{renderChecklist('typeList', shipmentTypes)}</Section>
			<Section title={t('Status')}>{renderChecklist('statusList', filterStatuses)}</Section>

			<Section title={t('Weight (kg)')}>
				<div className="flex items-center gap-2">
					<label htmlFor="weight-min" className="sr-only">
						{t('Minimum weight')}
					</label>
					<select
						id="weight-min"
						className={inputClass}
						value={searchFilter?.search?.weightsRange?.start ?? 0}
						onChange={(e) => shipmentWeightHandler(Number(e.target.value), 'start')}
					>
						{shipmentWeights.map((weight: number) => (
							<option value={weight} disabled={(searchFilter?.search?.weightsRange?.end || 0) < weight} key={weight}>
								{weight}
							</option>
						))}
					</select>
					<span className="text-muted" aria-hidden="true">
						–
					</span>
					<label htmlFor="weight-max" className="sr-only">
						{t('Maximum weight')}
					</label>
					<select
						id="weight-max"
						className={inputClass}
						value={searchFilter?.search?.weightsRange?.end ?? 5000}
						onChange={(e) => shipmentWeightHandler(Number(e.target.value), 'end')}
					>
						{shipmentWeights.map((weight: number) => (
							<option value={weight} disabled={(searchFilter?.search?.weightsRange?.start || 0) > weight} key={weight}>
								{weight}
							</option>
						))}
					</select>
				</div>
			</Section>

			<Section title={t('Price (₩)')}>
				<div className="flex items-center gap-2">
					<label htmlFor="price-min" className="sr-only">
						{t('Minimum price')}
					</label>
					<input
						id="price-min"
						type="number"
						className={inputClass}
						placeholder={t('Min')}
						min={0}
						value={searchFilter?.search?.pricesRange?.start ?? 0}
						onChange={(e) => {
							if (Number(e.target.value) >= 0) shipmentPriceHandler(Number(e.target.value), 'start');
						}}
					/>
					<span className="text-muted" aria-hidden="true">
						–
					</span>
					<label htmlFor="price-max" className="sr-only">
						{t('Maximum price')}
					</label>
					<input
						id="price-max"
						type="number"
						className={inputClass}
						placeholder={t('Max')}
						min={0}
						value={searchFilter?.search?.pricesRange?.end ?? 0}
						onChange={(e) => {
							if (Number(e.target.value) >= 0) shipmentPriceHandler(Number(e.target.value), 'end');
						}}
					/>
				</div>
			</Section>
		</div>
	);
};

export default Filter;
