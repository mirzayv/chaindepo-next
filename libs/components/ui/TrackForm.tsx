import React, { FormEvent, useId, useState } from 'react';
import { useRouter } from 'next/router';

interface TrackFormProps {
	defaultValue?: string;
	/** inline message under the input, e.g. an unknown tracking code */
	error?: string;
	className?: string;
}

/** tracking code input that routes to /shipment/detail?code=<CODE> */
const TrackForm = ({ defaultValue = '', error, className = '' }: TrackFormProps) => {
	const router = useRouter();
	const inputId = useId();
	const errorId = `${inputId}-error`;
	const [code, setCode] = useState<string>(defaultValue);
	const trimmed = code.trim().toUpperCase();

	const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!trimmed) return;
		await router.push({ pathname: '/shipment/detail', query: { code: trimmed } });
	};

	return (
		<form onSubmit={submitHandler} className={`flex flex-col gap-2 ${className}`} noValidate>
			<label htmlFor={inputId} className="text-small font-medium text-ink">
				Tracking code
			</label>
			<div className="flex flex-col gap-2 sm:flex-row">
				<input
					id={inputId}
					value={code}
					onChange={(e) => setCode(e.target.value)}
					placeholder="e.g. CD261013A1B2C3D4"
					autoComplete="off"
					autoCapitalize="characters"
					spellCheck={false}
					aria-invalid={Boolean(error)}
					aria-describedby={error ? errorId : undefined}
					className={`h-12 min-w-0 flex-1 rounded-card border bg-card px-3.5 font-mono text-[0.9375rem] uppercase text-ink outline-none transition-colors duration-150 ease-out placeholder:normal-case placeholder:text-muted/70 focus:border-accent ${
						error ? 'border-bad' : 'border-line'
					}`}
				/>
				<button
					type="submit"
					disabled={!trimmed}
					className="h-12 shrink-0 rounded-card bg-accent px-6 text-[0.9375rem] font-semibold text-white transition duration-150 ease-out hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-accent motion-reduce:transform-none"
				>
					Track
				</button>
			</div>
			{error && (
				<p id={errorId} role="alert" className="m-0 text-small text-bad">
					{error}
				</p>
			)}
		</form>
	);
};

export default TrackForm;
