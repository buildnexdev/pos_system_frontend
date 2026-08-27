/* eslint-disable react-hooks/rules-of-hooks */

// import { API_URL, S3_API_URL } from '../const';
// import { decryptData } from './enode-decode';

// export const docodeHexResponse = (response: any, key: string) => {
// 	const docodeVal = decryptData(response.response, key);
// 	return docodeVal.data;
// };

// export const decodeApiResponse = (jsonData: any, key: string) => {
// 	const decodedData = decryptData(jsonData, key);
// 	return decodedData.data;
// };

// export const MaskedNumber = (number: any, isTrue: any) => {
// 	let maskedNumber = number;
// 	if (number !== undefined && Number(isTrue) === 1) {
// 		number = number.replace(/\s/g, '');
// 		if (number.length === 12) {
// 			maskedNumber =
// 				number.toString().slice(0, -4).replace(/\d/g, 'x') + number.toString().slice(-4);
// 		}
// 	}
// 	return maskedNumber;
// };

// export const fileUploadServer = async (
// 	result: any,
// 	savePath: any,
// 	companyID: any,
// 	directoryPath: any,
// 	databaseName: any,
// ) => {
// 	const formData = new FormData();
// 	formData.append('photoimg', result);
// 	formData.append('typeval', savePath);
// 	formData.append('companyID', companyID);
// 	formData.append('databaseName', databaseName);
// 	formData.append('directoryPath', directoryPath);
// 	formData.append('fileFormat', 'Image');
// 	const response = await fetch(`${API_URL}_common/uploadImageToServer.php`, {
// 		method: 'POST',
// 		body: formData,
// 	});
// 	if (!response.ok) {
// 		console.error('Server returned an error:', response.status, response.statusText);
// 		return false;
// 	}

// 	const responseJson = await response.json();
// 	if (responseJson.status === 'Success') {
// 		return responseJson.response;
// 	}
// 	return false;
// };

// // New function for document uploads
// export const documentUploadServer = async (
// 	file: any,
// 	savePath: any,
// 	companyID: any,
// 	directoryPath: any,
// ) => {
// 	const formData = new FormData();
// 	formData.append('document', file);
// 	formData.append('file', file);
// 	formData.append('savePath', savePath);
// 	formData.append('companyID', companyID);
// 	formData.append('directoryPath', directoryPath);
// 	formData.append('fileType', file.type);
// 	formData.append('fileName', file.name);

// 	const response = await fetch(`${API_URL}_common/uploadDocument.php`, {
// 		method: 'POST',
// 		body: formData,
// 	});
// 	if (!response.ok) {
// 		console.error('Server returned an error:', response.status, response.statusText);
// 		return false;
// 	}

// 	const responseJson = await response.json();
// 	if (responseJson.status === 'Success') {
// 		return responseJson.file_path;
// 	}
// 	return false;
// };

// // file upload function that handles both images and documents
// export const fileUpload = async (
// 	file: any,
// 	savePath: any,
// 	companyID: any,
// 	directoryPath: any,
// 	databaseName: any,
// ) => {
// 	// Check if file is an image
// 	const isImage = file.type.startsWith('image/');

// 	if (isImage) {
// 		// Use existing image upload function
// 		return await fileUploadServer(file, savePath, companyID, directoryPath, databaseName);
// 	} else {
// 		// Use document upload function
// 		return await documentUploadServer(file, savePath, companyID, directoryPath);
// 	}
// };

// export const getCurrentDate = () => {
// 	const newDate = new Date();
// 	const date = newDate.getDate();
// 	const month = newDate.getMonth() + 1;
// 	const year = newDate.getFullYear();
// 	const separator = '-';
// 	return `${year}${separator}${month < 10 ? `0${month}` : `${month}`}${separator}${date}`;
// };

// // Function to get the correct image URL based on whether it's S3 or local
// export const getImageUrl = (imagePath: string) => {
// 	if (!imagePath) return '';

// 	// Check if the image path contains "S3" (case insensitive)
// 	const isS3Image = imagePath.toLowerCase().includes('s3');

// 	if (isS3Image) {
// 		// Use S3 API URL
// 		// return `https://adc-ecos.enlightcloud.com/8485-squarenow-production/${imagePath}`;
// 		return `${S3_API_URL}${imagePath}`;
// 	} else {
// 		// Use normal API URL
// 		return `${API_URL}${imagePath}`;
// 	}
// };

// export const dateDiffInDays = (
// 	date1: string | number | Date,
// 	date2: string | number | Date,
// ): number => {
// 	const d1 = new Date(date1);
// 	const d2 = new Date(date2);

// 	const timeDiff = d2.getTime() - d1.getTime();
// 	const daysDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));

// 	return daysDiff + 1;
// };

// S3 PDF UPLOAD
// export const pdfUploadToS3 = async (result: BlobPart, path: string): Promise<string> => {
// 	const newFile = new Blob([result], { type: 'application/pdf' });
// 	Object.defineProperty(newFile, 'name', {
// 		value: `${Date.now()}-S3.pdf`,
// 		writable: false,
// 	});

// 	const config = {
// 		dirName: path,
// 		bucketName: '8485-squarenow-production',
// 		region: 'us-east-1',
// 		accessKeyId: 'I2lNT4ycoRoQaq3WqIRR',
// 		secretAccessKey: 'p4DddX4VYRXRfIA4cjHXRoDHp4N4zZWi8GKy4pIr',
// 		successActionStatus: 201,
// 		endpoint: 'https://adc-ecos.enlightcloud.com',
// 		s3ForcePathStyle: true,
// 		signatureVersion: 'v4',
// 	};

// 	try {
// 		const response = await ReactS3.uploadFile(newFile, config);
// 		if (response.location) {
// 			return response.location;
// 		}
// 		return `${config.endpoint}/${config.bucketName}/${response.key}`;
// 	} catch (error) {
// 		console.error('Error uploading file to S3:', error);
// 		throw error;
// 	}
// };

//IMAGE UPLOAD TO SERVER
// export const imageUploadToS3 = async (result: any, path: any, loginData: any) => {
// 	const { companyID, databaseName } = loginData;
// 	const formData = new FormData();
// 	formData.append('photoimg', result);
// 	formData.append('typeval', path);
// 	formData.append('companyID', companyID);
// 	formData.append('databaseName', databaseName);
// 	// formData.append('directoryPath', directoryPath);
// 	formData.append('fileFormat', 'Image');

// 	const response = await fetch(`${API_URL}_common/uploadImageToServer.php`, {
// 		method: 'POST',
// 		body: formData,
// 	});
// 	if (!response.ok) {
// 		console.error('Server returned an error:', response.status, response.statusText);
// 		// return "Image Upload Failed";
// 	} else {
// 		const responseJson = await response.json();
// 		if (responseJson.status === 'Success') {
// 			return responseJson.response;
// 		} else if ('error_message' in responseJson) {
// 			return 'Image Upload Failed';
// 		}
// 	}

// } catch (error) {
//   console.error('Caught error:', error);
//   // return "Image Upload Failed";
// }
// };

// // Show preview
// 		if (file.type.startsWith('image/')) {
// 			const reader = new FileReader();
// 			reader.onload = (event: any) => {
// 				if (imageType === 'memberPhoto') {
// 					setPreviewPhoto(event.target.result);
// 				} else if (imageType === 'memberSignature') {
// 					setPreviewSignature(event.target.result);
// 				}
// 			};
// 			reader.readAsDataURL(file);
// 		}
