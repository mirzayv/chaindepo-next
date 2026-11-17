import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { REACT_APP_API_URL } from '../config';
import { MemberType } from '../enums/member.enum';
import Logo from './ui/Logo';
import ThemeToggle from './ui/ThemeToggle';
import LanguageMenu, { LanguageOption } from './ui/LanguageMenu';

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

interface AccountLink {
	label: string;
	/** My Page tab (pages/mypage/index.tsx `category`); undefined = My Page default */
	category?: string;
}

/** the one role-based quick link shown in the navbar (admins and guests get none) */
const ROLE_NAV_LINK: Partial<Record<MemberType, AccountLink>> = {
	[MemberType.USER]: { label: 'My shipments', category: 'myShipments' },
	[MemberType.CARRIER]: { label: 'My deliveries', category: 'carrierShipments' },
};

const ROLE_LABEL: Record<MemberType, string> = {
	[MemberType.USER]: 'Shipper',
	[MemberType.CARRIER]: 'Carrier',
	[MemberType.ADMIN]: 'Admin',
};

/** account menu items (avatar dropdown on desktop, account block in the mobile menu) */
const accountLinksFor = (type?: string): AccountLink[] => {
	const roleLink = ROLE_NAV_LINK[type as MemberType];
	return [
		{ label: 'My page' },
		...(roleLink ? [roleLink] : []),
		...(type === MemberType.CARRIER ? [{ label: 'Available shipments', category: 'availableShipments' }] : []),
		{ label: 'My profile', category: 'myProfile' },
	];
};

const myPageHref = (link: AccountLink) => (link.category ? `/mypage?category=${link.category}` : '/mypage');

const LANGUAGES: LanguageOption[] = [
	{ code: 'en', label: 'EN', name: 'English' },
	{ code: 'kr', label: 'KR', name: '한국어' },
	{ code: 'ru', label: 'RU', name: 'Русский' },
];

