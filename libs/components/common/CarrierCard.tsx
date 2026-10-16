import React from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { REACT_APP_API_URL } from '../../config';
import { userVar } from '../../../apollo/store';
import { Member } from '../../types/member/member';

interface CarrierCardProps {
	carrier: Member;
	likeMemberHandler?: any;
}

/** small carrier card: avatar, name, shipment count, views and a like toggle */
const CarrierCard = (props: CarrierCardProps) => {
	const { carrier, likeMemberHandler } = props;
	const user = useReactiveVar(userVar);
	const imagePath: string = carrier?.memberImage
		? `${REACT_APP_API_URL}/${carrier?.memberImage}`
		: '/img/profile/defaultUser.svg';
	const href = { pathname: '/carrier/detail', query: { carrierId: carrier?._id } };
	const liked = Boolean(carrier?.meLiked?.[0]?.myFavorite);
	const name = carrier?.memberFullName || carrier?.memberNick;

	return (
		<article className="flex items-center gap-4 rounded-card border border-line bg-white p-4 transition-colors duration-150 ease-out hover:border-accent">
			<Link href={href} className="shrink-0" aria-hidden="true" tabIndex={-1}>
				<img src={imagePath} alt="" className="block h-14 w-14 rounded-full border border-line bg-surface object-cover" />
			</Link>

			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<Link href={href} className="truncate text-[0.9375rem] font-semibold text-ink hover:text-accent">
					{name}
				</Link>
				<span className="text-small text-muted">
					Carrier · {carrier?.memberShipments ?? 0} shipment{carrier?.memberShipments === 1 ? '' : 's'}
				</span>
				<span className="text-small text-muted">{carrier?.memberViews ?? 0} views</span>
			</div>

			<button
				type="button"
				onClick={() => likeMemberHandler?.(user, carrier?._id)}
				aria-pressed={liked}
				aria-label={liked ? `Unlike ${name}` : `Like ${name}`}
				className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-card border px-3 text-small font-medium transition-colors duration-150 ease-out ${
					liked
						? 'border-accent bg-accent text-white hover:bg-accent-hover'
						: 'border-line bg-white text-ink hover:border-accent hover:text-accent'
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
				{carrier?.memberLikes ?? 0}
			</button>
		</article>
	);
};

export default CarrierCard;
