import React from 'react';
import Icon from './icon/Icon';

type ImageWithActionsProps = {
	fieldName: string;
	getImageUrl: (url: string) => string;
	handlePreviewImage: (url: string) => void;
	handleRemoveImage: (fieldName: string) => void;
	formik: {
		values: { [key: string]: any };
	};
	/** When true, the remove/cancel icon is hidden (e.g. edit allowed but cannot remove filled images) */
	disableRemove?: boolean;
	/** Optional height for the image container (e.g. 200 for bank passbook/cheque to match placeholder box) */
	containerHeight?: number;
};

const ImageWithActions = ({
	fieldName,
	getImageUrl,
	handlePreviewImage,
	handleRemoveImage,
	formik,
	disableRemove = false,
	containerHeight = 150,
}: ImageWithActionsProps) => {
	const imageUrl = formik.values[fieldName as keyof typeof formik.values];
	if (imageUrl == null || imageUrl == 'Null' || imageUrl === '' || (typeof imageUrl === 'string' && imageUrl.trim() === ''))
		return null;

	// Use data URL (base64) as-is; otherwise resolve path via getImageUrl
	const imgSrc =
		typeof imageUrl === 'string' && imageUrl.startsWith('data:')
			? imageUrl
			: getImageUrl(imageUrl);

	return (
		<>
			<div className='position-relative mt-2' style={{ width: '100%', height: `${containerHeight}px` }}>
				<img
					src={imgSrc}
					alt='Uploaded document'
					className='img-thumbnail w-100 h-100 object-fit-cover cursor-pointer'
					style={{ objectFit: 'contain', backgroundColor: '#e8e8e8' }}
					onClick={() => handlePreviewImage(imageUrl)}
				/>
				{!disableRemove && (
					<button
						className='position-absolute top-0 end-0 btn btn-sm btn-danger'
						onClick={(e) => {
							e.stopPropagation();
							handleRemoveImage(fieldName);
						}}>
						<Icon icon='Close' size='sm' />
					</button>
				)}
			</div>
		</>
	);
};

export default ImageWithActions;
