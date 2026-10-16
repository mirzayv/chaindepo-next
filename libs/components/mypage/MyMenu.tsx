import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert } from '../../sweetAlert';
import { MemberType } from '../../enums/member.enum';
import { labelOf } from '../../utils';

interface MenuItem {
	category: string;
	label: string;
}

/** My Page sections per member type (Favorites, Recently visited, Follow and Articles were Nestar leftovers) */
const SHIPMENT_ITEMS: Partial<Record<MemberType, MenuItem[]>> = {
	[MemberType.USER]: [
		{ category: 'addShipment', label: 'Create shipment' },
		{ category: 'myShipments', label: 'My shipments' },
	],
	[MemberType.CARRIER]: [
		{ category: 'availableShipments', label: 'Available shipments' },
		{ category: 'carrierShipments', label: 'Assigned shipments' },
	],
};

const itemClass = (active: boolean) =>
	`flex h-10 w-full items-center rounded-card px-3 text-small font-medium transition-colors duration-150 ease-out ${
		active ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-surface hover:text-accent'
	}`;

const MyMenu = () => {
	const router = useRouter();
	const category = (router.query?.category as string) ?? 'myProfile';
	const user = useReactiveVar(userVar);
	const shipmentItems = SHIPMENT_ITEMS[user?.memberType as MemberType] ?? [];

	/** HANDLERS **/
	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to log out?')) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	const renderItem = (item: MenuItem) => (
		<li key={item.category}>
			<Link
				href={{ pathname: '/mypage', query: { category: item.category } }}
				scroll={false}
				aria-current={category === item.category ? 'page' : undefined}
				className={itemClass(category === item.category)}
			>
				{item.label}
			</Link>
		</li>
	);

	return (
		<nav aria-label="My page" className="cd-ui flex w-full flex-col gap-5 p-4">
			<div className="flex items-center gap-3">
				<img
					src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
					alt=""
					className="block h-14 w-14 shrink-0 rounded-full border border-line bg-surface object-cover"
				/>
				<div className="flex min-w-0 flex-col gap-0.5">
					<span className="truncate text-[0.9375rem] font-semibold text-ink">{user?.memberNick}</span>
					{user?.memberPhone && <span className="text-small text-muted">{user.memberPhone}</span>}
					{user?.memberType === MemberType.ADMIN ? (
						<a href="/_admin/users" target="_blank" rel="noopener noreferrer" className="text-small font-medium text-accent hover:underline">
							Admin panel
						</a>
					) : (
						<span className="text-small text-muted">{user?.memberType === MemberType.USER ? 'Shipper' : labelOf(user?.memberType)}</span>
					)}
				</div>
			</div>

			{shipmentItems.length > 0 && (
				<div className="flex flex-col gap-1.5">
					<span className="px-3 text-small font-semibold text-muted">Shipments</span>
					<ul className="m-0 flex list-none flex-col gap-0.5 p-0">{shipmentItems.map(renderItem)}</ul>
				</div>
			)}

			<div className="flex flex-col gap-1.5">
				<span className="px-3 text-small font-semibold text-muted">Account</span>
				<ul className="m-0 flex list-none flex-col gap-0.5 p-0">
					{renderItem({ category: 'myProfile', label: 'My profile' })}
					<li>
						<button
							type="button"
							onClick={logoutHandler}
							className={`${itemClass(false)} cursor-pointer border-0 bg-transparent text-left`}
						>
							Log out
						</button>
					</li>
				</ul>
			</div>
		</nav>
	);
};

export default MyMenu;
