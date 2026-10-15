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
		<section className="w-full bg-surface">
			<div className="mx-auto max-w-page px-4 py-14 md:px-6 md:py-20">
				{/* the page's single uppercase label */}
				<p className="m-0 mb-3 text-small font-semibold uppercase tracking-[0.08em] text-accent">How it works</p>
				<h2 className="m-0 max-w-2xl text-h2 font-semibold text-ink">
					A tracking record that can't be quietly rewritten
				</h2>

				<ol className="m-0 mt-10 grid list-none gap-4 p-0 md:grid-cols-3 md:gap-6">
					{STEPS.map((step, index) => (
						<li key={step.title} className="flex flex-col gap-3 rounded-card border border-line bg-white p-5 md:p-6">
							<span
								className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-small font-semibold leading-none text-accent"
								aria-hidden="true"
							>
								{index + 1}
							</span>
							<h3 className="m-0 text-h3 font-semibold text-ink">{step.title}</h3>
							<p className="m-0 text-body text-muted">{step.text}</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
};

export default HowItWorks;
