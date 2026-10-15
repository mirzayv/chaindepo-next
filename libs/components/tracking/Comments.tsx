import React, { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_COMMENTS } from '../../../apollo/user/query';
import { CREATE_COMMENT } from '../../../apollo/user/mutation';
import { Comment } from '../../types/comment/comment';
import { CommentsInquiry } from '../../types/comment/comment.input';
import { CommentGroup } from '../../enums/comment.enum';
import { Direction } from '../../enums/common.enum';
import { REACT_APP_API_URL } from '../../config';

interface CommentsProps {
	shipmentId: string | null;
}

const PAGE_SIZE = 5;
const MAX_LENGTH = 500;

const inquiryFor = (shipmentId: string | null, page = 1): CommentsInquiry => ({
	page,
	limit: PAGE_SIZE,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: { commentRefId: shipmentId ?? '' },
});

const Comments = ({ shipmentId }: CommentsProps) => {
	const user = useReactiveVar(userVar);
	const isLoggedIn = Boolean(user?._id);
	const [inquiry, setInquiry] = useState<CommentsInquiry>(inquiryFor(shipmentId));
	const [content, setContent] = useState<string>('');
	const [posting, setPosting] = useState<boolean>(false);
	const [postError, setPostError] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [createComment] = useMutation(CREATE_COMMENT);

	// the current inquiry is sent, and only once the id is known: an empty commentRefId caused a BSONError
	const { data, loading, refetch } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: inquiry },
		skip: !shipmentId || !inquiry.search.commentRefId,
	});

	/** LIFECYCLES **/
	useEffect(() => {
		setInquiry(inquiryFor(shipmentId));
	}, [shipmentId]);

	const comments: Comment[] = data?.getComments?.list ?? [];
	const total: number = data?.getComments?.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

	/** HANDLERS **/
	const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const text = content.trim();
		if (!text || !shipmentId || !isLoggedIn || posting) return;
		setPosting(true);
		setPostError('');
		try {
			await createComment({
				variables: { input: { commentGroup: CommentGroup.SHIPMENT, commentContent: text, commentRefId: shipmentId } },
			});
			setContent('');
			// newest first: go back to page 1 so the new comment is visible
			if (inquiry.page !== 1) setInquiry(inquiryFor(shipmentId));
			else await refetch({ input: inquiry });
		} catch (err: any) {
			setPostError(err.message ?? 'Could not post the comment.');
		} finally {
			setPosting(false);
		}
	};

	const goToPage = (page: number) => setInquiry({ ...inquiry, page });

	return (
		<section className="flex flex-col gap-5" aria-labelledby="comments-title">
			<h2 id="comments-title" className="m-0 text-h3 font-semibold text-ink">
				Comments ({total})
			</h2>

			{loading && comments.length === 0 ? (
				<div className="h-16 animate-pulse rounded-card bg-surface motion-reduce:animate-none" aria-busy="true" />
			) : comments.length === 0 ? (
				<p className="m-0 text-body text-muted">No comments yet.</p>
			) : (
				<ul className="m-0 flex list-none flex-col p-0">
					{comments.map((comment) => {
						const member = comment.memberData;
						const avatar = member?.memberImage
							? `${REACT_APP_API_URL}/${member.memberImage}`
							: '/img/profile/defaultUser.svg';
						const memberHref = member?._id === user?._id ? '/mypage' : `/member?memberId=${member?._id}`;
						return (
							<li key={comment._id} className="flex gap-3 border-b border-line py-4 first:pt-0 last:border-b-0">
								<img src={avatar} alt="" className="h-9 w-9 shrink-0 rounded-full border border-line object-cover" />
								<div className="flex min-w-0 flex-1 flex-col gap-1">
									<div className="flex flex-wrap items-baseline gap-x-2">
										<Link
											href={memberHref}
											className="text-[0.9375rem] font-semibold leading-snug text-ink transition-colors duration-150 hover:text-accent"
										>
											{member?.memberNick ?? 'Member'}
										</Link>
										<span className="text-small leading-snug text-muted">
											{moment(comment.createdAt).format('YYYY.MM.DD HH:mm')}
										</span>
									</div>
									<p className="m-0 whitespace-pre-line break-words text-[0.9375rem] leading-relaxed text-ink">
										{comment.commentContent}
									</p>
								</div>
							</li>
						);
					})}
				</ul>
			)}

			{pageCount > 1 && (
				<nav className="flex items-center gap-3" aria-label="Comment pages">
					<button
						type="button"
						onClick={() => goToPage(inquiry.page - 1)}
						disabled={inquiry.page <= 1}
						className="h-9 rounded-card border border-line px-3 text-small font-medium text-ink transition-colors duration-150 hover:border-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line"
					>
						← Newer
					</button>
					<span className="text-small leading-snug text-muted">
						Page {inquiry.page} of {pageCount}
					</span>
					<button
						type="button"
						onClick={() => goToPage(inquiry.page + 1)}
						disabled={inquiry.page >= pageCount}
						className="h-9 rounded-card border border-line px-3 text-small font-medium text-ink transition-colors duration-150 hover:border-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line"
					>
						Older →
					</button>
				</nav>
			)}

			{isLoggedIn ? (
				<form onSubmit={submitHandler} className="flex flex-col gap-2">
					<label htmlFor="comment-input" className="text-small font-medium text-ink">
						Add a comment
					</label>
					<textarea
						id="comment-input"
						value={content}
						onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
						rows={3}
						placeholder="Ask about this shipment or leave a note"
						className="w-full resize-y rounded-card border border-line bg-white px-3 py-2.5 text-[0.9375rem] leading-relaxed text-ink outline-none transition-colors duration-150 placeholder:text-muted/70 focus:border-accent"
					/>
					<div className="flex items-center justify-between gap-3">
						<span className="text-small leading-snug text-muted">
							{content.length}/{MAX_LENGTH}
						</span>
						<button
							type="submit"
							disabled={!content.trim() || posting}
							className="h-10 rounded-card bg-accent px-5 text-[0.875rem] font-semibold text-white transition duration-150 ease-out hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent motion-reduce:transform-none"
						>
							{posting ? 'Posting…' : 'Post comment'}
						</button>
					</div>
					{postError && (
						<p role="alert" className="m-0 text-small text-bad">
							{postError}
						</p>
					)}
				</form>
			) : (
				<p className="m-0 rounded-card border border-line bg-surface px-4 py-3 text-[0.9375rem] leading-snug text-muted">
					<Link href={'/account/join'} className="font-semibold text-accent hover:text-accent-hover">
						Log in
					</Link>{' '}
					to leave a comment.
				</p>
			)}
		</section>
	);
};

export default Comments;
