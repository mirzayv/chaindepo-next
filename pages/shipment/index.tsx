/**
 * ============================================================================
 *  FRONTEND: pages/shipment/index.tsx   →   URL: localhost:3000/shipment
 *  Shipment List Screen (oldin: pages/property/index.tsx, 140-DARS)
 * ============================================================================
 *
 *  BU SAHIFA NIMA?
 *  Yuklar KATALOGI. Chapda qidiruv filtrlari (Filter.tsx), o'ngda yuk kartochkalari
 *  (ShipmentTile.tsx), tepada saralash (New / Lowest / Highest), pastda sahifalash (pagination).
 *
 *  OQIM (BUTUN SAHIFANING MOHIYATI):
 *  1) Mijoz filtrni bosadi (Filter.tsx)         → URL o'zgaradi: /shipment?input={...}
 *  2) useEffect([router]) URL'ni o'qiydi         → setSearchFilter(...)
 *  3) useEffect([searchFilter]) ishga tushadi     → getShipmentsRefetch(...)
 *  4) Apollo GET_SHIPMENTS so'rovini yuboradi    → backend getShipments()
 *  5) Javob keladi → onCompleted                  → setShipments / setTotal → kartalar yangilanadi
 */

import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/shipment/Filter';
import ShipmentTile from '../../libs/components/ui/ShipmentTile';
import Pagination from '../../libs/components/ui/Pagination';
import { useRouter } from 'next/router';
import { ShipmentsInquiry } from '../../libs/types/shipment/shipment.input';
import { Shipment } from '../../libs/types/shipment/shipment';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Direction } from '../../libs/enums/common.enum';
// Direction — ENUM: saralash yo'nalishi (ASC = o'suvchi, DESC = kamayuvchi).
import { GET_SHIPMENTS } from '../../apollo/user/query';
// GET_SHIPMENTS — GraphQL QUERY HUJJATI: "menga yuklar ro'yxatini shu maydonlari bilan ber" degan blank.
import { useQuery } from '@apollo/client';
// useQuery — HOOK: ma'lumot O'QISH uchun (GET).
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});
// getStaticProps — Next.js FUNKSIYASI: sahifa KARKASINI oldindan (build paytida) tayyorlaydi (SSG).
// Bu yerda faqat TARJIMALAR (en/kr/ru) olinadi. Yuklar ro'yxati brauzerda useQuery bilan keladi (CSR).

/** sort options: id → backend sort field + direction */
const SORTS: { id: string; label: string; sort: string; direction: Direction }[] = [
	{ id: 'new', label: 'Newest', sort: 'createdAt', direction: Direction.DESC },
	{ id: 'lowest', label: 'Lowest price', sort: 'shipmentPrice', direction: Direction.ASC },
	{ id: 'highest', label: 'Highest price', sort: 'shipmentPrice', direction: Direction.DESC },
	{ id: 'heaviest', label: 'Heaviest', sort: 'shipmentWeight', direction: Direction.DESC },
];

const sortIdOf = (filter: ShipmentsInquiry): string =>
	SORTS.find((item) => item.sort === filter.sort && item.direction === filter.direction)?.id ?? 'new';

