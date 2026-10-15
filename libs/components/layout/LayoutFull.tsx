import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import FloatingWidget from '../widget/FloatingWidget';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutFull = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		return (
			<>
				<Head>
					<title>ChainDepo</title>
					<meta name={'title'} content={`ChainDepo`} />
				</Head>
				{/* the wrapper id keeps the existing pc/mobile SCSS scopes working */}
				<Stack id={device == 'mobile' ? 'mobile-wrap' : 'pc-wrap'}>
					<Top />

					<Stack id={'main'}>
						<Component {...props} />
					</Stack>

					<FloatingWidget />

					<Footer />
				</Stack>
			</>
		);
	};
};

export default withLayoutFull;
