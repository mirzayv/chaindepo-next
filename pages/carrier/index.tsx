import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import CarrierCard from '../../libs/components/common/CarrierCard';
import Pagination from '../../libs/components/ui/Pagination';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Member } from '../../libs/types/member/member';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_CARRIERS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** sort options: id → backend sort field + direction */
const SORTS: { id: string; label: string; sort: string; direction: string }[] = [
	{ id: 'recent', label: 'Newest', sort: 'createdAt', direction: 'DESC' },
	{ id: 'old', label: 'Oldest', sort: 'createdAt', direction: 'ASC' },
	{ id: 'likes', label: 'Most liked', sort: 'memberLikes', direction: 'DESC' },
	{ id: 'views', label: 'Most viewed', sort: 'memberViews', direction: 'DESC' },
];

const inputClass =
	'h-10 rounded-card border border-line bg-card px-3 text-small text-ink outline-none transition-colors duration-150 ease-out placeholder:text-muted hover:border-accent focus:border-accent';

const CarrierList: NextPage = ({ initialInput, ...props }: any) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [carriers, setCarriers] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	const { loading: getCarriersLoading, refetch: getCarriersRefetch } = useQuery(GET_CARRIERS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setCarriers(data?.getCarriers?.list ?? []);
			setTotal(data?.getCarriers?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const input_obj = JSON.parse(router?.query?.input as string);
			setSearchFilter(input_obj);
		} else
			router.replace(`/carrier?input=${JSON.stringify(searchFilter)}`, `/carrier?input=${JSON.stringify(searchFilter)}`);

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	/** HANDLERS **/
	const sortingHandler = (e: ChangeEvent<HTMLSelectElement>) => {
		const option = SORTS.find((item) => item.id === e.target.value);
		if (!option) return;
		setSearchFilter({ ...searchFilter, sort: option.sort, direction: option.direction });
	};

	const paginationChangeHandler = async (value: number) => {
		searchFilter.page = value;
		await router.push(`/carrier?input=${JSON.stringify(searchFilter)}`, `/carrier?input=${JSON.stringify(searchFilter)}`, {
			scroll: false,
		});
		setCurrentPage(value);
	};

	const likeMemberHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetMember({
				variables: { input: id },
			});

			await getCarriersRefetch({ input: searchFilter });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const sortId =
		SORTS.find((item) => item.sort === searchFilter.sort && item.direction === searchFilter.direction)?.id ?? 'recent';

	return (
		<div className="cd-ui w-full bg-surface">
			<div className="mx-auto flex max-w-page flex-col gap-5 px-4 py-8 md:px-6 md:py-12">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<form
						role="search"
						className="flex w-full max-w-sm"
						onSubmit={(e) => {
							e.preventDefault();
							setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, text: searchText } });
						}}
					>
						<label htmlFor="carrier-search" className="sr-only">
							{t('Search carriers')}
						</label>
						<input
							id="carrier-search"
							type="search"
							placeholder={t('Search for a carrier')}
							className={`${inputClass} w-full`}
							value={searchText}
							onChange={(e) => {
								setSearchText(e.target.value);
								if (e.target.value === '')
									setSearchFilter({ ...searchFilter, page: 1, search: { ...searchFilter.search, text: '' } });
							}}
						/>
					</form>
					<div className="flex items-center gap-2">
						<label htmlFor="carrier-sort" className="text-small text-muted">
							{t('Sort by')}
						</label>
						<select id="carrier-sort" value={sortId} onChange={sortingHandler} className={`cd-select ${inputClass} cursor-pointer font-medium`}>
							{SORTS.map((item) => (
								<option key={item.id} value={item.id}>
									{t(item.label)}
								</option>
							))}
						</select>
					</div>
				</div>

				<p className="m-0 text-small text-muted" aria-live="polite">
					{t('carriersCount', { count: total })}
				</p>

				{carriers?.length === 0 ? (
					<div
						className="rounded-card border border-line bg-card px-6 py-14 text-center"
						aria-busy={getCarriersLoading}
					>
						<p className="m-0 text-h3 font-semibold text-ink">{t('No carriers found')}</p>
					</div>
				) : (
					<ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
						{carriers.map((carrier: Member) => (
							<li key={carrier._id} className="min-w-0">
								<CarrierCard carrier={carrier} likeMemberHandler={likeMemberHandler} />
							</li>
						))}
					</ul>
				)}

				{carriers.length !== 0 && (
					<Pagination
						page={currentPage}
						count={Math.ceil(total / searchFilter.limit)}
						onChange={paginationChangeHandler}
						className="mt-2"
					/>
				)}
			</div>
		</div>
	);
};

CarrierList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 12,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(CarrierList);
