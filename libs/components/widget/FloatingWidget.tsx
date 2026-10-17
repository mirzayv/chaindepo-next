import React, { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import useCommunityChat, { ChatMessage } from '../../hooks/useCommunityChat';

type WidgetTab = 'assistant' | 'chat';

const TABS: { id: WidgetTab; label: string }[] = [
	{ id: 'assistant', label: 'Assistant' },
	{ id: 'chat', label: 'Community chat' },
];

/**
 * One floating button (bottom right) that opens one panel with two tabs:
 * "Assistant" (placeholder until the AI phase) and "Community chat" (the existing WebSocket chat).
 * Always mounted, so chat messages keep arriving while the panel is closed.
 */
const FloatingWidget = () => {
	const user = useReactiveVar(userVar);
	const [open, setOpen] = useState<boolean>(false);
	const [tab, setTab] = useState<WidgetTab>('assistant');
	const [unread, setUnread] = useState<number>(0);
	const [draft, setDraft] = useState<string>('');
	const panelRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const listEndRef = useRef<HTMLDivElement>(null);
	// read inside the socket callback without re-binding it on every open/tab change
	const viewingChatRef = useRef<boolean>(false);
	viewingChatRef.current = open && tab === 'chat';

	const onNewMessage = useCallback(() => {
		if (!viewingChatRef.current) setUnread((prev) => prev + 1);
	}, []);

	const { messages, onlineUsers, sendMessage } = useCommunityChat({ onNewMessage });
	const isLoggedIn = Boolean(user?._id);

	/** LIFECYCLES **/
	useEffect(() => {
		if (open && tab === 'chat') setUnread(0);
	}, [open, tab]);

	// keep the newest message in view while the chat tab is visible
	useEffect(() => {
		if (open && tab === 'chat') listEndRef.current?.scrollIntoView({ block: 'end' });
	}, [messages.length, open, tab]);

	// Escape closes the panel and returns focus to the button
	useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: globalThis.KeyboardEvent) => {
			if (e.key === 'Escape') closePanel();
		};
		document.addEventListener('keydown', onKeyDown);
		panelRef.current?.focus();
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [open]);

	// mobile full-screen panel: the page behind must not scroll (it would also move the iOS toolbar)
	useEffect(() => {
		if (!open || window.matchMedia('(min-width: 640px)').matches) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	}, [open]);

	/** HANDLERS **/
	const closePanel = () => {
		setOpen(false);
		buttonRef.current?.focus();
	};

	const tabKeyHandler = (e: KeyboardEvent<HTMLButtonElement>) => {
		if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
		e.preventDefault();
		setTab((prev) => (prev === 'assistant' ? 'chat' : 'assistant'));
	};

	const submitHandler = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (sendMessage(draft)) setDraft('');
	};

	const avatarOf = (message: ChatMessage) =>
		message.memberData?.memberImage
			? `${REACT_APP_API_URL}/${message.memberData.memberImage}`
			: '/img/profile/defaultUser.svg';

	return (
		<div className="cd-ui">
			{/*
			 * Mobile backdrop: the panel is 100dvh (input stays above the iOS toolbar), but iOS Safari draws
			 * its translucent toolbar over the strip below that. This solid layer is sized to the *large*
			 * viewport (100lvh, toolbar retracted), so it extends under the toolbar and the page never shows.
			 */}
			<div
				aria-hidden="true"
				className={`fixed inset-x-0 top-0 z-[1300] h-screen bg-card supports-[height:100lvh]:h-[100lvh] sm:hidden ${
					open ? 'block' : 'hidden'
				}`}
			/>
			{/*
			 * PANEL. Mobile (<640px): full screen, 100dvh so the iOS Safari toolbar never covers the input.
			 * Desktop: grows out of the button corner and shrinks back into it.
			 * z 1300: above the sticky header (50) and Leaflet panes/controls (up to ~1000).
			 */}
			<div
				ref={panelRef}
				id="cd-widget-panel"
				role="dialog"
				aria-label="Assistant and community chat"
				aria-hidden={!open}
				tabIndex={-1}
				className={`fixed inset-0 z-[1300] flex h-[100dvh] flex-col overflow-hidden bg-card outline-none transition duration-150 ease-out motion-reduce:transform-none motion-reduce:transition-opacity sm:inset-auto sm:bottom-[5.5rem] sm:right-6 sm:h-[560px] sm:max-h-[calc(100vh-7.5rem)] sm:w-[380px] sm:origin-bottom-right sm:rounded-card sm:border sm:border-line sm:shadow-[0_8px_24px_rgba(11,34,54,0.12)] ${
					open
						? 'visible translate-y-0 opacity-100 sm:scale-100'
						: 'invisible translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95'
				}`}
			>
				{/* HEADER + TABS (the close button stays at the top on mobile, below the notch) */}
				<div className="flex shrink-0 items-center justify-between border-b border-line px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-3">
					<div role="tablist" aria-label="Widget sections" className="flex gap-5">
						{TABS.map((item) => {
							const selected = tab === item.id;
							return (
								<button
									key={item.id}
									type="button"
									role="tab"
									id={`cd-tab-${item.id}`}
									aria-selected={selected}
									aria-controls={`cd-tabpanel-${item.id}`}
									tabIndex={selected ? 0 : -1}
									onClick={() => setTab(item.id)}
									onKeyDown={tabKeyHandler}
									className={`relative flex items-center gap-1.5 border-b-2 pb-2.5 text-[0.875rem] font-semibold transition-colors duration-150 ${
										selected ? 'border-accent text-ink' : 'border-transparent text-muted hover:text-ink'
									}`}
								>
									{item.label}
									{item.id === 'chat' && unread > 0 && (
										<span className="min-w-[1.125rem] rounded-full bg-accent px-1 text-center text-[0.6875rem] font-semibold leading-[1.125rem] text-white">
											{unread > 9 ? '9+' : unread}
										</span>
									)}
								</button>
							);
						})}
					</div>
					<button
						type="button"
						onClick={closePanel}
						aria-label="Close"
						className="-mr-1 mb-2 flex h-8 w-8 items-center justify-center rounded-card p-0 text-muted transition-colors duration-150 hover:bg-surface hover:text-ink"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
							<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
						</svg>
					</button>
				</div>

				{/* ASSISTANT TAB (placeholder until the AI phase) */}
				<div
					role="tabpanel"
					id="cd-tabpanel-assistant"
					aria-labelledby="cd-tab-assistant"
					className={`flex-1 overflow-y-auto px-5 py-6 ${tab === 'assistant' ? 'block' : 'hidden'}`}
				>
					<div className="flex h-full flex-col items-center justify-center gap-3 text-center">
						<span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-accent">
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path
									d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3zM18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9L18 15z"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinejoin="round"
								/>
							</svg>
						</span>
						<h2 className="m-0 text-h3 font-semibold text-ink">Assistant coming soon</h2>
						<p className="m-0 max-w-[17rem] text-[0.9375rem] leading-relaxed text-muted">
							Soon you can ask about a tracking code, a route, or how chain verification works.
						</p>
					</div>
				</div>

				{/* COMMUNITY CHAT TAB */}
				<div
					role="tabpanel"
					id="cd-tabpanel-chat"
					aria-labelledby="cd-tab-chat"
					className={`min-h-0 flex-1 flex-col ${tab === 'chat' ? 'flex' : 'hidden'}`}
				>
					{/* guests see no messages and no online count; the socket only opens after login */}
					{isLoggedIn ? (
						<>
							<div className="flex items-center gap-2 border-b border-line px-4 py-2 text-small leading-snug text-muted">
								<span className="h-2 w-2 rounded-full bg-ok" aria-hidden="true" />
								{onlineUsers} online
							</div>

							<div className="flex-1 overflow-y-auto bg-surface px-4 py-3" aria-live="polite">
								{messages.length === 0 && (
									<p className="m-0 py-8 text-center text-small leading-snug text-muted">No messages yet. Say hello.</p>
								)}
								<ul className="m-0 flex list-none flex-col gap-3 p-0">
									{messages.map((message: ChatMessage, index: number) => {
										const mine = String(message.memberData?._id) === String(user?._id);
										return (
											<li key={index} className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
												{!mine && (
													<img
														src={avatarOf(message)}
														alt=""
														className="h-7 w-7 shrink-0 rounded-full border border-line object-cover object-top"
													/>
												)}
												<div className={`flex max-w-[75%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
													{!mine && (
														<span className="mb-0.5 px-1 text-[0.75rem] leading-snug text-muted">
															{message.memberData?.memberNick ?? 'Guest'}
														</span>
													)}
													<span
														className={`whitespace-pre-wrap break-words rounded-[10px] px-3 py-2 text-[0.875rem] leading-snug ${
															mine ? 'bg-accent text-white' : 'border border-line bg-card text-ink'
														}`}
													>
														{message.text}
													</span>
												</div>
											</li>
										);
									})}
								</ul>
								<div ref={listEndRef} />
							</div>

							<form
								onSubmit={submitHandler}
								className="flex shrink-0 items-center gap-2 border-t border-line p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3"
							>
								<label htmlFor="cd-chat-input" className="sr-only">
									Message
								</label>
								<input
									id="cd-chat-input"
									type="text"
									autoComplete="off"
									maxLength={500}
									value={draft}
									onChange={(e) => setDraft(e.target.value)}
									placeholder="Write a message"
									// 16px on mobile: iOS Safari zooms into inputs smaller than that
									className="h-10 min-w-0 flex-1 rounded-card border border-line bg-card px-3 text-[1rem] text-ink outline-none transition-colors duration-150 placeholder:text-muted focus:border-accent sm:text-[0.9375rem]"
								/>
								<button
									type="submit"
									disabled={!draft.trim()}
									aria-label="Send"
									className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-accent p-0 text-white transition duration-150 ease-out hover:bg-accent-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none"
								>
									<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
										<path
											d="M3 10l14-6-6 14-2-6-6-2z"
											stroke="currentColor"
											strokeWidth="1.6"
											strokeLinejoin="round"
										/>
									</svg>
								</button>
							</form>
						</>
					) : (
						<div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] text-center sm:pb-10">
							<p className="m-0 text-[0.9375rem] leading-relaxed text-muted">Log in to join the community chat</p>
							<Link
								href={'/account/join'}
								onClick={() => setOpen(false)}
								className="inline-flex h-10 items-center justify-center rounded-card bg-accent px-5 text-[0.875rem] font-semibold text-white transition-colors duration-150 ease-out hover:bg-accent-hover"
							>
								Log in
							</Link>
						</div>
					)}
				</div>
			</div>

			{/* LAUNCHER */}
			<button
				ref={buttonRef}
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				aria-expanded={open}
				aria-controls="cd-widget-panel"
				aria-label={open ? 'Close assistant and chat' : 'Open assistant and chat'}
				// mobile: 48px, lifted above the iOS home indicator; desktop unchanged
				className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[61] h-12 w-12 items-center justify-center rounded-full bg-accent p-0 text-white shadow-[0_2px_8px_rgba(11,34,54,0.18)] transition duration-150 ease-out hover:bg-accent-hover active:scale-95 motion-reduce:transform-none sm:bottom-6 sm:right-6 sm:h-[52px] sm:w-[52px] ${
					open ? 'hidden sm:flex' : 'flex'
				}`}
			>
				{open ? (
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
						<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
					</svg>
				) : (
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="M5 4h14a2 2 0 012 2v9a2 2 0 01-2 2h-8l-5 4v-4H5a2 2 0 01-2-2V6a2 2 0 012-2z"
							stroke="currentColor"
							strokeWidth="1.6"
							strokeLinejoin="round"
						/>
					</svg>
				)}
				{!open && unread > 0 && (
					<span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-white bg-warn" aria-hidden="true" />
				)}
			</button>
		</div>
	);
};

export default FloatingWidget;
