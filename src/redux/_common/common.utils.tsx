import { API_URL } from '../const';
import { decryptData } from './enode-decode';
import store from '../store';

export const docodeHexResponse = (response: any, key: string) => {
	try {
		if (!response || !response.response) {
			console.error('docodeHexResponse: Invalid response object');
			return null;
		}
		const docodeVal = decryptData(response.response, key);
		return docodeVal?.data || null;
	} catch (error) {
		console.error('docodeHexResponse: Error decoding response', error);
		return null;
	}
};

export const decodeApiResponse = (jsonData: any, key: string) => {
	try {
		if (!jsonData) {
			console.error('decodeApiResponse: Invalid jsonData input');
			return null;
		}
		const decodedData = decryptData(jsonData, key);
		return decodedData?.response || null;
	} catch (error) {
		console.error('decodeApiResponse: Error decoding API response', error);
		return null;
	}
};

export const MaskedNumber = (number: any, isTrue: any) => {
	let maskedNumber = number;
	if (number !== undefined && Number(isTrue) === 1) {
		number = number.replace(/\s/g, '');
		if (number.length === 12) {
			maskedNumber =
				number.toString().slice(0, -4).replace(/\d/g, 'x') + number.toString().slice(-4);
		}
	}
	return maskedNumber;
};

// Helper function to get token from Redux state
export const getTokenFromRedux = () => {
	const state = store.getState() as { auth?: { token?: string | null } };
	return state.auth?.token || null;
};

/** Resolve API URLs for redux service calls. */
export const resolveFinanceApiUrl = (url: string): string => url;

export const fileUploadServer = async (
	result: any,
	savePath: any,
	companyID: any,
	directoryPath: any,
) => {
	const formData = new FormData();
	formData.append('photoimg', result);
	formData.append('file', result);
	formData.append('savePath', savePath);
	formData.append('companyID', companyID);
	formData.append('directoryPath', directoryPath);

	const response = await fetch(`${API_URL}_common/uploadImage.php`, {
		method: 'POST',
		body: formData,
	});
	if (!response.ok) {
		console.error('Server returned an error:', response.status, response.statusText);
		return false;
	}

	const responseJson = await response.json();
	if (responseJson.status === 'Success') {
		return responseJson.file_path;
	}
	return false;
};

// New function for document uploads
export const documentUploadServer = async (
	file: any,
	savePath: any,
	companyID: any,
	directoryPath: any,
) => {
	const formData = new FormData();
	formData.append('document', file);
	formData.append('file', file);
	formData.append('savePath', savePath);
	formData.append('companyID', companyID);
	formData.append('directoryPath', directoryPath);
	formData.append('fileType', file.type);
	formData.append('fileName', file.name);

	const response = await fetch(`${API_URL}_common/uploadDocument.php`, {
		method: 'POST',
		body: formData,
	});
	if (!response.ok) {
		console.error('Server returned an error:', response.status, response.statusText);
		return false;
	}

	const responseJson = await response.json();
	if (responseJson.status === 'Success') {
		return responseJson.file_path;
	}
	return false;
};

// file upload function that handles both images and documents
export const fileUpload = async (file: any, savePath: any, companyID: any, directoryPath: any) => {
	// Check if file is an image
	const isImage = file.type.startsWith('image/');

	if (isImage) {
		// Use existing image upload function
		return await fileUploadServer(file, savePath, companyID, directoryPath);
	} else {
		// Use document upload function
		return await documentUploadServer(file, savePath, companyID, directoryPath);
	}
};

export const getCurrentDate = () => {
	const newDate = new Date();
	const date = newDate.getDate();
	const month = newDate.getMonth() + 1;
	const year = newDate.getFullYear();
	const separator = '-';
	return `${year}${separator}${month < 10 ? `0${month}` : `${month}`}${separator}${date}`;
};

export const dateDiffInDays = (
	date1: string | number | Date,
	date2: string | number | Date,
): number => {
	const d1 = new Date(date1);
	const d2 = new Date(date2);

	const timeDiff = d2.getTime() - d1.getTime();
	const daysDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));

	return daysDiff + 1;
};

/**
 * Upload to MinIO. Second argument is the object key prefix (folder inside the bucket),
 * e.g. `uploadsA/Company/Company-1/CashTransaction/` — not a path on the PHP server disk.
 */
export const imageUploadToS3 = async (
	result: any,
	minioKeyPrefix: string,
	loginData: any,
	fileType?: any,
) => {
	const { companyID, databaseName, jwtToken } = loginData;
	const prefix = minioKeyPrefix.endsWith('/') ? minioKeyPrefix : `${minioKeyPrefix}/`;
	const formData = new FormData();
	formData.append('photoimg', result);
	formData.append('typeval', prefix);
	formData.append('companyID', companyID);
	formData.append('databaseName', databaseName);
	formData.append('fileFormat', fileType ? fileType : 'Image');

	const response = await fetch(`${API_URL}_common/uploadImageToServer.php`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${jwtToken}`,
		},
		body: formData,
	});
	if (!response.ok) {
		console.error('Server returned an error:', response.status, response.statusText);
		// return "Image Upload Failed";
	} else {
		const responseJson = await response.json();
		if (responseJson.status === 'Success') {
			return responseJson.response;
		} else if ('error_message' in responseJson) {
			return 'Image Upload Failed';
		}
	}

	// } catch (error) {
	//   console.error('Caught error:', error);
	//   // return "Image Upload Failed";
	// }
};

// Excel Export Function
export const excelExportFunction = (
	excelUrl: string,
	listData: any,
	excelToken: string,
) => {
	const url = `${API_URL}Excel/${excelUrl}.php`;
	const params = new URLSearchParams();
	params.append(excelToken, listData);

	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: params.toString(),
	});
};
