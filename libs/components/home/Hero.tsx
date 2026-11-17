import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';
import TrackForm from '../ui/TrackForm';
import EthereumMark from '../ui/EthereumMark';
import ProofCard from './ProofCard';
import { CHAINDEPO_CONTRACT, SEPOLIA_ADDRESS_URL } from '../../config';
import { useTranslation } from 'next-i18next';

/** how long each slide stays, in ms */
const SLIDE_MS = 7000;

interface Slide {
	/** also the translation key: home:hero.<key>.title1 | title2 | text */
	key: 'track' | 'ship' | 'verify';
	photo: string;
	/** where the subject sits, so object-position keeps it in frame */
	focus: string;
}

const SLIDES: Slide[] = [
	{
		key: 'track',
		photo: 'https://images.unsplash.com/photo-1601467995997-ac1ae9a8fff4?w=2000&q=85',
		focus: '75% 65%',
	},
	{
		key: 'ship',
		photo: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=2000&q=85',
		focus: '70% 50%',
	},
	{
		key: 'verify',
		photo: 'https://images.unsplash.com/photo-1606185540834-d6e7483ee1a4?w=2000&q=85',
		focus: '78% 50%',
	},
];

/** pause button with a ring that fills while the current slide plays */
const ProgressPause = ({ playing, progress, onClick }: { playing: boolean; progress: number; onClick: () => void }) => {
	const { t } = useTranslation('home');
	const r = 24;
	const length = 2 * Math.PI * r;
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={playing ? t('hero.pause') : t('hero.play')}
			className="relative grid h-[52px] w-[52px] place-items-center rounded-full bg-transparent p-0 text-ink transition-transform duration-150 active:scale-95"
		>
			<svg className="absolute inset-0 -rotate-90" viewBox="0 0 52 52" aria-hidden="true">
				<circle cx="26" cy="26" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5" />
				<circle
					cx="26"
					cy="26"
					r={r}
					fill="none"
					stroke="currentColor"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeDasharray={length}
					strokeDashoffset={length * (1 - progress)}
				/>
			</svg>
			<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
				{playing ? (
					<path d="M3 2h2.6v10H3zM8.4 2H11v10H8.4z" fill="currentColor" />
				) : (
					<path d="M3.5 1.8 12 7l-8.5 5.2z" fill="currentColor" />
				)}
			</svg>
		</button>
	);
};

