import React, { useEffect, useState } from 'react';
import { IMAGE_PLACEHOLDER } from '../../config';

interface ImageWithFallbackProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
	/** full URL or null; null and load errors both show the neutral placeholder */
	src?: string | null;
}

/**
 * Plain <img> for backend uploads (the API host is not in next/image remotePatterns).
 * Swaps to the placeholder when the source is missing or fails to load.
 */
const ImageWithFallback = ({ src, alt = '', className = '', ...rest }: ImageWithFallbackProps) => {
	const [current, setCurrent] = useState<string>(src || IMAGE_PLACEHOLDER);

	useEffect(() => {
		setCurrent(src || IMAGE_PLACEHOLDER);
	}, [src]);

	return (
		<img
			{...rest}
			src={current}
			alt={alt}
			className={className}
			onError={() => {
				if (current !== IMAGE_PLACEHOLDER) setCurrent(IMAGE_PLACEHOLDER);
			}}
		/>
	);
};

export default ImageWithFallback;
