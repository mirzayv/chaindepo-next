import React, { useEffect } from 'react';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import FloatingWidget from '../widget/FloatingWidget';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		return (
			<>
				<Head>
					<title>ChainDepo · Verified shipment tracking</title>
					<meta name={'title'} content={`ChainDepo`} />
				</Head>
				{/* always #pc-wrap: the page SCSS lives under it and handles small widths itself (mobile-wrap left phones unstyled) */}
				<Stack id={'pc-wrap'}>
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

export default withLayoutMain;
