import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Trans, useTranslation } from 'next-i18next';
import { useMutation, useReactiveVar } from '@apollo/client';
import { AssistantMessage, assistantMessagesVar } from '../../../apollo/store';
import { ASK_ASSISTANT } from '../../../apollo/user/mutation';

const MAX_LENGTH = 500;
/** how many earlier messages go to the backend as context */
const HISTORY_SIZE = 6;

const SUGGESTIONS = [
	'How do I create a shipment?',
	"What does 'Chain verified' mean?",
	'Where is my shipment CD261014CED8CDBC?',
];

interface AssistantPanelProps {
	isLoggedIn: boolean;
	/** the tab is on screen (for keeping the newest message in view) */
	active: boolean;
	/** guest "Log in" link: close the widget before navigating */
	onLoginClick: () => void;
}

/** Assistant tab of the floating widget: askAssistant mutation, conversation in assistantMessagesVar */
const AssistantPanel = ({ isLoggedIn, active, onLoginClick }: AssistantPanelProps) => {
	const { t } = useTranslation('common');
	const messages = useReactiveVar(assistantMessagesVar);
	const [draft, setDraft] = useState<string>('');
	const [pending, setPending] = useState<boolean>(false);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const listEndRef = useRef<HTMLDivElement>(null);

	/** APOLLO REQUESTS **/
	// errors are shown as an assistant bubble, not the global SweetAlert popup (see errorLink in apollo/client.ts)
	const [askAssistant] = useMutation(ASK_ASSISTANT, { context: { silentErrors: true } });

	/** LIFECYCLES **/
	useEffect(() => {
		if (active) listEndRef.current?.scrollIntoView({ block: 'end' });
	}, [messages.length, pending, active]);

	// the textarea grows with its content up to max-h, then scrolls
	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;
		input.style.height = 'auto';
		input.style.height = `${input.scrollHeight}px`;
	}, [draft]);

	/** HANDLERS **/
	const send = async (text: string) => {
		const message = text.trim().slice(0, MAX_LENGTH);
		if (!message || pending) return;

		const history = assistantMessagesVar()
			.filter((item) => !item.error)
			.slice(-HISTORY_SIZE)
			.map(({ role, text: itemText }) => ({ role, text: itemText }));

		assistantMessagesVar([...assistantMessagesVar(), { role: 'user', text: message }]);
		setDraft('');
		setPending(true);
		try {
			const { data } = await askAssistant({ variables: { input: { message, history } } });
			const reply: string = data?.askAssistant?.reply ?? '';
			if (!reply) throw new Error('empty reply');
			assistantMessagesVar([...assistantMessagesVar(), { role: 'model', text: reply }]);
		} catch (err: any) {
			console.log('ERROR, askAssistant:', err?.message);
			assistantMessagesVar([
				...assistantMessagesVar(),
				{ role: 'model', text: t('The assistant could not answer. Please try again.'), error: true },
			]);
		} finally {
			setPending(false);
			inputRef.current?.focus();
		}
	};

	const submitHandler = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		send(draft);
	};

	// Enter sends, Shift+Enter adds a line; never send while an IME (Korean input) is still composing
	const keyDownHandler = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
		e.preventDefault();
		send(draft);
	};

	// guests can chat too (backend: 5 questions a day); they only get a note with a login link under the input
	return (
		<>
			<div className="flex-1 overflow-y-auto bg-surface px-4 py-3" aria-live="polite" aria-busy={pending}>
				{messages.length === 0 && !pending && (
					<div className="flex flex-col gap-3 py-4">
						<p className="m-0 text-small leading-relaxed text-muted">
							{t('Ask about shipments, tracking codes or chain verification.')}
						</p>
						<div className="flex flex-col items-start gap-2">
							{SUGGESTIONS.map((suggestion) => (
								<button
									key={suggestion}
									type="button"
									onClick={() => send(t(suggestion))}
									className="max-w-full rounded-full border border-line bg-card px-3 py-1.5 text-left text-[0.8125rem] leading-snug text-ink transition-colors duration-150 ease-out hover:border-accent hover:text-accent"
								>
									{t(suggestion)}
								</button>
							))}
						</div>
					</div>
				)}

				<ul className="m-0 flex list-none flex-col gap-3 p-0">
					{messages.map((message: AssistantMessage, index: number) => {
						const mine = message.role === 'user';
						return (
							<li key={index} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
								<span
									className={`max-w-[85%] whitespace-pre-wrap break-words rounded-[10px] px-3 py-2 text-[0.875rem] leading-snug ${
										mine
											? 'bg-accent text-white'
											: message.error
											? 'border border-dashed border-line bg-surface italic text-muted'
											: 'border border-line bg-card text-ink'
									}`}
								>
									{message.text}
								</span>
							</li>
						);
					})}
					{pending && (
						<li className="flex justify-start">
							<span
								className="inline-flex items-center gap-1 rounded-[10px] border border-line bg-card px-3 py-2.5"
								role="status"
								aria-label={t('The assistant is typing…')}
							>
								{[0, 150, 300].map((delay) => (
									<span
										key={delay}
										className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted motion-reduce:animate-none"
										style={{ animationDelay: `${delay}ms` }}
										aria-hidden="true"
									/>
								))}
							</span>
						</li>
					)}
				</ul>
				<div ref={listEndRef} />
			</div>

			<div className="shrink-0 border-t border-line p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3">
				<form onSubmit={submitHandler} className="flex items-end gap-2">
					<label htmlFor="cd-assistant-input" className="sr-only">
						{t('Ask the assistant')}
					</label>
					<textarea
						id="cd-assistant-input"
						ref={inputRef}
						rows={1}
						maxLength={MAX_LENGTH}
						value={draft}
						disabled={pending}
						onChange={(e) => setDraft(e.target.value)}
						onKeyDown={keyDownHandler}
						placeholder={t('Ask the assistant')}
						// 16px on mobile: iOS Safari zooms into inputs smaller than that
						className="max-h-32 min-h-10 min-w-0 flex-1 resize-none rounded-card border border-line bg-card px-3 py-2 text-[1rem] leading-snug text-ink outline-none transition-colors duration-150 placeholder:text-muted focus:border-accent disabled:opacity-60 sm:text-[0.9375rem]"
					/>
					<button
						type="submit"
						disabled={pending || !draft.trim()}
						aria-label={t('Send')}
						className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-accent p-0 text-white transition duration-150 ease-out hover:bg-accent-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none"
					>
						<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
							<path d="M3 10l14-6-6 14-2-6-6-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
						</svg>
					</button>
				</form>
				{!isLoggedIn && (
					<p className="m-0 mt-2 text-[0.75rem] leading-snug text-muted">
						<Trans
							t={t}
							i18nKey="Guest: 5 questions a day. <link>Log in</link> for more."
							components={{
								link: (
									<Link
										href={'/account/join'}
										onClick={onLoginClick}
										className="font-medium text-accent hover:text-accent-hover hover:underline"
									/>
								),
							}}
						/>
					</p>
				)}
			</div>
		</>
	);
};

export default AssistantPanel;
