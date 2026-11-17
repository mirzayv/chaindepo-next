import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';
import Reveal from '../ui/Reveal';
import { useTranslation } from 'next-i18next';

type Audience = 'shippers' | 'carriers';

interface PathCard {
	label: string;
	title: string;
	text: string;
	cta: string;
	href: string;
	photo: string;
	/** colour wash over the top of the photo, behind the text */
	wash: string;
}

const TwoPaths = () => {
	const { t } = useTranslation('home');
	const user = useReactiveVar(userVar);
	const isLoggedIn = Boolean(user?._id);
	const [audience, setAudience] = useState<Audience>('shippers');

	// same rule as the header: only shippers create shipments, guests sign up first
	const shipHref = !isLoggedIn
		? '/account/join'
		: user?.memberType === MemberType.USER
		? '/mypage?category=addShipment'
		: '/shipment';
	const carrierHref = isLoggedIn && user?.memberType === MemberType.CARRIER ? '/mypage' : '/account/join';

	const cards: Record<Audience, PathCard[]> = {
		shippers: [
			{
				label: t('paths.ship.label'),
				title: t('paths.ship.title'),
				text: t('paths.ship.text'),
				cta: t('paths.ship.cta'),
				href: shipHref,
				photo: 'https://images.unsplash.com/photo-1449247666642-264389f5f5b1?w=1600&q=85',
				wash: 'from-[#2F7BFF] via-[#2F7BFF]/70 to-transparent',
			},
			{
				label: t('paths.public.label'),
				title: t('paths.public.title'),
				text: t('paths.public.text'),
				cta: t('paths.public.cta'),
				href: '/shipment/detail',
				photo: 'https://images.unsplash.com/photo-1695222833131-54ee679ae8e5?w=1600&q=85',
				wash: 'from-[#1E2A5A] via-[#1E2A5A]/70 to-transparent',
			},
		],
		carriers: [
			{
				label: t('paths.carrier.label'),
				title: t('paths.carrier.title'),
				text: t('paths.carrier.text'),
				cta: t('paths.carrier.cta'),
				href: carrierHref,
				photo: 'https://images.unsplash.com/photo-1494412685616-a5d310fbb07d?w=1600&q=85',
				wash: 'from-[#2F7BFF] via-[#2F7BFF]/70 to-transparent',
			},
			{
				label: t('paths.proof.label'),
				title: t('paths.proof.title'),
				text: t('paths.proof.text'),
				cta: t('paths.proof.cta'),
				href: '#how-it-works',
				photo: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=1600&q=85',
				wash: 'from-[#1E2A5A] via-[#1E2A5A]/70 to-transparent',
			},
		],
	};

	return (
		<section className="w-full bg-page">
			<div className="mx-auto max-w-[1440px] px-4 py-20 md:px-10 md:py-28">
				<Reveal className="flex flex-col items-center text-center">
					<h2 className="m-0 text-section font-extrabold text-ink">{t('paths.title')}</h2>
					<p className="m-0 mt-4 text-[1.1875rem] font-medium text-ink/75">
						{t('paths.sub')}
					</p>

					{/* segmented switch */}
					<div className="mt-10 inline-flex rounded-full bg-surface p-1.5" role="tablist" aria-label="Audience">
						{(['shippers', 'carriers'] as Audience[]).map((key) => (
							<button
								key={key}
								type="button"
								role="tab"
								aria-selected={audience === key}
								onClick={() => setAudience(key)}
								className={`h-12 min-w-[140px] rounded-full px-6 text-[1rem] font-medium transition-all duration-200 ${
									audience === key ? 'bg-card text-ink shadow-[0_1px_4px_rgba(0,0,0,0.08)]' : 'bg-transparent text-ink/70 hover:text-ink'
								}`}
							>
								{t(`paths.${key}`)}
							</button>
						))}
					</div>
				</Reveal>

				<div className="mt-12 grid gap-5 md:grid-cols-2">
					{cards[audience].map((card, i) => (
						<Reveal key={`${audience}-${card.title}`} delay={i * 120}>
							<Link
								href={card.href}
								className="group relative isolate flex h-[520px] flex-col overflow-hidden whitespace-normal rounded-[28px] p-8 text-white md:h-[640px] md:p-10"
							>
								<Image
									src={card.photo}
									alt=""
									fill
									quality={90}
									sizes="(min-width: 768px) 50vw, 100vw"
									className="-z-20 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
								/>
								<div className={`absolute inset-x-0 top-0 -z-10 h-[70%] bg-gradient-to-b ${card.wash}`} aria-hidden="true" />

								<span className="self-start rounded-full bg-white/20 px-3 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.06em] backdrop-blur-sm">
									{card.label}
								</span>
								<h3 className="m-0 mt-5 max-w-[440px] text-[clamp(1.75rem,2.6vw,2.375rem)] font-bold leading-[1.1] tracking-[-0.025em] text-white">
									{card.title}
								</h3>
								<p className="m-0 mt-3 max-w-[420px] text-[1.0625rem] font-medium leading-[1.45] text-white/85">
									{card.text}
								</p>
								<span className="mt-auto inline-flex h-12 items-center gap-2 self-start rounded-full bg-white px-6 text-[1rem] font-semibold text-ink transition duration-150 group-hover:gap-3">
									{card.cta}
									<span aria-hidden="true">→</span>
								</span>
							</Link>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
};

export default TwoPaths;
