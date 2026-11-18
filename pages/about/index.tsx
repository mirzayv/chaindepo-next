import React from 'react';
import { useTranslation } from 'next-i18next';
import { NextPage } from 'next';
import Link from 'next/link';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CHAINDEPO_CONTRACT, SEPOLIA_ADDRESS_URL } from '../../libs/config';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const POINTS = [
	{
		title: 'One code per shipment',
		text: 'The shipper creates a shipment and shares one tracking code. Anyone with the code can follow it, no account needed.',
	},
	{
		title: 'A chain of events',
		text: 'Each pickup, transit and delivery event is SHA-256 hashed together with the hash of the event before it, so past events cannot be changed without breaking the chain.',
	},
	{
		title: 'Anchored outside our database',
		text: 'Every event hash is written to a contract on Ethereum Sepolia. Anyone can compare the record on the page with the record on-chain.',
	},
];

const ROLES = [
	{ title: 'Shippers', text: 'Create shipments between Korean cities, set the price in KRW and share the tracking code.' },
	{ title: 'Carriers', text: 'Claim open shipments and log each pickup, transfer and delivery as it happens.' },
];

/** About ChainDepo (replaces the Nestar real-estate template page) */
const About: NextPage = () => {
	const { t } = useTranslation('common');
	return (
		<div className="cd-ui w-full bg-page">
			<section className="mx-auto flex max-w-page flex-col gap-4 px-4 py-14 md:px-6 md:py-20">
				<h1 className="m-0 max-w-3xl text-h2 font-bold text-ink md:text-[2.25rem] md:leading-tight">
					{t('Shipment tracking you can check yourself')}
				</h1>
				<p className="m-0 max-w-2xl text-body leading-relaxed text-muted">
					{t('ChainDepo tracks freight between Korean cities. Instead of asking you to trust our database, every tracking event is linked into a hash chain and anchored on Ethereum, so shippers, carriers and receivers all see the same record.')}
				</p>
			</section>

			<section className="w-full bg-surface">
				<ul className="mx-auto m-0 grid max-w-page list-none gap-4 px-4 py-14 md:grid-cols-3 md:px-6 md:py-16">
					{POINTS.map((point) => (
						<li key={point.title} className="flex flex-col gap-2 rounded-card border border-line bg-card p-5 md:p-6">
							<h2 className="m-0 text-h3 font-semibold text-ink">{t(point.title)}</h2>
							<p className="m-0 text-body text-muted">{t(point.text)}</p>
						</li>
					))}
				</ul>
			</section>

			<section className="mx-auto grid max-w-page gap-8 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20">
				<div className="flex flex-col gap-3">
					<h2 className="m-0 text-h2 font-semibold text-ink">{t('Two roles')}</h2>
					<p className="m-0 text-body text-muted">{t('You pick one when you sign up.')}</p>
				</div>
				<dl className="m-0 flex flex-col gap-4">
					{ROLES.map((role) => (
						<div key={role.title} className="border-t border-line pt-4">
							<dt className="text-h3 font-semibold text-ink">{t(role.title)}</dt>
							<dd className="m-0 mt-1 text-body text-muted">{t(role.text)}</dd>
						</div>
					))}
				</dl>
			</section>

			<section className="w-full border-t border-line bg-card">
				<div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-4 py-10 md:px-6">
					<div className="flex min-w-0 flex-col gap-1">
						<span className="text-small font-semibold text-ink">{t('Verification contract (Sepolia)')}</span>
						<a
							href={`${SEPOLIA_ADDRESS_URL}${CHAINDEPO_CONTRACT}`}
							target="_blank"
							rel="noopener noreferrer"
							className="break-all font-mono text-small text-accent hover:text-accent-hover hover:underline"
						>
							{CHAINDEPO_CONTRACT}
						</a>
					</div>
					<div className="flex flex-wrap gap-2">
						<Link
							href="/shipment"
							className="inline-flex h-10 items-center rounded-card bg-accent px-4 text-small font-semibold text-white transition-colors duration-150 ease-out hover:bg-accent-hover"
						>
							{t('Browse shipments')}
						</Link>
						<Link
							href="/cs?tab=faq"
							className="inline-flex h-10 items-center rounded-card border border-line bg-card px-4 text-small font-semibold text-ink transition-colors duration-150 ease-out hover:border-accent hover:text-accent"
						>
							{t('Read the FAQ')}
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default withLayoutBasic(About);
