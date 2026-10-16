import React from 'react';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';
import { labelOf } from '../../utils';

interface MemberMenuProps {
	member: Member | null;
}

/** public member profile card (Follow / Followers / Articles were Nestar leftovers) */
const MemberMenu = ({ member }: MemberMenuProps) => {
	const role = member?.memberType === MemberType.USER ? 'Shipper' : labelOf(member?.memberType);

	return (
		<section aria-label="Member profile" className="cd-ui flex w-full flex-col gap-4 p-4">
			<div className="flex items-center gap-3">
				<img
					src={member?.memberImage ? `${REACT_APP_API_URL}/${member?.memberImage}` : '/img/profile/defaultUser.svg'}
					alt=""
					className="block h-14 w-14 shrink-0 rounded-full border border-line bg-surface object-cover object-top"
				/>
				<div className="flex min-w-0 flex-col gap-0.5">
					<h1 className="m-0 truncate text-[0.9375rem] font-semibold text-ink">{member?.memberNick}</h1>
					{role && <span className="text-small text-muted">{role}</span>}
				</div>
			</div>
			{member?.memberDesc && <p className="m-0 text-small leading-relaxed text-muted">{member.memberDesc}</p>}
			<dl className="m-0 grid grid-cols-2 gap-2">
				<div className="rounded-card border border-line px-3 py-2">
					<dt className="text-small text-muted">Shipments</dt>
					<dd className="m-0 text-[0.9375rem] font-semibold text-ink">{member?.memberShipments ?? 0}</dd>
				</div>
				<div className="rounded-card border border-line px-3 py-2">
					<dt className="text-small text-muted">Views</dt>
					<dd className="m-0 text-[0.9375rem] font-semibold text-ink">{member?.memberViews ?? 0}</dd>
				</div>
			</dl>
		</section>
	);
};

export default MemberMenu;
