import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

/** page title band per route; routes without a title render no band **/
const PAGE_HEADINGS: Record<string, { title: string; desc: string }> = {
	'/shipment': { title: 'Shipments', desc: 'Browse shipments moving across Korea.' },
	'/carrier': { title: 'Carriers', desc: 'Carriers who move shipments on ChainDepo.' },
	'/carrier/detail': { title: 'Carrier', desc: '' },
	'/mypage': { title: 'My Page', desc: '' },
	'/community': { title: 'Community', desc: 'Questions, news and notes from shippers and carriers.' },
	'/community/detail': { title: 'Community', desc: '' },
	'/cs': { title: 'Help center', desc: 'Notices, FAQ and inquiries.' },
	'/account/join': { title: 'Log in or sign up', desc: '' },
	'/member': { title: 'Member', desc: '' },
};

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t } = useTranslation('common');
		const device = useDeviceDetect();

		const heading = useMemo(() => PAGE_HEADINGS[router.pathname] ?? { title: '', desc: '' }, [router.pathname]);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		return (
			<>
				<Head>
					<title>{heading.title ? `${t(heading.title)} · ChainDepo` : 'ChainDepo'}</title>
					<meta name={'title'} content={`ChainDepo`} />
				</Head>
				{/* the wrapper id keeps the existing pc/mobile SCSS scopes working */}
				<Stack id={device == 'mobile' ? 'mobile-wrap' : 'pc-wrap'}>
					<Top />

					{heading.title && (
						<section className="cd-ui w-full border-b border-line bg-surface">
							<div className="mx-auto flex max-w-page flex-col gap-2 px-4 py-8 md:px-6 md:py-10">
								<h1 className="m-0 text-h2 font-bold text-ink">{t(heading.title)}</h1>
								{heading.desc && <p className="m-0 text-body leading-normal text-muted">{t(heading.desc)}</p>}
							</div>
						</section>
					)}

					<Stack id={'main'}>
						<Component {...props} />
					</Stack>

					{device !== 'mobile' && <Chat />}

					<Footer />
				</Stack>
			</>
		);
	};
};

export default withLayoutBasic;
