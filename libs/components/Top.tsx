import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { REACT_APP_API_URL } from '../config';
import { MemberType } from '../enums/member.enum';
import Logo from './ui/Logo';

interface NavItem {
	label: string;
	href: string;
	/** decides the active underline from the current pathname **/
	isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
	{ label: 'Track', href: '/shipment/detail', isActive: (p) => p === '/shipment/detail' },
	{ label: 'Shipments', href: '/shipment', isActive: (p) => p === '/shipment' },
	{ label: 'Carriers', href: '/carrier', isActive: (p) => p.startsWith('/carrier') },
	{ label: 'Community', href: '/community?articleCategory=FREE', isActive: (p) => p.startsWith('/community') },
];

const LANGUAGES = [
	{ code: 'en', label: 'EN' },
	{ code: 'kr', label: 'KR' },
	{ code: 'ru', label: 'RU' },
];

const Top = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [lang, setLang] = useState<string>('en');
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [accountOpen, setAccountOpen] = useState<boolean>(false);
	const accountRef = useRef<HTMLDivElement>(null);

	const isLoggedIn = Boolean(user?._id);
	// only shippers create shipments; guests are sent to log in first
	const canCreateShipment = !isLoggedIn || user?.memberType === MemberType.USER;
	const createShipmentHref = isLoggedIn ? '/mypage?category=addShipment' : '/account/join';
	const avatarSrc = user?.memberImage ? `${REACT_APP_API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg';

	/** LIFECYCLES **/
	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const stored = localStorage.getItem('locale');
		if (stored === null) localStorage.setItem('locale', 'en');
		setLang(stored ?? 'en');
	}, [router]);

	// close menus on navigation
	useEffect(() => {
		setMenuOpen(false);
		setAccountOpen(false);
	}, [router.asPath]);

	// account menu: close on outside click and Escape
	useEffect(() => {
		if (!accountOpen && !menuOpen) return;
		const onPointerDown = (e: PointerEvent) => {
			if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
		};
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setAccountOpen(false);
				setMenuOpen(false);
			}
		};
		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [accountOpen, menuOpen]);

	/** HANDLERS **/
	const langChangeHandler = async (e: ChangeEvent<HTMLSelectElement>) => {
		const locale = e.target.value;
		setLang(locale);
		localStorage.setItem('locale', locale);
		await router.push(router.asPath, router.asPath, { locale });
	};

	const navLinkClass = (active: boolean) =>
		`relative flex h-16 items-center text-[0.9375rem] font-medium transition-colors duration-150 ease-out ${
			active ? 'text-ink' : 'text-muted hover:text-ink'
		} after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent after:transition-opacity after:duration-150 ${
			active ? 'after:opacity-100' : 'after:opacity-0'
		}`;

	return (
		<header className="cd-ui sticky top-0 z-50 w-full border-b border-line bg-white">
			<div className="mx-auto flex h-16 max-w-page items-center gap-8 px-4 md:px-6">
				<Link href={'/'} className="shrink-0" aria-label="ChainDepo home">
					<Logo size={22} />
				</Link>

				{/* desktop nav */}
				<nav className="hidden h-16 items-center gap-7 md:flex" aria-label="Main">
					{NAV_ITEMS.map((item) => {
						const active = item.isActive(router.pathname);
						return (
							<Link
								key={item.href}
								href={item.href}
								className={navLinkClass(active)}
								aria-current={active ? 'page' : undefined}
							>
								{t(item.label)}
							</Link>
						);
					})}
				</nav>

				<div className="ml-auto flex items-center gap-3">
					<label className="sr-only" htmlFor="cd-lang">
						{t('Language')}
					</label>
					<select
						id="cd-lang"
						value={lang}
						onChange={langChangeHandler}
						className="hidden h-9 cursor-pointer rounded-card border border-transparent px-2 text-small font-medium text-muted transition-colors duration-150 ease-out hover:border-line hover:text-ink sm:block"
					>
						{LANGUAGES.map((item) => (
							<option key={item.code} value={item.code}>
								{item.label}
							</option>
						))}
					</select>

					{isLoggedIn ? (
						<div className="relative" ref={accountRef}>
							<button
								type="button"
								onClick={() => setAccountOpen((prev) => !prev)}
								aria-haspopup="menu"
								aria-expanded={accountOpen}
								aria-label={user?.memberNick ?? 'Account'}
								className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-line p-0 transition-transform duration-150 ease-out active:scale-95 motion-reduce:transition-none"
							>
								<img src={avatarSrc} alt="" className="h-full w-full object-cover" />
							</button>
							<div
								role="menu"
								className={`absolute right-0 top-11 w-48 origin-top-right rounded-card border border-line bg-white py-1 shadow-card transition duration-150 ease-out motion-reduce:transition-opacity ${
									accountOpen
										? 'visible scale-100 opacity-100'
										: 'invisible scale-95 opacity-0 motion-reduce:scale-100'
								}`}
							>
								<p className="m-0 truncate border-b border-line px-3 pb-2 pt-1.5 text-small leading-snug text-muted">
									{user?.memberNick}
								</p>
								<Link
									href={'/mypage'}
									role="menuitem"
									className="block px-3 py-2 text-[0.875rem] leading-snug text-ink transition-colors duration-150 hover:bg-surface"
								>
									{t('My Page')}
								</Link>
								<button
									type="button"
									role="menuitem"
									onClick={() => logOut()}
									className="block w-full px-3 py-2 text-left text-[0.875rem] leading-snug text-ink transition-colors duration-150 hover:bg-surface"
								>
									{t('Log out')}
								</button>
							</div>
						</div>
					) : (
						<Link
							href={'/account/join'}
							className="hidden h-9 items-center px-2 text-[0.9375rem] font-medium text-ink transition-colors duration-150 ease-out hover:text-accent sm:flex"
						>
							{t('Log in')}
						</Link>
					)}

					{canCreateShipment && (
						<Link
							href={createShipmentHref}
							className="hidden h-9 items-center rounded-card bg-accent px-4 text-[0.875rem] font-semibold text-white transition duration-150 ease-out hover:bg-accent-hover active:scale-[0.98] motion-reduce:transform-none md:flex"
						>
							{t('Create shipment')}
						</Link>
					)}

					{/* mobile menu toggle */}
					<button
						type="button"
						onClick={() => setMenuOpen((prev) => !prev)}
						aria-expanded={menuOpen}
						aria-controls="cd-mobile-menu"
						aria-label={t('Menu')}
						className="flex h-9 w-9 items-center justify-center rounded-card p-0 text-ink transition-colors duration-150 hover:bg-surface md:hidden"
					>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
							{menuOpen ? (
								<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
							) : (
								<path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
							)}
						</svg>
					</button>
				</div>
			</div>

			{/* mobile sheet: drops down from the header and goes back up the same way */}
			<div
				id="cd-mobile-menu"
				className={`absolute inset-x-0 top-full origin-top border-b border-line bg-white transition duration-150 ease-out motion-reduce:transition-opacity md:hidden ${
					menuOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0 motion-reduce:translate-y-0'
				}`}
			>
				<nav className="flex flex-col px-4 py-2" aria-label="Main mobile">
					{NAV_ITEMS.map((item) => {
						const active = item.isActive(router.pathname);
						return (
							<Link
								key={item.href}
								href={item.href}
								aria-current={active ? 'page' : undefined}
								className={`flex h-12 items-center border-b border-line text-body font-medium last:border-b-0 ${
									active ? 'text-accent' : 'text-ink'
								}`}
							>
								{t(item.label)}
							</Link>
						);
					})}
				</nav>
				<div className="flex flex-col gap-3 border-t border-line px-4 py-4">
					{canCreateShipment && (
						<Link
							href={createShipmentHref}
							className="flex h-11 items-center justify-center rounded-card bg-accent text-[0.9375rem] font-semibold text-white active:scale-[0.98] motion-reduce:transform-none"
						>
							{t('Create shipment')}
						</Link>
					)}
					<div className="flex items-center justify-between">
						{!isLoggedIn ? (
							<Link href={'/account/join'} className="text-[0.9375rem] font-medium text-ink">
								{t('Log in')}
							</Link>
						) : (
							<span className="text-small text-muted">{user?.memberNick}</span>
						)}
						<select
							aria-label={t('Language')}
							value={lang}
							onChange={langChangeHandler}
							className="h-9 rounded-card border border-line px-2 text-small font-medium text-ink"
						>
							{LANGUAGES.map((item) => (
								<option key={item.code} value={item.code}>
									{item.label}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Top;
