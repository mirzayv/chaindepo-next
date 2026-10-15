import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';

interface PathCard {
	title: string;
	text: string;
	cta: string;
	href: string;
	photo: string;
}

const TwoPaths = () => {
	const user = useReactiveVar(userVar);
	const isLoggedIn = Boolean(user?._id);

	// same rule as the header: only shippers create shipments, guests sign up first
	const shipHref = !isLoggedIn
		? '/account/join'
		: user?.memberType === MemberType.USER
		? '/mypage?category=addShipment'
		: '/shipment';
	const carrierHref = isLoggedIn && user?.memberType === MemberType.CARRIER ? '/mypage' : '/account/join';

	const cards: PathCard[] = [
		{
			title: 'Ship with us',
			text: 'Post a shipment, pick a carrier and share one tracking code with your customer.',
			cta: 'Create a shipment',
			href: shipHref,
			photo: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=1200&q=80',
		},
		{
			title: 'Become a carrier',
			text: 'Take on shipments between Korean cities and log each pickup, transfer and delivery.',
			cta: 'Join as a carrier',
			href: carrierHref,
			photo: 'https://images.unsplash.com/photo-1761539125425-01dc98be9547?w=1200&q=80',
		},
	];

	return (
		<section className="w-full bg-white">
			<div className="mx-auto grid max-w-page gap-6 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20">
				{cards.map((card) => (
					<Link
						key={card.title}
						href={card.href}
						className="group flex flex-col overflow-hidden whitespace-normal rounded-card border border-line bg-white text-ink transition-colors duration-150 ease-out hover:border-accent"
					>
						<div className="relative aspect-[16/9] w-full bg-surface">
							<Image src={card.photo} alt="" fill sizes="(min-width: 768px) 600px, 100vw" className="object-cover" />
						</div>
						<div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
							<h2 className="m-0 text-h2 font-semibold text-ink">{card.title}</h2>
							<p className="m-0 text-body text-muted">{card.text}</p>
							<span className="mt-2 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold leading-snug text-accent transition-colors duration-150 group-hover:text-accent-hover">
								{card.cta}
								<span
									aria-hidden="true"
									className="transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none"
								>
									→
								</span>
							</span>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
};

export default TwoPaths;
