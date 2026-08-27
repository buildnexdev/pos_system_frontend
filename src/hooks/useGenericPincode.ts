import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	genericPincodeDetailsStart,
	genericPincodeDetailsResponseChanged,
} from '../redux/general/general.action';
import {
	selectGenericPincodeData,
	selectGenericPincodeResponse,
} from '../redux/general/general.selector';
interface UseGenericPincodeReturn {
	data: any[];
	response: any;
	isLoading: boolean;
	fetchPincode: (pincode: string) => void;
	resetResponse: () => void;
}

export const useGenericPincode = (fieldType: string): UseGenericPincodeReturn => {
	const dispatch = useDispatch();

	// Select data and response for this specific field type
	const data = useSelector(selectGenericPincodeData(fieldType));
	const response = useSelector(selectGenericPincodeResponse(fieldType));

	// Determine loading state based on response
	const isLoading = response !== null && response !== undefined;

	// Function to fetch pincode details
	const fetchPincode = useCallback(
		(pincode: string) => {
			if (pincode && pincode.length === 6) {
				dispatch(genericPincodeDetailsStart(fieldType, { pincode }));
			}
		},
		[dispatch, fieldType],
	);

	// Function to reset response
	const resetResponse = useCallback(() => {
		dispatch(genericPincodeDetailsResponseChanged(fieldType));
	}, [dispatch, fieldType]);

	return {
		data,
		response,
		isLoading,
		fetchPincode,
		resetResponse,
	};
};

export default useGenericPincode;
