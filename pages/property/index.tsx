/**
 * ============================================================================
 *  FRONTEND: pages/property/index.tsx   →   URL: localhost:3000/property
 *  140-DARS: Property List Screen
 * ============================================================================
 *
 *  BU SAHIFA NIMA?
 *  Agentlikning KATALOG ZALI. Chapda qidiruv filtrlari (Filter.tsx), o'ngda uylar kartochkalari
 *  (PropertyCard.tsx), tepada saralash (New / Lowest / Highest), pastda sahifalash (pagination).
 *
 *  OQIM (BUTUN SAHIFANING MOHIYATI):
 *  1) Mijoz filtrni bosadi (Filter.tsx)         → URL o'zgaradi: /property?input={...}
 *  2) useEffect([router]) URL'ni o'qiydi         → setSearchFilter(...)
 *  3) useEffect([searchFilter]) ishga tushadi     → getPropertiesRefetch(...)
 *  4) Apollo GET_PROPERTIES so'rovini yuboradi   → backend getProperties()
 *  5) Javob keladi → onCompleted                  → setProperties / setTotal → kartalar yangilanadi
 */

import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import PropertyCard from '../../libs/components/property/PropertyCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/property/Filter';
import { useRouter } from 'next/router';
import { PropertiesInquiry } from '../../libs/types/property/property.input';
import { Property } from '../../libs/types/property/property';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
// ─── BUGUN QO'SHILGAN IMPORT'LAR ─────────────────────────────────────────────
import { Direction, Message } from '../../libs/enums/common.enum';
// Direction — ENUM: saralash yo'nalishi (ASC = o'suvchi, DESC = kamayuvchi).
// Message   — ENUM: tayyor xato matnlari (NOT_AUTHENTICATED = "Please login first!").
import { GET_PROPERTIES } from '../../apollo/user/query';
// GET_PROPERTIES — GraphQL QUERY HUJJATI: "menga uylar ro'yxatini shu maydonlari bilan ber" degan blank.
import { useMutation, useQuery } from '@apollo/client';
// useQuery    — HOOK: ma'lumot O'QISH uchun (GET). Burak'dagi useEffect + axios.get + setState'ning o'rnini bosadi.
// useMutation — HOOK: ma'lumot O'ZGARTIRISH uchun (like, create, update).
import { LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
// LIKE_TARGET_PROPERTY — GraphQL MUTATION HUJJATI: "shu uyga like bos/olib tashla".
import { T } from '../../libs/types/common';
// T — "har qanday obyekt" degan umumiy TIP.
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
// Xato va muvaffaqiyat oynalari.
// ─────────────────────────────────────────────────────────────────────────────

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});
// getStaticProps — Next.js FUNKSIYASI: sahifa KARKASINI oldindan (build paytida) tayyorlaydi (SSG).
// Bu yerda faqat TARJIMALAR (en/kr/ru) olinadi. Uylar ro'yxati bu yerda EMAS — u brauzerda useQuery bilan keladi (CSR).

