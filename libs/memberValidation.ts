/**
 * Signup rules, kept in line with the backend MemberInput DTO:
 * nickname 3–20 (letters, numbers, _), password 8–64 with a letter and a number, Korean mobile phone.
 * Login is deliberately lenient (required only) so accounts created under older rules can still log in.
 * Messages are i18n keys (public/locales/{en,kr,ru}/common.json).
 */

export const NICK_MIN = 3;
export const NICK_MAX = 20;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;

export const validateNick = (value: string): string | undefined => {
	const nick = value.trim();
	if (!nick) return 'Enter your nickname.';
	if (nick.length < NICK_MIN || nick.length > NICK_MAX) return 'Nickname must be 3–20 characters.';
	if (!/^[A-Za-z0-9_]+$/.test(nick)) return 'Use only letters, numbers and _.';
	return undefined;
};

export const validatePassword = (value: string): string | undefined => {
	if (!value) return 'Enter a password.';
	if (value.length < PASSWORD_MIN || value.length > PASSWORD_MAX) return 'Password must be 8–64 characters.';
	if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Password needs at least one letter and one number.';
	return undefined;
};

/**
 * "010-1234-5678", "010 1234 5678", "+82 10-1234-5678" → "01012345678".
 * Returns the digits-only form; validatePhone decides whether it is a Korean mobile number.
 */
export const normalizePhone = (value: string): string => {
	let phone = value.trim().replace(/[\s\-.()]/g, '');
	if (phone.startsWith('+82')) {
		phone = phone.slice(3);
		// "+82 010…" also happens; the trunk 0 is added back exactly once
		phone = phone.startsWith('0') ? phone : `0${phone}`;
	}
	return phone;
};

export const validatePhone = (value: string): string | undefined => {
	if (!value.trim()) return 'Enter your phone number.';
	// 010 (and the older 011/016/017/018/019) + 7–8 digits
	if (!/^01[016-9]\d{7,8}$/.test(normalizePhone(value))) return 'Enter a Korean mobile number, e.g. 010-1234-5678.';
	return undefined;
};

export type PasswordStrength = 'weak' | 'fair' | 'strong';

/** length plus character variety (lower, upper, digit, symbol) */
export const passwordStrength = (value: string): PasswordStrength => {
	const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(value)).length;
	const score =
		(value.length >= PASSWORD_MIN ? 1 : 0) +
		(value.length >= 12 ? 1 : 0) +
		(value.length >= 16 ? 1 : 0) +
		Math.max(0, classes - 1);
	if (score <= 2) return 'weak';
	if (score <= 4) return 'fair';
	return 'strong';
};

const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%^&*-_=+?';

/** uniform random index below `max` from crypto.getRandomValues (rejection sampling, no modulo bias) */
const randomIndex = (max: number): number => {
	const limit = Math.floor(0x100000000 / max) * max;
	const buffer = new Uint32Array(1);
	do {
		window.crypto.getRandomValues(buffer);
	} while (buffer[0] >= limit);
	return buffer[0] % max;
};

/** 16 characters with at least one lower, upper, digit and symbol (look-alikes l/I/O/0/1 left out) */
export const generatePassword = (length = 16): string => {
	const all = LOWER + UPPER + DIGITS + SYMBOLS;
	const chars = [LOWER, UPPER, DIGITS, SYMBOLS].map((set) => set[randomIndex(set.length)]);
	while (chars.length < length) chars.push(all[randomIndex(all.length)]);
	// Fisher–Yates, so the guaranteed characters are not always at the start
	for (let i = chars.length - 1; i > 0; i--) {
		const j = randomIndex(i + 1);
		[chars[i], chars[j]] = [chars[j], chars[i]];
	}
	return chars.join('');
};
