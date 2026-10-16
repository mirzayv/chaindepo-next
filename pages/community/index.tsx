import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import CommunityCard from '../../libs/components/common/CommunityCard';
import CommunityNav from '../../libs/components/community/CommunityNav';
import Pagination from '../../libs/components/ui/Pagination';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { Message } from '../../libs/enums/common.enum';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { communityCategories } from '../../libs/config';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** boards offered in the UI; anything else in the URL (e.g. HUMOR) falls back to General */
const isShownCategory = (value?: string): value is BoardArticleCategory =>
	communityCategories.some((item) => item.value === value);

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const router = useRouter();
	const { query } = router;
	const articleCategory = isShownCategory(query?.articleCategory as string)
		? (query.articleCategory as BoardArticleCategory)
		: BoardArticleCategory.FREE;
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>({
		...initialInput,
		search: { articleCategory },
	});
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const board = communityCategories.find((item) => item.value === articleCategory) ?? communityCategories[0];

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const { loading: getBoardArticlesLoading, refetch: getBoardArticlesRefetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchCommunity },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticles(data?.getBoardArticles?.list ?? []);
			setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	// the board lives in the URL (?articleCategory=FREE), so the nav links and back button switch it
	useEffect(() => {
		if (searchCommunity.search.articleCategory !== articleCategory)
			setSearchCommunity({ ...searchCommunity, page: 1, search: { articleCategory } });
	}, [articleCategory]);

	/** HANDLERS **/
	const paginationHandler = (value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const likeArticleHandler = async (e: any, user: T, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetBoardArticle({
				variables: { input: id },
			});

			await getBoardArticlesRefetch({ input: searchCommunity });

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div className="cd-ui w-full bg-surface">
			<div className="mx-auto grid max-w-page gap-6 px-4 py-8 md:px-6 md:py-12 lg:grid-cols-[220px_minmax(0,1fr)]">
				<aside className="min-w-0">
					<CommunityNav active={articleCategory} />
				</aside>

				<section className="flex min-w-0 flex-col gap-4" aria-busy={getBoardArticlesLoading}>
					<div>
						<h2 className="m-0 text-h3 font-semibold text-ink">{board.label}</h2>
						<p className="m-0 mt-1 text-small text-muted">{board.desc}</p>
					</div>

					{totalCount ? (
						<ul className="m-0 flex list-none flex-col gap-3 p-0">
							{boardArticles?.map((boardArticle: BoardArticle) => (
								<li key={boardArticle?._id}>
									<CommunityCard boardArticle={boardArticle} likeArticleHandler={likeArticleHandler} />
								</li>
							))}
						</ul>
					) : (
						<div className="rounded-card border border-line bg-white px-6 py-14 text-center">
							<p className="m-0 text-h3 font-semibold text-ink">No posts yet</p>
							<p className="m-0 mt-1 text-small text-muted">Be the first to write in {board.label}.</p>
						</div>
					)}

					{totalCount > 0 && (
						<Pagination
							count={Math.ceil(totalCount / searchCommunity.limit)}
							page={searchCommunity.page}
							onChange={paginationHandler}
							className="mt-2"
						/>
					)}
				</section>
			</div>
		</div>
	);
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			articleCategory: 'FREE',
		},
	},
};

export default withLayoutBasic(Community);
