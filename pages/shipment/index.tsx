/**
 * ============================================================================
 *  FRONTEND: pages/shipment/index.tsx   →   URL: localhost:3000/shipment
 *  Shipment List Screen (oldin: pages/property/index.tsx, 140-DARS)
 * ============================================================================
 *
 *  BU SAHIFA NIMA?
 *  Yuklar KATALOGI. Chapda qidiruv filtrlari (Filter.tsx), o'ngda yuk kartochkalari
 *  (ShipmentCard.tsx), tepada saralash (New / Lowest / Highest), pastda sahifalash (pagination).
 *
 *  OQIM (BUTUN SAHIFANING MOHIYATI):
 *  1) Mijoz filtrni bosadi (Filter.tsx)         → URL o'zgaradi: /shipment?input={...}
 *  2) useEffect([router]) URL'ni o'qiydi         → setSearchFilter(...)
 *  3) useEffect([searchFilter]) ishga tushadi     → getShipmentsRefetch(...)
 *  4) Apollo GET_SHIPMENTS so'rovini yuboradi    → backend getShipments()
 *  5) Javob keladi → onCompleted                  → setShipments / setTotal → kartalar yangilanadi
 */

import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import ShipmentCard from '../../libs/components/shipment/ShipmentCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/shipment/Filter';
import { useRouter } from 'next/router';
import { ShipmentsInquiry } from '../../libs/types/shipment/shipment.input';
import { Shipment } from '../../libs/types/shipment/shipment';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Direction, Message } from '../../libs/enums/common.enum';
// Direction — ENUM: saralash yo'nalishi (ASC = o'suvchi, DESC = kamayuvchi).
// Message   — ENUM: tayyor xato matnlari (NOT_AUTHENTICATED = "Please login first!").
import { GET_SHIPMENTS } from '../../apollo/user/query';
// GET_SHIPMENTS — GraphQL QUERY HUJJATI: "menga yuklar ro'yxatini shu maydonlari bilan ber" degan blank.
import { useMutation, useQuery } from '@apollo/client';
// useQuery    — HOOK: ma'lumot O'QISH uchun (GET).
// useMutation — HOOK: ma'lumot O'ZGARTIRISH uchun (like, create, update).
import { LIKE_TARGET_SHIPMENT } from '../../apollo/user/mutation';
// LIKE_TARGET_SHIPMENT — GraphQL MUTATION HUJJATI: "shu yukka like bos/olib tashla".
import { T } from '../../libs/types/common';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});
// getStaticProps — Next.js FUNKSIYASI: sahifa KARKASINI oldindan (build paytida) tayyorlaydi (SSG).
// Bu yerda faqat TARJIMALAR (en/kr/ru) olinadi. Yuklar ro'yxati brauzerda useQuery bilan keladi (CSR).

const ShipmentList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();

	const [searchFilter, setSearchFilter] = useState<ShipmentsInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	// searchFilter — STATE: hozirgi "buyurtma cheki" { page, limit, sort, direction, search }.
	// URL'da ?input bo'lsa — o'shani JSON.parse bilan obyektga aylantir, bo'lmasa — initialInput.

	const [shipments, setShipments] = useState<Shipment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');

	/** APOLLO REQUESTS **/

	const [likeTargetShipment] = useMutation(LIKE_TARGET_SHIPMENT);

	const {
		loading: getShipmentsLoading,
		data: getShipmentsData,
		error: getShipmentsError,
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
			setShipments(data?.getShipments?.list);
			setTotal(data?.getShipments?.metaCounter[0]?.total);
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
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
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

	const likeShipmentHandler = async (user: T, id: string) => {
		// Bu funksiya PROP sifatida ShipmentCard'ga uzatiladi va yurakcha ❤️ bosilganda chaqiriladi.
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetShipment({ variables: { input: id } });
			// Backend: likeTargetShipment → toggleLike → shipmentStatsEditor (shipmentLikes +1 yoki -1).

			await getShipmentsRefetch({ input: searchFilter });
			// MUHIM: joriy searchFilter bilan — filtr va sahifa yo'qolmasin.

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeShipmentHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'new':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.DESC });
				setFilterSortName('New');
				break;
			case 'lowest':
				setSearchFilter({ ...searchFilter, sort: 'shipmentPrice', direction: Direction.ASC });
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				setSearchFilter({ ...searchFilter, sort: 'shipmentPrice', direction: Direction.DESC });
				setFilterSortName('Highest Price');
				break;
			case 'heaviest':
				setSearchFilter({ ...searchFilter, sort: 'shipmentWeight', direction: Direction.DESC });
				setFilterSortName('Heaviest');
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	if (device === 'mobile') {
		return <h1>SHIPMENTS MOBILE</h1>;
	} else {
		return (
			<div id="property-list-page" style={{ position: 'relative' }}>
				<div className="container">
					{/* ─── SARALASH (Sort by) ─── */}
					<Box component={'div'} className={'right'}>
						<span>Sort by</span>
						<div>
							<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
								{filterSortName}
							</Button>
							<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
								<MenuItem
									onClick={sortingHandler}
									id={'new'}
									disableRipple
									sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
								>
									New
								</MenuItem>
								<MenuItem
									onClick={sortingHandler}
									id={'lowest'}
									disableRipple
									sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
								>
									Lowest Price
								</MenuItem>
								<MenuItem
									onClick={sortingHandler}
									id={'highest'}
									disableRipple
									sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
								>
									Highest Price
								</MenuItem>
								<MenuItem
									onClick={sortingHandler}
									id={'heaviest'}
									disableRipple
									sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
								>
									Heaviest
								</MenuItem>
							</Menu>
						</div>
					</Box>
					<Stack className={'property-page'}>
						{/* ─── CHAP: FILTR ─── */}
						<Stack className={'filter-config'}>
							{/* @ts-ignore */}
							<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
						</Stack>
						{/* ─── O'NG: KARTALAR ─── */}
						<Stack className="main-config" mb={'76px'}>
							<Stack className={'list-config'}>
								{shipments?.length === 0 ? (
									<div className={'no-data'}>
										<img src="/img/icons/icoAlert.svg" alt="" />
										<p>No Shipments found!</p>
									</div>
								) : (
									shipments.map((shipment: Shipment) => {
										return (
											<ShipmentCard shipment={shipment} likeShipmentHandler={likeShipmentHandler} key={shipment?._id} />
										);
									})
								)}
							</Stack>
							{/* ─── PASTDA: SAHIFALASH ─── */}
							<Stack className="pagination-config">
								{shipments.length !== 0 && (
									<Stack className="pagination-box">
										<Pagination
											page={currentPage}
											count={Math.ceil(total / searchFilter.limit)}
											onChange={handlePaginationChange}
											shape="circular"
											color="primary"
										/>
									</Stack>
								)}

								{shipments.length !== 0 && (
									<Stack className="total-result">
										<Typography>
											Total {total} shipment{total > 1 ? 's' : ''} available
										</Typography>
									</Stack>
								)}
							</Stack>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
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
// 1-sahifa, 9 ta yuk, eng yangilari birinchi, 0–5000 kg, 0–2 000 000 $.

export default withLayoutBasic(ShipmentList);
