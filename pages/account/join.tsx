import React, { FormEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import Image from 'next/image';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { logIn, signUp } from '../../libs/auth';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Logo from '../../libs/components/ui/Logo';
import {
	generatePassword,
	normalizePhone,
	passwordStrength,
	PasswordStrength,
	PASSWORD_MAX,
	validateNick,
	validatePassword,
	validatePhone,
} from '../../libs/memberValidation';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

/** container port, the same photo the old home hero used */
const JOIN_PHOTO = 'https://images.unsplash.com/photo-1603123041052-8e02cacaa54e?w=1600&q=80';

const MEMBER_TYPES = [
	{ value: 'USER', label: 'Shipper', hint: 'I send shipments' },
	{ value: 'CARRIER', label: 'Carrier', hint: 'I deliver shipments' },
];

type FieldName = 'nick' | 'password' | 'phone';

const STRENGTH: Record<PasswordStrength, { label: string; width: string; bar: string; text: string }> = {
	weak: { label: 'Weak', width: 'w-1/3', bar: 'bg-bad', text: 'text-bad' },
	fair: { label: 'Fair', width: 'w-2/3', bar: 'bg-warn', text: 'text-warn' },
	strong: { label: 'Strong', width: 'w-full', bar: 'bg-ok', text: 'text-ok' },
};

// 16px text (text-body): iOS Safari zooms into smaller inputs
const inputClass = (invalid: boolean) =>
	`h-11 w-full min-w-0 rounded-card border bg-card px-3 text-body text-ink outline-none transition-colors duration-150 ease-out placeholder:text-muted focus:border-accent ${
		invalid ? 'border-bad' : 'border-line'
	}`;

interface FieldProps {
	id: string;
	label: string;
	error?: string;
	hint?: string;
	children: React.ReactNode;
}

/** label, control, then the error (or the hint when there is no error) */
const Field = ({ id, label, error, hint, children }: FieldProps) => (
	<div className="flex flex-col gap-1.5">
		<label htmlFor={id} className="text-small font-semibold text-ink">
			{label}
		</label>
		{children}
		{error ? (
			<p id={`${id}-message`} className="m-0 text-small leading-snug text-bad">
				{error}
			</p>
		) : hint ? (
			<p id={`${id}-message`} className="m-0 text-small leading-snug text-muted">
				{hint}
			</p>
		) : null}
	</div>
);

const Join: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState<boolean>(true);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
	const [submitted, setSubmitted] = useState<boolean>(false);
	const [serverError, setServerError] = useState<string>('');
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [generated, setGenerated] = useState<string>('');
	const [copied, setCopied] = useState<boolean>(false);

	/**
	 * Signup mirrors the backend rules; login only checks that fields are filled,
	 * so accounts created under older (shorter) rules still log in.
	 */
	const errors: Partial<Record<FieldName, string>> = loginView
		? {
				nick: input.nick.trim() ? undefined : 'Enter your nickname.',
				password: input.password ? undefined : 'Enter a password.',
		  }
		: {
				nick: validateNick(input.nick),
				password: validatePassword(input.password),
				phone: validatePhone(input.phone),
		  };
	const errorOf = (field: FieldName) => {
		const key = submitted || touched[field] ? errors[field] : undefined;
		return key ? t(key) : undefined;
	};
	const strength = !loginView && input.password ? passwordStrength(input.password) : null;

	/** LIFECYCLES **/
	// switching between login and signup starts the form clean
	useEffect(() => {
		setTouched({});
		setSubmitted(false);
		setServerError('');
		setGenerated('');
		setShowPassword(false);
	}, [loginView]);

	/** HANDLERS **/
	const handleInput = (name: 'nick' | 'password' | 'phone' | 'type', value: string) => {
		setInput((prev) => ({ ...prev, [name]: value }));
		setServerError('');
		// a typed password replaces the generated one
		if (name === 'password' && value !== generated) setGenerated('');
	};

	const touch = (field: FieldName) => setTouched((prev) => ({ ...prev, [field]: true }));

	const generateHandler = () => {
		const password = generatePassword(16);
		setInput((prev) => ({ ...prev, password }));
		setGenerated(password);
		setShowPassword(true);
		setCopied(false);
		setServerError('');
		touch('password');
	};

	const copyHandler = async () => {
		try {
			await navigator.clipboard.writeText(generated);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1500);
		} catch {
			// clipboard blocked (http, old browser): the password is visible and selectable
		}
	};

	const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (submitting) return;
		setSubmitted(true);
		if (Object.values(errors).some(Boolean)) return;

		setSubmitting(true);
		setServerError('');
		try {
			if (loginView) await logIn(input.nick.trim(), input.password);
			else await signUp(input.nick.trim(), input.password, normalizePhone(input.phone), input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			// the server's message as-is (e.g. a taken nickname or a DTO rule)
			setServerError(err?.message ?? 'Something went wrong!');
		} finally {
			setSubmitting(false);
		}
	};

	const describedBy = (field: FieldName) => (errorOf(field) || !loginView ? `join-${field}-message` : undefined);

	return (
		<div className="cd-ui w-full bg-surface">
			<div className="mx-auto grid max-w-page px-4 py-8 md:px-6 md:py-14">
				<div className="grid overflow-hidden rounded-card border border-line bg-card md:grid-cols-2">
					<div className="flex min-w-0 flex-col gap-6 p-5 sm:p-10">
						<Logo size={24} />
						<div className="flex flex-col gap-1.5">
							<h1 className="m-0 text-h2 font-semibold text-ink">{loginView ? t('Log in') : t('Create an account')}</h1>
							<p className="m-0 text-body text-muted">
								{loginView
									? t('Welcome back. Log in to manage your shipments.')
									: t('Ship with ChainDepo or deliver as a carrier.')}
							</p>
						</div>

						<form className="flex flex-col gap-4" onSubmit={submitHandler} noValidate>
							<Field
								id="join-nick"
								label={t('Nickname')}
								error={errorOf('nick')}
								hint={loginView ? undefined : t('Letters, numbers and _ only, 3–20 characters.')}
							>
								<input
									id="join-nick"
									type="text"
									autoComplete="username"
									autoCapitalize="none"
									spellCheck={false}
									className={inputClass(Boolean(errorOf('nick')))}
									value={input.nick}
									onChange={(e) => handleInput('nick', e.target.value)}
									onBlur={() => touch('nick')}
									aria-invalid={Boolean(errorOf('nick'))}
									aria-describedby={describedBy('nick')}
									required
								/>
							</Field>

							<Field
								id="join-password"
								label={t('Password')}
								error={errorOf('password')}
								hint={loginView ? undefined : t('8–64 characters with at least one letter and one number.')}
							>
								<div className="relative">
									<input
										id="join-password"
										type={showPassword ? 'text' : 'password'}
										autoComplete={loginView ? 'current-password' : 'new-password'}
										autoCapitalize="none"
										spellCheck={false}
										maxLength={loginView ? undefined : PASSWORD_MAX}
										className={`${inputClass(Boolean(errorOf('password')))} pr-11`}
										value={input.password}
										onChange={(e) => handleInput('password', e.target.value)}
										onBlur={() => touch('password')}
										aria-invalid={Boolean(errorOf('password'))}
										aria-describedby={describedBy('password')}
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword((prev) => !prev)}
										aria-label={showPassword ? t('Hide password') : t('Show password')}
										aria-pressed={showPassword}
										aria-controls="join-password"
										className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-card border-0 bg-transparent p-0 text-muted transition-colors duration-150 hover:text-ink"
									>
										<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<path
												d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
												stroke="currentColor"
												strokeWidth="1.6"
												strokeLinejoin="round"
											/>
											<circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
											{showPassword && (
												<path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
											)}
										</svg>
									</button>
								</div>

								{!loginView && (
									<>
										{strength && (
											<div className="flex items-center gap-3" aria-live="polite">
												<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
													<div
														className={`h-full rounded-full transition-all duration-150 motion-reduce:transition-none ${STRENGTH[strength].width} ${STRENGTH[strength].bar}`}
													/>
												</div>
												<span className={`shrink-0 text-small font-medium ${STRENGTH[strength].text}`}>
													<span className="sr-only">{t('Password strength')}: </span>
													{t(STRENGTH[strength].label)}
												</span>
											</div>
										)}

										<button
											type="button"
											onClick={generateHandler}
											className="self-start border-0 bg-transparent p-0 text-small font-semibold text-accent hover:text-accent-hover hover:underline"
										>
											{t('Generate strong password')}
										</button>

										{generated && generated === input.password && (
											<div className="flex items-center gap-2 rounded-card border border-line bg-surface px-3 py-2">
												<span className="sr-only">{t('Generated password')}: </span>
												<code className="min-w-0 flex-1 select-all break-all font-mono text-small text-ink">
													{generated}
												</code>
												<button
													type="button"
													onClick={copyHandler}
													className="h-8 shrink-0 rounded-card border border-line bg-card px-3 text-small font-medium text-ink transition-colors duration-150 hover:border-accent hover:text-accent"
												>
													{copied ? t('Copied') : t('Copy')}
												</button>
											</div>
										)}
									</>
								)}
							</Field>

							{!loginView && (
								<>
									<Field id="join-phone" label={t('Phone')} error={errorOf('phone')} hint={t('Korean mobile number.')}>
										<input
											id="join-phone"
											type="tel"
											inputMode="tel"
											autoComplete="tel"
											placeholder="010-1234-5678"
											className={inputClass(Boolean(errorOf('phone')))}
											value={input.phone}
											onChange={(e) => handleInput('phone', e.target.value)}
											onBlur={() => touch('phone')}
											aria-invalid={Boolean(errorOf('phone'))}
											aria-describedby={describedBy('phone')}
											required
										/>
									</Field>
									<fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
										<legend className="mb-1.5 p-0 text-small font-semibold text-ink">{t('I am a')}</legend>
										<div className="grid grid-cols-2 gap-2">
											{MEMBER_TYPES.map((type) => {
												const checked = input.type === type.value;
												return (
													<label
														key={type.value}
														className={`flex min-w-0 cursor-pointer flex-col gap-0.5 rounded-card border px-3 py-2.5 transition-colors duration-150 ease-out ${
															checked ? 'border-accent bg-accent/5' : 'border-line hover:border-accent'
														}`}
													>
														<span className="flex items-center gap-2 text-small font-semibold text-ink">
															<input
																type="radio"
																name="memberType"
																value={type.value}
																checked={checked}
																onChange={() => handleInput('type', type.value)}
																className="m-0 accent-accent"
															/>
															{t(type.label)}
														</span>
														<span className="pl-5 text-small text-muted">{t(type.hint)}</span>
													</label>
												);
											})}
										</div>
									</fieldset>
								</>
							)}

							{serverError && (
								<p role="alert" className="m-0 rounded-card border border-bad/40 bg-bad/5 px-3 py-2 text-small leading-snug text-bad">
									{serverError}
								</p>
							)}

							<button
								type="submit"
								disabled={submitting}
								aria-busy={submitting}
								className="mt-2 h-11 cursor-pointer rounded-card border-0 bg-accent text-body font-semibold text-white transition-colors duration-150 ease-out hover:bg-accent-hover disabled:cursor-default disabled:opacity-50 disabled:hover:bg-accent"
							>
								{loginView ? t('Log in') : t('Sign up')}
							</button>
						</form>

						<p className="m-0 text-body text-muted">
							{loginView ? t('New to ChainDepo?') : t('Already have an account?')}{' '}
							<button
								type="button"
								onClick={() => setLoginView(!loginView)}
								className="cursor-pointer border-0 bg-transparent p-0 text-body font-semibold text-accent hover:text-accent-hover hover:underline"
							>
								{loginView ? t('Sign up') : t('Log in')}
							</button>
						</p>
					</div>

					<div className="relative hidden min-h-[520px] md:block">
						<Image src={JOIN_PHOTO} alt="Containers stacked at a port" fill sizes="50vw" className="object-cover" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(Join);
