import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import TrackForm from '../ui/TrackForm';

const HERO_VIDEO = '/video/hero.mp4';
const HERO_POSTER = '/video/hero-poster.jpg';
/** the video only plays on desktop widths with motion allowed; everyone else sees the poster */
const VIDEO_QUERY = '(min-width: 768px) and (prefers-reduced-motion: no-preference)';

/** full-bleed port video (poster on mobile / reduced motion) with a flat ink overlay and the tracking card on top */
const Hero = () => {
	const [playVideo, setPlayVideo] = useState<boolean>(false);

	/** LIFECYCLES **/
	useEffect(() => {
		const query = window.matchMedia(VIDEO_QUERY);
		const update = () => setPlayVideo(query.matches);
		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	}, []);

	return (
		<section className="relative isolate w-full overflow-hidden bg-muted">
			<Image src={HERO_POSTER} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
			{/* mounted only when it may play, so mobile never downloads the file */}
			{playVideo && (
				<video
					className="absolute inset-0 -z-20 h-full w-full object-cover"
					src={HERO_VIDEO}
					poster={HERO_POSTER}
					autoPlay
					muted
					loop
					playsInline
					preload="metadata"
					aria-hidden="true"
				/>
			)}
			{/* flat overlay for legibility, not a gradient */}
			<div className="absolute inset-0 -z-10 bg-navy/35" aria-hidden="true" />

			<div className="mx-auto grid max-w-page items-center gap-10 px-4 py-16 md:grid-cols-[1.15fr_1fr] md:px-6 md:py-28">
				<div className="flex max-w-xl flex-col gap-4">
					<h1 className="m-0 text-display font-bold text-white">Shipments you can verify.</h1>
					<p className="m-0 text-[1.0625rem] leading-relaxed text-white/90">
						Follow freight across Korea. Every tracking event is hash-chained and anchored on Ethereum, so
						anyone can check the record.
					</p>
				</div>

				<div className="w-full rounded-card border border-line bg-card p-5 shadow-card sm:p-6">
					<h2 className="m-0 mb-1 text-h3 font-semibold text-ink">Track a shipment</h2>
					<p className="m-0 mb-4 text-small text-muted">Enter the code you got from the shipper.</p>
					<TrackForm />
				</div>
			</div>
		</section>
	);
};

export default Hero;