const ArrowButton = ({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) => {
	const { t } = useTranslation('home');
	return (
	<button
		type="button"
		onClick={onClick}
		aria-label={dir === 'prev' ? t('hero.prev') : t('hero.next')}
		className="grid h-[52px] w-[52px] place-items-center rounded-full border-[1.5px] border-ink/80 bg-transparent p-0 text-ink transition duration-150 hover:bg-ink hover:text-page active:scale-95"
	>
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path
				d={dir === 'prev' ? 'M10 3 5 8l5 5' : 'm6 3 5 5-5 5'}
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	</button>
	);
};

/**
 * Light hero carousel: big two-line headline on the left, a crisp full-height photo on the right,
 * slide controls (pause with progress ring, prev, next) bottom left and dots in the middle.
 */
const Hero = () => {
	const { t } = useTranslation('home');
	const user = useReactiveVar(userVar);
	const isLoggedIn = Boolean(user?._id);
	const createHref = !isLoggedIn
		? '/account/join'
		: user?.memberType === MemberType.USER
		? '/mypage?category=addShipment'
		: '/shipment';

	const [index, setIndex] = useState<number>(0);
	const [playing, setPlaying] = useState<boolean>(true);
	const [progress, setProgress] = useState<number>(0);
	const startRef = useRef<number>(0);
	const elapsedRef = useRef<number>(0);

	const go = useCallback((next: number) => {
		setIndex((next + SLIDES.length) % SLIDES.length);
		elapsedRef.current = 0;
		startRef.current = performance.now();
		setProgress(0);
	}, []);

	/** LIFECYCLES **/
	// no autoplay for visitors who ask for less motion
	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
	}, []);

	useEffect(() => {
		if (!playing) return;
		startRef.current = performance.now() - elapsedRef.current;
		let frame = 0;
		const tick = (now: number) => {
			const elapsed = now - startRef.current;
			elapsedRef.current = elapsed;
			if (elapsed >= SLIDE_MS) {
				go(index + 1);
				return;
			}
			setProgress(elapsed / SLIDE_MS);
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [playing, index, go]);

	const slide = SLIDES[index];

	return (
		<section
			className="relative isolate w-full overflow-hidden bg-hero"
			aria-roledescription="carousel"
			aria-label="ChainDepo highlights"
		>
			{/* photos: right side on desktop, top on mobile; crossfade between slides */}
			<div className="relative h-[300px] w-full sm:h-[380px] md:absolute md:inset-0 md:h-auto">
				{SLIDES.map((item, i) => (
					<div
						key={item.key}
						className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
							i === index ? 'opacity-100' : 'opacity-0'
						}`}
						aria-hidden={i !== index}
					>
						<Image
							src={item.photo}
							alt=""
							fill
							priority={i === 0}
							quality={90}
							sizes="100vw"
							className={`object-cover transition-transform duration-[7000ms] ease-linear motion-reduce:transition-none ${
								i === index ? 'scale-105' : 'scale-100'
							}`}
							style={{ objectPosition: item.focus }}
						/>
					</div>
				))}
				{/* full-bleed photo; the left side fades into the page colour so the headline stays crisp (desktop) */}
				<div
					className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-hero from-[30%] via-hero/80 via-[44%] to-transparent to-[66%] md:block"
					aria-hidden="true"
				/>
			</div>

			{/* proof card floating over the photo (large screens) */}
			<div className="pointer-events-none absolute inset-0 hidden lg:block">
				<div className="relative mx-auto h-full max-w-[1440px]">
					<ProofCard className="pointer-events-auto absolute bottom-28 right-10 animate-[cd-rise_800ms_ease-out] motion-reduce:animate-none" />
				</div>
			</div>

			<div className="relative mx-auto flex max-w-[1440px] flex-col px-4 pb-8 pt-10 md:min-h-[min(calc(100vh-76px),780px)] md:px-10 md:pb-10 md:pt-16">
				{/* the blockchain part, visible before anything else */}
				<a
					href={`${SEPOLIA_ADDRESS_URL}${CHAINDEPO_CONTRACT}`}
					target="_blank"
					rel="noreferrer"
					className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-card py-1.5 pl-1.5 pr-4 text-[0.875rem] font-semibold text-ink shadow-[0_1px_3px_rgba(19,20,22,0.08)] transition-colors duration-150 hover:text-accent"
				>
					<span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-white">
						<EthereumMark size={15} />
					</span>
					<span className="relative flex h-2 w-2" aria-hidden="true">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60 motion-reduce:animate-none" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
					</span>
					{t('badge')}
				</a>

				<div key={slide.key} className="flex max-w-[600px] flex-col gap-6 animate-[cd-rise_600ms_ease-out] motion-reduce:animate-none">
					<h1 className="m-0 text-display font-extrabold text-ink">
						{t(`hero.${slide.key}.title1`)}
						<br />
						{t(`hero.${slide.key}.title2`)}
					</h1>
					<p className="m-0 max-w-[520px] text-[1.1875rem] font-medium leading-[1.45] text-ink/80">{t(`hero.${slide.key}.text`)}</p>
				</div>

				<div className="mt-8 max-w-[560px]">
					{slide.key === 'track' ? (
						<TrackForm />
					) : (
						<Link
							href={slide.key === 'ship' ? createHref : '#how-it-works'}
							className="inline-flex h-14 items-center rounded-full bg-accent px-8 text-[1.0625rem] font-semibold text-white transition duration-150 hover:bg-accent-hover active:scale-[0.98] motion-reduce:transform-none"
						>
							{slide.key === 'ship' ? t('hero.createCta') : t('hero.howCta')}
						</Link>
					)}
				</div>

				{/* controls */}
				<div className="mt-10 flex items-center gap-3 md:mt-auto">
					<ProgressPause playing={playing} progress={progress} onClick={() => setPlaying((p) => !p)} />
					<ArrowButton dir="prev" onClick={() => go(index - 1)} />
					<ArrowButton dir="next" onClick={() => go(index + 1)} />
					<div className="ml-auto flex items-center gap-2 md:absolute md:bottom-12 md:left-1/2 md:ml-0 md:-translate-x-1/2">
						{SLIDES.map((item, i) => (
							<button
								key={item.key}
								type="button"
								onClick={() => go(i)}
								aria-label={`Slide ${i + 1}`}
								aria-current={i === index}
								className={`h-2 rounded-full p-0 transition-all duration-300 ${
									i === index ? 'w-6 bg-ink' : 'w-2 bg-ink/25 hover:bg-ink/50'
								}`}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
