import React, { useState } from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack } from '@mui/material';
import MemberMenu from '../../libs/components/member/MemberMenu';
import MemberShipments from '../../libs/components/member/MemberShipments';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GET_MEMBER } from '../../apollo/user/query';
import { Member } from '../../libs/types/member/member';
import { MemberType } from '../../libs/enums/member.enum';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** public member page: profile, plus the shipments they created (shipper) or carry (carrier) */
const MemberPage: NextPage = () => {
	const router = useRouter();
	const { memberId } = router.query;
	const [member, setMember] = useState<Member | null>(null);

	/** APOLLO REQUESTS **/
	useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: memberId },
		skip: !memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMember(data?.getMember);
		},
	});

	const showShipments = member?.memberType === MemberType.USER || member?.memberType === MemberType.CARRIER;

	// same layout at every width; scss/pc/responsive.scss stacks it below 768px
	{
		return (
			<div id="member-page" style={{ position: 'relative' }}>
				<div className="container">
					<Stack className={'member-page'}>
						<Stack className={'back-frame'}>
							<Stack className={'left-config'}>
								<MemberMenu member={member} />
							</Stack>
							<Stack className="main-config" mb={'76px'}>
								<Stack className={'list-config'}>
									{showShipments && <MemberShipments byCarrier={member?.memberType === MemberType.CARRIER} />}
								</Stack>
							</Stack>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

export default withLayoutBasic(MemberPage);
