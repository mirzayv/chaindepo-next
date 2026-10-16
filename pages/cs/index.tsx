import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const TABS = [
	{ id: 'notice', label: 'Notices' },
	{ id: 'faq', label: 'FAQ' },
];

/** Help center: static notices and FAQ (title band comes from LayoutBasic) */
const CS: NextPage = () => {
	const router = useRouter();
	const tab = router.query.tab === 'faq' ? 'faq' : 'notice';

	/** HANDLERS **/
	const changeTabHandler = (next: string) => {
		router.push({ pathname: '/cs', query: { tab: next } }, undefined, { scroll: false, shallow: true });
	};

	return (
		<div className="cd-ui w-full bg-surface">
			<div className="mx-auto flex max-w-[880px] flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
				<div role="tablist" aria-label="Help center sections" className="inline-flex gap-1 self-start rounded-card border border-line bg-white p-1">
					{TABS.map((item) => {
						const selected = item.id === tab;
						return (
							<button
								key={item.id}
								type="button"
								role="tab"
								aria-selected={selected}
								onClick={() => changeTabHandler(item.id)}
								className={`h-9 cursor-pointer rounded-[4px] border-0 px-4 text-small font-semibold transition-colors duration-150 ease-out ${
									selected ? 'bg-accent text-white' : 'bg-transparent text-ink hover:text-accent'
								}`}
							>
								{item.label}
							</button>
						);
					})}
				</div>

				{tab === 'notice' ? <Notice /> : <Faq />}
			</div>
		</div>
	);
};

export default withLayoutBasic(CS);