const PropertyList: NextPage = ({ initialInput, ...props }: any) => {
	// PropertyList — KOMPONENT. initialInput — PROP (pastdagi defaultProps'dan keladi): boshlang'ich chek.

	const device = useDeviceDetect();
	// useDeviceDetect — CUSTOM HOOK: 'mobile' yoki 'desktop' qaytaradi. DevTools'da telefon rejimi yoqilganda "PROPERTIES MOBILE" chiqqani shundan.

	const router = useRouter();
	// router — OBYEKT: URL bilan ishlash. router.query — URL'dagi ?input=... qismi. router.push — boshqa URL'ga o'tish.

	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	// searchFilter — STATE: hozirgi "buyurtma cheki" { page, limit, sort, direction, search }.
	// Boshlang'ich qiymat: URL'da ?input bo'lsa — o'shani JSON.parse bilan obyektga aylantir, bo'lmasa — initialInput.
	// Shuning uchun sahifani yangilasangiz ham SEOUL/BUSAN belgili qoladi: chek URL'da saqlangan.

	const [properties, setProperties] = useState<Property[]>([]);
	// properties — STATE: backend'dan kelgan uylar massivi. Boshida bo'sh [].

	const [total, setTotal] = useState<number>(0);
	// total — STATE: filtrga mos JAMI uylar soni (pagination uchun).

	const [currentPage, setCurrentPage] = useState<number>(1);
	// currentPage — STATE: pagination'da qaysi sahifa belgilangan.

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');
	// Saralash menyusi uchun: menyu qaysi tugmaga yopishadi, ochiqmi, tugmada qaysi nom yozilgan.

	/** APOLLO REQUESTS **/
	// ─── BUGUN YOZILGAN QISM (oldin bo'm-bo'sh edi) ──────────────────────────

	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
	// useMutation — HOOK CHAQIRUVI, argument: LIKE_TARGET_PROPERTY hujjati.
	// Massiv qaytaradi, array destructuring bilan 1-elementi — likeTargetProperty FUNKSIYASI olinadi.
	// Bu hali CHAQIRILMAGAN — "tayyor turgan tugma", pastda likePropertyHandler ichida bosiladi.

	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		// useQuery — HOOK CHAQIRUVI. 1-argument: query hujjati, 2-argument: sozlamalar obyekti.
		// Natijadan 4 ta property destructuring bilan olinib, QAYTA NOMLANADI (loading → getPropertiesLoading).
		// Nega qayta nomlash? Bitta sahifada bir nechta query bo'lsa, nomlar to'qnashmasin (detail.tsx'da 3 ta query bor).
		// getPropertiesRefetch — eng muhimi: "shu so'rovni YANGI chek bilan qayta yubor" METODI.

		fetchPolicy: 'cache-and-network',
		// KESH SIYOSATI: avval keshdagi eski ro'yxatni DARHOL ko'rsat, orqa fonda serverdan yangisini ham so'ra.
		// Detail'dan orqaga qaytganda ro'yxat bir zumda chiqishi — shu. Network'da baribir yangi so'rov ketishi — shu.

		variables: {
			input: searchFilter,
		},
		// variables — GraphQL'dagi $input o'zgaruvchisiga searchFilter qo'yiladi. Network → Payload'da ko'ringan narsa shu.

		notifyOnNetworkStatusChange: true,
		// refetch paytida ham loading o'zgarsin va onCompleted qayta ishlasin. Busiz refetch'dan keyin kartalar yangilanmay qolishi mumkin.

		onCompleted: (data: T) => {
			// onCompleted — CALLBACK: javob kelganda chaqiriladi. data — PARAMETR: backend javobi (Network → Preview'da ko'ringan).
			setProperties(data?.getProperties?.list);
			// backend'dagi $facet → list tarmog'i → kartalar massivi
			setTotal(data?.getProperties?.metaCounter[0]?.total);
			// backend'dagi $facet → metaCounter tarmog'i → jami son
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		// 1-useEffect: URL o'zgarganda ishlaydi (dependency: [router]).
		if (router.query.input) {
			const inputObj = JSON.parse(router?.query?.input as string);
			// JSON.parse — METOD: URL'dagi matnni obyektga aylantiradi.
			setSearchFilter(inputObj);
			// Chek state'ga yoziladi → pastdagi 2-useEffect ishga tushadi.
		}

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	useEffect(() => {
		// 2-useEffect: searchFilter o'zgarganda ishlaydi. BUGUNGI ASOSIY TUZATISH — oldin bu blok BO'SH edi,
		// shuning uchun filtr bossangiz ham ro'yxat o'zgarmasdi.
		getPropertiesRefetch({ input: searchFilter }).then();
		// refetch — METOD CHAQIRUVI, argument: yangi chek. Network'dagi "Initiator: index.tsx:47" qatorlari shu yerdan.
	}, [searchFilter]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		// value — PARAMETR: bosilgan sahifa raqami.
		searchFilter.page = value;
		// ⚠️ REVIEW: state to'g'ridan-to'g'ri o'zgartirilyapti (mutatsiya). Toza usul: const f = { ...searchFilter, page: value }.
		// Bu yerda ishlaydi, chunki keyin router.push → URL → yangi obyekt o'qiladi. Mentor kodidan kelgan naqsh.
		await router.push(
			`/property?input=${JSON.stringify(searchFilter)}`,
			`/property?input=${JSON.stringify(searchFilter)}`,
			{
				scroll: false,
			},
		);
		// router.push — METOD: URL'ni o'zgartiradi. JSON.stringify — obyekt → matn. scroll: false — sahifa tepaga sakramasin.
		setCurrentPage(value);
	};

	// ─── BUGUN YOZILGAN HANDLER ──────────────────────────────────────────────
	const likePropertyHandler = async (user: T, id: string) => {
		// user — PARAMETR: hozir login qilgan foydalanuvchi (userVar'dan, PropertyCard ichida olinadi).
		// id   — PARAMETR: like bosilgan uyning _id'si.
		// Bu funksiya PROP sifatida PropertyCard'ga uzatiladi va yurakcha ❤️ bosilganda chaqiriladi.
		try {
			if (!id) return;
			// Himoya: ID bo'lmasa, hech narsa qilma.
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			// Login qilmagan bo'lsa → xato otiladi → catch'ga o'tadi → "Please login first!" oynasi.

			await likeTargetProperty({ variables: { input: id } });
			// Mutation CHAQIRUVI. Backend: likeTargetProperty → toggleLike (bosilgan bo'lsa olib tashlaydi, bo'lmasa qo'shadi)
			// → propertyStatsEditor (propertyLikes +1 yoki -1).

			await getPropertiesRefetch({ input: searchFilter });
			// Ro'yxatni qayta so'rash: like soni va yurakcha rangi yangilanadi.
			// MUHIM: searchFilter (joriy filtr) bilan! Do'stingizda initialInput edi → like bosilishi bilan filtr va sahifa yo'qolardi.

			await sweetTopSmallSuccessAlert('success', 800);
			// Tepada 0.8 soniyalik "success" belgisi.
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};
	// ─────────────────────────────────────────────────────────────────────────

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};
	// "Sort by" tugmasi bosilganda menyuni ochadi. e.currentTarget — bosilgan tugma (menyu shunga yopishadi).

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		// Menyudagi band bosilganda. e.currentTarget.id — 'new' | 'lowest' | 'highest'.
		switch (e.currentTarget.id) {
			case 'new':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.DESC });
				// ...searchFilter — SPREAD: eski filtrning hamma property'lari ko'chiriladi, faqat sort va direction almashadi.
				// BUGUN TUZATILDI: ASC edi → eng ESKI uylar tepada chiqardi. DESC = eng yangilari birinchi.
				setFilterSortName('New');
				break;
			case 'lowest':
				setSearchFilter({ ...searchFilter, sort: 'propertyPrice', direction: Direction.ASC });
				// Arzondan qimmatga.
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				setSearchFilter({ ...searchFilter, sort: 'propertyPrice', direction: Direction.DESC });
				// Qimmatdan arzonga.
				setFilterSortName('Highest Price');
		}
		// setSearchFilter chaqirildi → 2-useEffect → refetch → ro'yxat yangi tartibda keladi.
		setSortingOpen(false);
		setAnchorEl(null);
	};

	if (device === 'mobile') {
		return <h1>PROPERTIES MOBILE</h1>;
		// Mobile versiya hali yozilmagan (keyingi darslarda).
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
							</Menu>
						</div>
					</Box>
					<Stack className={'property-page'}>
						{/* ─── CHAP: FILTR ─── */}
						<Stack className={'filter-config'}>
							{/* @ts-ignore */}
							<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
							{/* Filter'ga 3 ta PROP: hozirgi chek, uni o'zgartiruvchi funksiya, "Reset" tugmasi uchun boshlang'ich chek. */}
						</Stack>
						{/* ─── O'NG: KARTALAR ─── */}
						<Stack className="main-config" mb={'76px'}>
							<Stack className={'list-config'}>
								{properties?.length === 0 ? (
									<div className={'no-data'}>
										<img src="/img/icons/icoAlert.svg" alt="" />
										<p>No Properties found!</p>
									</div>
								) : (
									properties.map((property: Property) => {
										// .map — METOD: har bir uy obyekti uchun bitta PropertyCard chiziladi.
										return (
											<PropertyCard property={property} likePropertyHandler={likePropertyHandler} key={property?._id} />
											// property — PROP: kartaga chiqadigan uy ma'lumoti.
											// likePropertyHandler — PROP: BUGUN QO'SHILDI, yurakcha shu funksiyani chaqiradi.
											// key — React uchun noyob identifikator (qaysi karta qaysi uy ekanini taniydi).
										);
									})
								)}
							</Stack>
							{/* ─── PASTDA: SAHIFALASH ─── */}
							<Stack className="pagination-config">
								{properties.length !== 0 && (
									<Stack className="pagination-box">
										<Pagination
											page={currentPage}
											count={Math.ceil(total / searchFilter.limit)}
											// Sahifalar soni = jami / har sahifadagi son, yuqoriga yaxlitlanadi. 27 / 9 = 3 sahifa.
											onChange={handlePaginationChange}
											shape="circular"
											color="primary"
										/>
									</Stack>
								)}

								{properties.length !== 0 && (
									<Stack className="total-result">
										<Typography>
											Total {total} propert{total > 1 ? 'ies' : 'y'} available
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

PropertyList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			squaresRange: {
				start: 0,
				end: 500,
			},
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};
// defaultProps — URL'da ?input bo'lmaganda ishlatiladigan BOSHLANG'ICH CHEK:
// 1-sahifa, 9 ta uy, eng yangilari birinchi, 0–500 m², 0–2 000 000 $.

export default withLayoutBasic(PropertyList);
// withLayoutBasic — HOC (Higher-Order Component): sahifani header + footer bilan o'raydi.
