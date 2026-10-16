import React, { FormEvent, useCallback, useState } from 'react';
import { NextPage } from 'next';
import Image from 'next/image';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Logo from '../../libs/components/ui/Logo';

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

const inputClass =
	'h-11 w-full rounded-card border border-line bg-card px-3 text-body text-ink outline-none transition-colors duration-150 ease-out placeholder:text-muted focus:border-accent';

const Field = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => (
	<div className="flex flex-col gap-1.5">
		<label htmlFor={id} className="text-small font-semibold text-ink">
			{label}
		</label>
		{children}
	</div>
);

const Join: NextPage = () => {
	const router = useRouter();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState<boolean>(true);
	const [submitting, setSubmitting] = useState<boolean>(false);

	/** HANDLERS **/
	const handleInput = useCallback((name: string, value: string) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	const doLogin = useCallback(async () => {
		try {
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const doSignUp = useCallback(async () => {
		try {
			await signUp(input.nick, input.password, input.phone, input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (submitting) return;
		setSubmitting(true);
		try {
			if (loginView) await doLogin();
			else await doSignUp();
		} finally {
			setSubmitting(false);
		}
	};

	const disabled = loginView
		? input.nick === '' || input.password === ''
		: input.nick === '' || input.password === '' || input.phone === '' || input.type === '';

	return (
		<div className="cd-ui w-full bg-surface">
			<div className="mx-auto grid max-w-page px-4 py-8 md:px-6 md:py-14">
				<div className="grid overflow-hidden rounded-card border border-line bg-card md:grid-cols-2">
					<div className="flex flex-col gap-6 p-6 sm:p-10">
						<Logo size={24} />
						<div className="flex flex-col gap-1.5">
							<h1 className="m-0 text-h2 font-semibold text-ink">{loginView ? 'Log in' : 'Create an account'}</h1>
							<p className="m-0 text-body text-muted">
								{loginView
									? 'Welcome back. Log in to manage your shipments.'
									: 'Ship with ChainDepo or deliver as a carrier.'}
							</p>
						</div>

						<form className="flex flex-col gap-4" onSubmit={submitHandler} noValidate>
							<Field id="join-nick" label="Nickname">
								<input
									id="join-nick"
									type="text"
									autoComplete="username"
									className={inputClass}
									value={input.nick}
									onChange={(e) => handleInput('nick', e.target.value)}
									required
								/>
							</Field>
							<Field id="join-password" label="Password">
								<input
									id="join-password"
									type="password"
									autoComplete={loginView ? 'current-password' : 'new-password'}
									className={inputClass}
									value={input.password}
									onChange={(e) => handleInput('password', e.target.value)}
									required
								/>
							</Field>

							{!loginView && (
								<>
									<Field id="join-phone" label="Phone">
										<input
											id="join-phone"
											type="tel"
											autoComplete="tel"
											placeholder="010-1234-5678"
											className={inputClass}
											value={input.phone}
											onChange={(e) => handleInput('phone', e.target.value)}
											required
										/>
									</Field>
									<fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
										<legend className="mb-1.5 p-0 text-small font-semibold text-ink">I am a</legend>
										<div className="grid grid-cols-2 gap-2">
											{MEMBER_TYPES.map((type) => {
												const checked = input.type === type.value;
												return (
													<label
														key={type.value}
														className={`flex cursor-pointer flex-col gap-0.5 rounded-card border px-3 py-2.5 transition-colors duration-150 ease-out ${
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
															{type.label}
														</span>
														<span className="pl-5 text-small text-muted">{type.hint}</span>
													</label>
												);
											})}
										</div>
									</fieldset>
								</>
							)}

							<button
								type="submit"
								disabled={disabled || submitting}
								className="mt-2 h-11 cursor-pointer rounded-card border-0 bg-accent text-body font-semibold text-white transition-colors duration-150 ease-out hover:bg-accent-hover disabled:cursor-default disabled:opacity-50 disabled:hover:bg-accent"
							>
								{loginView ? 'Log in' : 'Sign up'}
							</button>
						</form>

						<p className="m-0 text-body text-muted">
							{loginView ? 'New to ChainDepo?' : 'Already have an account?'}{' '}
							<button
								type="button"
								onClick={() => setLoginView(!loginView)}
								className="cursor-pointer border-0 bg-transparent p-0 text-body font-semibold text-accent hover:text-accent-hover hover:underline"
							>
								{loginView ? 'Sign up' : 'Log in'}
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