const ShipmentList: NextPage = ({ initialInput, ...props }: any) => {
	const router = useRouter();

	const [searchFilter, setSearchFilter] = useState<ShipmentsInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	// searchFilter — STATE: hozirgi "buyurtma cheki" { page, limit, sort, direction, search }.
	// URL'da ?input bo'lsa — o'shani JSON.parse bilan obyektga aylantir, bo'lmasa — initialInput.

	const [shipments, setShipments] = useState<Shipment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);

	/** APOLLO REQUESTS **/
	const {
		loading: getShipmentsLoading,
		refetch: getShipmentsRefetch,
	} = useQuery(GET_SHIPMENTS, {
		fetchPolicy: 'cache-and-network',
		// KESH SIYOSATI: avval keshdagi eski ro'yxatni DARHOL ko'rsat, orqa fonda serverdan yangisini ham so'ra.
		variables: {
			input: searchFilter,
		},
		notifyOnNetworkStatusChange: true,
		// refetch paytida ham onCompleted qayta ishlasin.
		onCompleted: (data: T) => {
			setShipments(data?.getShipments?.list ?? []);
			setTotal(data?.getShipments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		// 1-useEffect: URL o'zgarganda ishlaydi (dependency: [router]).
		if (router.query.input) {
			const inputObj = JSON.parse(router?.query?.input as string);
			setSearchFilter(inputObj);
		}

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	useEffect(() => {
		// 2-useEffect: searchFilter o'zgarganda ishlaydi → yangi chek bilan qayta so'rov.
		getShipmentsRefetch({ input: searchFilter }).then();
	}, [searchFilter]);

	/** HANDLERS **/
	const handlePaginationChange = async (value: number) => {
		searchFilter.page = value;
		await router.push(
			`/shipment?input=${JSON.stringify(searchFilter)}`,
			`/shipment?input=${JSON.stringify(searchFilter)}`,
			{
				scroll: false,
			},
		);
		setCurrentPage(value);
	};

	const sortingHandler = (e: ChangeEvent<HTMLSelectElement>) => {
		const option = SORTS.find((item) => item.id === e.target.value);
		if (!option) return;
		setSearchFilter({ ...searchFilter, sort: option.sort, direction: option.direction });
	};

	return (
		<div className="cd-ui w-full bg-surface">
			<div className="mx-auto grid max-w-page gap-6 px-4 py-8 md:px-6 md:py-12 lg:grid-cols-[280px_minmax(0,1fr)]">
				{/* ─── CHAP: FILTR ─── */}
				<aside className="min-w-0">
					<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
				</aside>

				{/* ─── O'NG: KARTALAR ─── */}
				<section className="flex min-w-0 flex-col gap-5" aria-busy={getShipmentsLoading}>
					{/* the page title comes from the LayoutBasic band */}
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p className="m-0 text-small text-muted" aria-live="polite">
							{total} shipment{total === 1 ? '' : 's'} found
						</p>
						{/* ─── SARALASH (Sort by) ─── */}
						<div className="flex items-center gap-2">
							<label htmlFor="shipment-sort" className="text-small text-muted">
								Sort by
							</label>
							<select
								id="shipment-sort"
								value={sortIdOf(searchFilter)}
								onChange={sortingHandler}
								className="h-10 cursor-pointer rounded-card border border-line bg-white px-3 text-small font-medium text-ink outline-none transition-colors duration-150 ease-out hover:border-accent focus:border-accent"
							>
								{SORTS.map((item) => (
									<option key={item.id} value={item.id}>
										{item.label}
									</option>
								))}
							</select>
						</div>
					</div>

					{shipments?.length === 0 ? (
						<div className="rounded-card border border-line bg-white px-6 py-14 text-center">
							<p className="m-0 text-h3 font-semibold text-ink">No shipments found</p>
							<p className="m-0 mt-1 text-small text-muted">Try fewer filters or reset them.</p>
						</div>
					) : (
						<ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
							{shipments.map((shipment: Shipment) => (
								<li key={shipment?._id} className="flex min-w-0">
									<ShipmentTile shipment={shipment} />
								</li>
							))}
						</ul>
					)}

					{/* ─── PASTDA: SAHIFALASH ─── */}
					{shipments.length !== 0 && (
						<Pagination
							page={currentPage}
							count={Math.ceil(total / searchFilter.limit)}
							onChange={handlePaginationChange}
							className="mt-2"
						/>
					)}
				</section>
			</div>
		</div>
	);
};

ShipmentList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
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
// defaultProps — URL'da ?input bo'lmaganda ishlatiladigan BOSHLANG'ICH CHEK:
// 1-sahifa, 9 ta yuk, eng yangilari birinchi, 0–5000 kg, 0–₩2,000,000.

export default withLayoutBasic(ShipmentList);
