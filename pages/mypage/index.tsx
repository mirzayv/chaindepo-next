import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyShipments from '../../libs/components/mypage/MyShipments';
import AddShipment from '../../libs/components/mypage/AddNewShipment';
import CarrierShipments from '../../libs/components/mypage/CarrierShipments';
import AvailableShipments from '../../libs/components/mypage/AvailableShipments';
import MyProfile from '../../libs/components/mypage/MyProfile';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import MyMenu from '../../libs/components/mypage/MyMenu';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MyPage: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const category: any = router.query?.category ?? 'myProfile';

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user._id) router.push('/').then();
	}, [user]);

	if (device === 'mobile') {
		return <div>MY PAGE</div>;
	} else {
		return (
			<div id="my-page" style={{ position: 'relative' }}>
				<div className="container">
					<Stack className={'my-page'}>
						<Stack className={'back-frame'}>
							<Stack className={'left-config'}>
								<MyMenu />
							</Stack>
							<Stack className="main-config" mb={'76px'}>
								<Stack className={'list-config'}>
									{category === 'addShipment' && <AddShipment />}
									{category === 'myShipments' && <MyShipments />}
									{category === 'carrierShipments' && <CarrierShipments />}
									{category === 'availableShipments' && <AvailableShipments />}
									{category === 'myProfile' && <MyProfile />}
								</Stack>
							</Stack>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

export default withLayoutBasic(MyPage);
