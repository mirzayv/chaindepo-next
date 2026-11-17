import React from 'react';
import ChainScene from './ChainScene';
import { useTranslation } from 'next-i18next';

/** translation keys in home:how */
const STEPS = ['create', 'track', 'verify'];

const HowItWorks = () => {
	const { t } = useTranslation('home');
	return (
		// the page's one contrast band: near-black with a live 3D hash chain
		<section id="how-it-works" className="w-full scroll-mt-[76px] bg-[#0A0B0D]">
			<div className="mx-auto max-w-page px-4 pt-16 md:px-6 md:pt-24">
				<h2 className="m-0 mx-auto max-w-4xl text-center text-[clamp(2.25rem,5.5vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-white">
					{t('how.title')}
				</h2>
				<p className="m-0 mx-auto mt-5 max-w-xl text-center text-body text-white/60">
					{t('how.sub')}
				</p>
			</div>

			<ChainScene className="block h-[200px] w-full sm:h-[320px] md:h-[56vh] md:min-h-[420px]" />

			<div className="mx-auto max-w-page px-4 pb-16 md:px-6 md:pb-24">
				<ol className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
					{STEPS.map((step, index) => (
						<li
							key={step}
							className="flex flex-col gap-3 rounded-[24px] bg-white/[0.06] p-7 transition-colors duration-150 hover:bg-white/[0.09]"
						>
							<span className="text-[2rem] font-bold leading-none text-accent" aria-hidden="true">
								{String(index + 1).padStart(2, '0')}
							</span>
							<h3 className="m-0 text-[1.375rem] font-bold tracking-[-0.01em] text-white">{t(`how.${step}.title`)}</h3>
							<p className="m-0 text-body text-white/65">{t(`how.${step}.text`)}</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
};

export default HowItWorks;
