import React from 'react';
import { CHAINDEPO_CONTRACT, SEPOLIA_ADDRESS_URL } from '../../config';
import EthereumMark from '../ui/EthereumMark';
import { useTranslation } from 'next-i18next';

const shortContract = `${CHAINDEPO_CONTRACT.slice(0, 6)}…${CHAINDEPO_CONTRACT.slice(-4)}`;

/** translation keys in home:ticker; 'contract' is followed by the short address */
const ITEMS = ['hashed', 'linked', 'anchored', 'contract', 'etherscan', 'tamper'];

/** a moving blue band right under the hero that spells out the blockchain part (static with reduced motion) */
const ChainTicker = () => {
	const { t } = useTranslation('home');
	const label = (key: string) => (key === 'contract' ? `${t('ticker.contract')} ${shortContract}` : t(`ticker.${key}`));
	const row = (hidden: boolean) => (
		<ul className="m-0 flex shrink-0 list-none items-center gap-10 p-0 pr-10" aria-hidden={hidden || undefined}>
			{ITEMS.map((item) => (
				<li key={item} className="flex items-center gap-10 whitespace-nowrap">
					<span className="text-[1.0625rem] font-semibold tracking-[-0.01em]">{label(item)}</span>
					<EthereumMark size={18} className="opacity-70" />
				</li>
			))}
		</ul>
	);

	return (
		<a
			href={`${SEPOLIA_ADDRESS_URL}${CHAINDEPO_CONTRACT}`}
			target="_blank"
			rel="noreferrer"
			aria-label="ChainDepo verification contract on Etherscan (Ethereum Sepolia)"
			className="group block w-full overflow-hidden bg-accent py-4 text-white"
		>
			<div className="flex w-max animate-[cd-marquee_40s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
				{row(false)}
				{row(true)}
			</div>
		</a>
	);
};

export default ChainTicker;