const Top = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [lang, setLang] = useState<string>('en');
	const [menuOpen, setMenuOpen] = useState<boolean>(false);
	const [accountOpen, setAccountOpen] = useState<boolean>(false);
	const [portalReady, setPortalReady] = useState<boolean>(false);
	/** where the portalled account dropdown sits: under the avatar, right-aligned to it */
	const [accountPos, setAccountPos] = useState<{ top: number; right: number }>({ top: 64, right: 16 });
	const accountRef = useRef<HTMLDivElement>(null);
	const accountMenuRef = useRef<HTMLDivElement>(null);

	const isLoggedIn = Boolean(user?._id);
	const roleNavLink = isLoggedIn ? ROLE_NAV_LINK[user?.memberType as MemberType] : undefined;
	const accountLinks = accountLinksFor(user?.memberType);
	const roleLabel = ROLE_LABEL[user?.memberType as MemberType] ?? '';
	const isMyPageTab = (category: string) => router.pathname === '/mypage' && router.query.category === category;
	// only shippers create shipments; guests are sent to log in first
	const canCreateShipment = !isLoggedIn || user?.memberType === MemberType.USER;
	const createShipmentHref = isLoggedIn ? '/mypage?category=addShipment' : '/account/join';
	const avatarSrc = user?.memberImage ? `${REACT_APP_API_URL}/${user.memberImage}` : '/img/profile/defaultUser.svg';

	/** LIFECYCLES **/
	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	// the menu shows the language the page is actually in (the URL locale), and remembers it
	useEffect(() => {
		const locale = router.locale ?? 'en';
		localStorage.setItem('locale', locale);
		setLang(locale);
	}, [router.locale]);

	// the mobile menu is portalled to <body>, which only exists after mount
	useEffect(() => {
		setPortalReady(true);
	}, []);

	// close menus on navigation
	useEffect(() => {
		setMenuOpen(false);
		setAccountOpen(false);
	}, [router.asPath]);

	// full-screen mobile menu: the page behind must not scroll
	useEffect(() => {
		if (!menuOpen) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	}, [menuOpen]);

	// crossing the md breakpoint: the mobile menu would keep the scroll lock, the dropdown its old position
	useEffect(() => {
		const media = window.matchMedia('(min-width: 768px)');
		const onChange = (e: MediaQueryListEvent) => {
			if (e.matches) setMenuOpen(false);
			else setAccountOpen(false);
		};
		media.addEventListener('change', onChange);
		window.addEventListener('resize', closeAccount);
		return () => {
			media.removeEventListener('change', onChange);
			window.removeEventListener('resize', closeAccount);
		};
	}, []);

	// account menu: close on outside click and Escape (the dropdown is portalled, so check both nodes)
	useEffect(() => {
		if (!accountOpen && !menuOpen) return;
		const onPointerDown = (e: PointerEvent) => {
			const target = e.target as Node;
			if (accountRef.current?.contains(target) || accountMenuRef.current?.contains(target)) return;
			setAccountOpen(false);
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
	// links close the menu themselves too: a link to the current page does not change the route
	const closeMenu = () => setMenuOpen(false);
	const closeAccount = () => setAccountOpen(false);

	/** desktop: small dropdown under the avatar; mobile: the same items in the full-screen menu */
	const avatarClickHandler = () => {
		if (!window.matchMedia('(min-width: 768px)').matches) {
			setMenuOpen(true);
			return;
		}
		const rect = accountRef.current?.getBoundingClientRect();
		if (rect) setAccountPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
		setAccountOpen((prev) => !prev);
	};

	const langChangeHandler = async (locale: string) => {
		setLang(locale);
		localStorage.setItem('locale', locale);
		await router.push(router.asPath, router.asPath, { locale });
	};

	const navLinkClass = (active: boolean) =>
		`relative flex h-[76px] items-center text-[1rem] font-medium tracking-[-0.01em] text-ink transition-opacity duration-150 ease-out ${
			active ? "opacity-100" : "opacity-70 hover:opacity-100"
		} after:absolute after:inset-x-0 after:bottom-[22px] after:h-[2px] after:rounded-full after:bg-accent after:transition-opacity after:duration-150 ${
			active ? "after:opacity-100" : "after:opacity-0"
		}`;

	return (
		<header className="cd-ui sticky top-0 z-50 w-full bg-page/90 backdrop-blur-md">
			<div className="mx-auto flex h-[76px] max-w-[1440px] items-center gap-8 px-4 md:px-10">
				<Link href={"/"} className="shrink-0 md:flex md:flex-1" aria-label="ChainDepo home">
					<Logo size={28} />
				</Link>

				{/* desktop nav */}
				<nav className="hidden h-[76px] shrink-0 items-center justify-center gap-10 md:flex" aria-label="Main">
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
					{roleNavLink?.category && (
						<Link
							href={myPageHref(roleNavLink)}
							className={navLinkClass(isMyPageTab(roleNavLink.category))}
							aria-current={isMyPageTab(roleNavLink.category) ? 'page' : undefined}
						>
							{t(roleNavLink.label)}
						</Link>
					)}
				</nav>

				<div className="ml-auto flex items-center justify-end gap-3 md:ml-0 md:flex-1">
					<LanguageMenu
						value={lang}
						options={LANGUAGES}
						onChange={langChangeHandler}
						label={t('Language')}
						className="hidden sm:block"
					/>

					<ThemeToggle className="hidden md:flex" />

					{isLoggedIn ? (
						<div className="relative" ref={accountRef}>
							<button
								type="button"
								onClick={avatarClickHandler}
								aria-haspopup="menu"
								aria-expanded={accountOpen}
								aria-controls="cd-account-menu"
								aria-label={user?.memberNick ?? 'Account'}
								className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-line p-0 transition-transform duration-150 ease-out active:scale-95 motion-reduce:transition-none"
							>
								<img src={avatarSrc} alt="" className="h-full w-full object-cover object-top" />
							</button>
						</div>
					) : (
						<Link
							href={'/account/join'}
							className="hidden h-11 items-center px-2 text-[1rem] font-medium text-ink transition-opacity duration-150 ease-out hover:opacity-70 sm:flex"
						>
							{t('Log in')}
						</Link>
					)}

					{canCreateShipment && (
						<Link
							href={createShipmentHref}
							className="hidden h-11 shrink-0 items-center whitespace-nowrap rounded-full border-[1.5px] border-ink px-5 text-[1rem] font-medium text-ink transition duration-150 ease-out hover:bg-ink hover:text-page active:scale-[0.98] motion-reduce:transform-none md:flex"
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

			{/*
			 * mobile menu: full-screen overlay, portalled to <body> so no stacking context (sticky header,
			 * Leaflet panes/controls up to z 1000) can sit on top of it
			 */}
			{/* desktop account dropdown: portalled + fixed so it sits above Leaflet (z 1300), like the mobile menu */}
			{portalReady &&
				isLoggedIn &&
				createPortal(
					<div
						ref={accountMenuRef}
						id="cd-account-menu"
						role="menu"
						aria-label="Account"
						style={{ top: accountPos.top, right: accountPos.right }}
						className={`cd-ui fixed z-[1300] hidden w-56 origin-top-right rounded-card border border-line bg-card py-1 shadow-card transition duration-150 ease-out motion-reduce:transition-opacity md:block ${
							accountOpen ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0 motion-reduce:scale-100'
						}`}
					>
						<div className="border-b border-line px-3 pb-2 pt-1.5">
							<p className="m-0 truncate text-[0.875rem] font-semibold leading-snug text-ink">{user?.memberNick}</p>
							{roleLabel && <p className="m-0 text-small leading-snug text-muted">{roleLabel}</p>}
						</div>
						{accountLinks.map((link) => (
							<Link
								key={link.label}
								href={myPageHref(link)}
								role="menuitem"
								onClick={closeAccount}
								className="block px-3 py-2 text-[0.875rem] leading-snug text-ink transition-colors duration-150 hover:bg-surface"
							>
								{t(link.label)}
							</Link>
						))}
						<button
							type="button"
							role="menuitem"
							onClick={() => logOut()}
							className="block w-full border-t border-line px-3 py-2 text-left text-[0.875rem] leading-snug text-ink transition-colors duration-150 hover:bg-surface"
						>
							{t('Log out')}
						</button>
					</div>,
					document.body,
				)}

			{portalReady &&
				createPortal(
					<div
						id="cd-mobile-menu"
						role="dialog"
						aria-modal="true"
						aria-label={t('Menu')}
						aria-hidden={!menuOpen}
						className={`cd-ui fixed inset-0 z-[1300] flex flex-col overflow-y-auto bg-page transition-opacity duration-150 ease-out md:hidden ${
							menuOpen ? 'visible opacity-100' : 'invisible opacity-0'
						}`}
					>
						<div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
							<Link href={'/'} aria-label="ChainDepo home" onClick={closeMenu}>
								<Logo size={22} />
							</Link>
							<button
								type="button"
								onClick={closeMenu}
								aria-label="Close menu"
								className="flex h-9 w-9 items-center justify-center rounded-card p-0 text-ink transition-colors duration-150 hover:bg-surface"
							>
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
									<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
								</svg>
							</button>
						</div>

						<nav className="flex flex-col px-4 py-2" aria-label="Main mobile">
							{NAV_ITEMS.map((item) => {
								const active = item.isActive(router.pathname);
								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={closeMenu}
										aria-current={active ? 'page' : undefined}
										className={`flex h-12 items-center border-b border-line text-body font-medium last:border-b-0 ${
											active ? 'text-accent' : 'text-ink'
										}`}
									>
										{t(item.label)}
									</Link>
								);
							})}
							{roleNavLink?.category && (
								<Link
									href={myPageHref(roleNavLink)}
									onClick={closeMenu}
									aria-current={isMyPageTab(roleNavLink.category) ? 'page' : undefined}
									className={`flex h-12 items-center text-body font-medium ${
										isMyPageTab(roleNavLink.category) ? 'text-accent' : 'text-ink'
									}`}
								>
									{t(roleNavLink.label)}
								</Link>
							)}
						</nav>

						{/* account: the avatar opens this menu on mobile instead of a dropdown */}
						{isLoggedIn && (
							<div role="group" className="flex flex-col border-t border-line px-4 py-2" aria-label="Account">
								<div className="flex items-center gap-3 py-2">
									<img
										src={avatarSrc}
										alt=""
										className="h-9 w-9 shrink-0 rounded-full border border-line object-cover object-top"
									/>
									<div className="flex min-w-0 flex-col">
										<span className="truncate text-[0.9375rem] font-semibold text-ink">{user?.memberNick}</span>
										{roleLabel && <span className="text-small text-muted">{roleLabel}</span>}
									</div>
								</div>
								{accountLinks.map((link) => (
									<Link
										key={link.label}
										href={myPageHref(link)}
										onClick={closeMenu}
										className="flex h-11 items-center text-[0.9375rem] text-ink"
									>
										{t(link.label)}
									</Link>
								))}
								<button
									type="button"
									onClick={() => logOut()}
									className="flex h-11 items-center p-0 text-left text-[0.9375rem] text-ink"
								>
									{t('Log out')}
								</button>
							</div>
						)}

						<div className="flex flex-col gap-3 border-t border-line px-4 py-4">
							{canCreateShipment && (
								<Link
									href={createShipmentHref}
									onClick={closeMenu}
									className="flex h-12 items-center justify-center rounded-full bg-accent text-[1rem] font-semibold text-white active:scale-[0.98] motion-reduce:transform-none"
								>
									{t('Create shipment')}
								</Link>
							)}
							<div className="flex items-center justify-between">
								{!isLoggedIn ? (
									<Link href={'/account/join'} onClick={closeMenu} className="text-[0.9375rem] font-medium text-ink">
										{t('Log in')}
									</Link>
								) : (
									<span aria-hidden="true" />
								)}
								<div className="flex items-center gap-2">
									<ThemeToggle />
									<LanguageMenu
										value={lang}
										options={LANGUAGES}
										onChange={langChangeHandler}
										label={t('Language')}
										placement="up"
									/>
								</div>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</header>
	);
};

export default Top;
