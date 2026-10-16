import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useReactiveVar } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { userVar } from '../../apollo/store';

// the Toast UI editor touches window on import
const TuiEditor = dynamic(() => import('../../libs/components/community/Teditor'), { ssr: false });

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** new community post (was the "Write Article" tab in My Page) */
const CommunityWrite: NextPage = () => {
	const user = useReactiveVar(userVar);

	return (
		<div className="cd-ui w-full bg-surface">
			<div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<div>
						<h1 className="m-0 text-h2 font-semibold text-ink">Write a post</h1>
						<p className="m-0 mt-1 text-small text-muted">Share a question, a tip or news with shippers and carriers.</p>
					</div>
					<Link href="/community" className="text-small font-medium text-accent hover:text-accent-hover hover:underline">
						← Back to community
					</Link>
				</div>

				{user?._id ? (
					<div className="rounded-card border border-line bg-white p-4 md:p-6">
						<TuiEditor />
					</div>
				) : (
					<div className="rounded-card border border-line bg-white px-6 py-14 text-center">
						<p className="m-0 text-h3 font-semibold text-ink">Log in to write a post</p>
						<Link
							href="/account/join"
							className="mt-4 inline-flex h-10 items-center rounded-card bg-accent px-4 text-small font-semibold text-white transition-colors duration-150 ease-out hover:bg-accent-hover"
						>
							Log in
						</Link>
					</div>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(CommunityWrite);
