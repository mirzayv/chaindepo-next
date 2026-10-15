import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import Hero from '../libs/components/home/Hero';
import TwoPaths from '../libs/components/home/TwoPaths';
import HowItWorks from '../libs/components/home/HowItWorks';
import RecentShipments from '../libs/components/home/RecentShipments';
import ShipmentTypes from '../libs/components/home/ShipmentTypes';
import KoreaNetwork from '../libs/components/home/KoreaNetwork';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	return (
		<div className="cd-ui w-full bg-white">
			<Hero />
			<TwoPaths />
			<HowItWorks />
			<RecentShipments />
			<ShipmentTypes />
			<KoreaNetwork />
		</div>
	);
};

export default withLayoutMain(Home);
