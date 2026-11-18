import { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { labelOf } from '../utils';

/**
 * Translated label for a backend enum value (status, shipment type, city, member type…):
 * looks up common:enum.<VALUE>, falling back to the plain English label from labelOf.
 */
const useLabel = () => {
	const { t } = useTranslation('common');
	return useCallback(
		(value?: string | null): string => (value ? t(`enum.${value}`, { defaultValue: labelOf(value) }) : ''),
		[t],
	);
};

export default useLabel;
