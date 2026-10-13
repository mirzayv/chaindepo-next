import { NextPage } from 'next';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import PopularShipments from '../libs/components/homepage/PopularShipments';
import TopCarriers from '../libs/components/homepage/TopCarriers';
import Events from '../libs/components/homepage/Events';
import TrendShipments from '../libs/components/homepage/TrendShipments';
import TopShipments from '../libs/components/homepage/TopShipments';
import { Stack } from '@mui/material';
import Advertisement from '../libs/components/homepage/Advertisement';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'home-page'}>
				<TrendShipments />
				<PopularShipments />
				<Advertisement />
				<TopShipments />
				<TopCarriers />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<TrendShipments />
				<PopularShipments />
				<Advertisement />
				<TopShipments />
				<TopCarriers />
				<Events />
				<CommunityBoards />
			</Stack>
		);
	}
};

export default withLayoutMain(Home);
