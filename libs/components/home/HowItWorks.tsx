import React from 'react';

const STEPS = [
	{
		title: 'Create',
		text: 'The shipper posts the shipment and gets a tracking code to share.',
	},
	{
		title: 'Track',
		text: 'Every carrier update is SHA-256 hashed and linked to the hash of the event before it.',
	},
	{
		title: 'Verify',
		text: 'Each event hash is anchored on Ethereum Sepolia, so anyone can re-check the chain.',
	},
];

const HowItWorks = () => {
	return (
		// the page's one dark band: flat navy, no gradient
		<section className="w-full bg-ink">
			<div className="mx-auto max-w-page px-4 py-14 md:px-6 md:py-20">
				{/* the page's single uppercase label */}
				<p className="m-0 mb-3 text-small font-semibold uppercase tracking-[0.08em] text-white/70">How it works</p>
				<h2 className="m-0 max-w-2xl text-h2 font-semibold text-white">
					A tracking record that can't be quietly rewritten
				</h2>

				<ol className="m-0 mt-10 grid list-none gap-8 p-0 md:grid-cols-3 md:gap-10">
					{STEPS.map((step, index) => (
						<li key={step.title} className="flex flex-col gap-3 border-t border-white/15 pt-6">
							<span className="text-[2rem] font-bold leading-none text-accent" aria-hidden="true">
								{String(index + 1).padStart(2, '0')}
							</span>
							<h3 className="m-0 text-h3 font-semibold text-white">{step.title}</h3>
							<p className="m-0 text-body text-white/75">{step.text}</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
};

export default HowItWorks;
