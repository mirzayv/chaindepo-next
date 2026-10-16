import React from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import { useReactiveVar } from '@apollo/client';
import { BoardArticle } from '../../types/board-article/board-article';
import { REACT_APP_API_URL } from '../../config';
import { userVar } from '../../../apollo/store';

interface CommunityCardProps {
	boardArticle: BoardArticle;
	likeArticleHandler?: any;
}

/** community article row: optional image, title, author, date, views and a like toggle */
const CommunityCard = (props: CommunityCardProps) => {
	const { boardArticle, likeArticleHandler } = props;
	const user = useReactiveVar(userVar);
	const imagePath: string | null = boardArticle?.articleImage
		? `${REACT_APP_API_URL}/${boardArticle?.articleImage}`
		: null;
	const liked = Boolean(boardArticle?.meLiked?.[0]?.myFavorite);
	const authorId = boardArticle?.memberData?._id;
	const authorHref = authorId === user?._id ? '/mypage' : `/member?memberId=${authorId}`;
	const articleHref = {
		pathname: '/community/detail',
		query: { articleCategory: boardArticle?.articleCategory, id: boardArticle?._id },
	};

	return (
		<article className="flex gap-4 rounded-card border border-line bg-card p-4 transition-colors duration-150 ease-out hover:border-accent">
			{imagePath && (
				<Link href={articleHref} className="hidden shrink-0 sm:block" aria-hidden="true" tabIndex={-1}>
					<img src={imagePath} alt="" className="block h-20 w-28 rounded-card bg-surface object-cover" />
				</Link>
			)}
			<div className="flex min-w-0 flex-1 flex-col gap-1.5">
				<Link href={articleHref} className="line-clamp-2 text-[0.9375rem] font-semibold text-ink hover:text-accent">
					{boardArticle?.articleTitle}
				</Link>
				<p className="m-0 text-small text-muted">
					{authorId ? (
						<Link href={authorHref} className="font-medium text-ink hover:text-accent">
							{boardArticle?.memberData?.memberNick}
						</Link>
					) : (
						'Member'
					)}
					{' · '}
					<Moment format={'YYYY.MM.DD'}>{boardArticle?.createdAt}</Moment>
					{' · '}
					{boardArticle?.articleViews ?? 0} views
					{' · '}
					{boardArticle?.articleComments ?? 0} comments
				</p>
			</div>
			<button
				type="button"
				onClick={(e) => likeArticleHandler?.(e, user, boardArticle?._id)}
				aria-pressed={liked}
				aria-label={liked ? 'Unlike article' : 'Like article'}
				className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-card border px-3 text-small font-medium transition-colors duration-150 ease-out ${
					liked
						? 'border-accent bg-accent text-white hover:bg-accent-hover'
						: 'border-line bg-card text-ink hover:border-accent hover:text-accent'
				}`}
			>
				<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill={liked ? 'currentColor' : 'none'}>
					<path
						d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinejoin="round"
					/>
				</svg>
				{boardArticle?.articleLikes ?? 0}
			</button>
		</article>
	);
};

export default CommunityCard;
