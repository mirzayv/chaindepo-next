import React from 'react';
import Image from 'next/image';
import TrackForm from '../ui/TrackForm';

const HERO_PHOTO = 'https://images.unsplash.com/photo-1603123041052-8e02cacaa54e?w=2000&q=80';

/** full-bleed port photo with a flat ink overlay and the tracking card on top */
const Hero = () => {
	return (
		<section className="relative isolate w-full overflow-hidden bg-muted">
			<Image src={HERO_PHOTO} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
			{/* flat overlay for legibility, not a gradient */}
			<div className="absolute inset-0 -z-10 bg-ink/35" aria-hidden="true" />

			<div className="mx-auto grid max-w-page items-center gap-10 px-4 py-16 md:grid-cols-[1.15fr_1fr] md:px-6 md:py-28">
				<div className="flex max-w-xl flex-col gap-4">
					<h1 className="m-0 text-display font-bold text-white">Shipments you can verify.</h1>
					<p className="m-0 text-[1.0625rem] leading-relaxed text-white/90">
						Follow freight across Korea. Every tracking event is hash-chained and anchored on Ethereum, so
						anyone can check the record.
					</p>
				</div>

				<div className="w-full rounded-card border border-line bg-white p-5 shadow-card sm:p-6">
					<h2 className="m-0 mb-1 text-h3 font-semibold text-ink">Track a shipment</h2>
					<p className="m-0 mb-4 text-small text-muted">Enter the code you got from the shipper.</p>
					<TrackForm />
				</div>
			</div>
		</section>
	);
};

export default Hero;
