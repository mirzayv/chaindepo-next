// lists t('...') keys used in the given files that are missing from public/locales/<lang>/common.json
import fs from 'node:fs';
const [lang, ...files] = process.argv.slice(2);
const dict = JSON.parse(fs.readFileSync(`public/locales/${lang}/common.json`, 'utf8'));
const has = (k) => k in dict || k.split('.').reduce((o, p) => (o && typeof o === 'object' ? o[p] : undefined), dict) !== undefined;
const keys = new Set();
for (const f of files) {
	const src = fs.readFileSync(f, 'utf8');
	if (/useTranslation\('home'\)/.test(src)) continue;
	for (const m of src.matchAll(/\bt\(\s*'((?:[^'\\]|\\.)+)'/g)) keys.add(m[1].replace(/\\'/g, "'"));
	// labels from data arrays passed through t(item.label) etc.
}
const missing = [...keys].filter((k) => !has(k) && !has(`${k}_one`) && !has(`${k}_other`));
console.log(JSON.stringify(missing, null, 1));
