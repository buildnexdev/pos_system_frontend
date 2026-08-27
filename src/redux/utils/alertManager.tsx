// Version : 0.0.1
// Author : Assistant
// Purpose : Simple alert manager without Redux

let showAlertFunction: ((show: boolean) => void) | null = null;

export const setShowAlertFunction = (showAlertFn: (show: boolean) => void) => {
	showAlertFunction = showAlertFn;
};

export const showTokenValidationAlert = () => {
	if (showAlertFunction) {
		showAlertFunction!(false);
		setTimeout(() => showAlertFunction!(true), 10);
	}
};

export const hideAlert = () => {
	if (showAlertFunction) {
		showAlertFunction(false);
	}
};

const AlertManager = {
	setShowAlertFunction,
	showTokenValidationAlert,
	hideAlert,
};

export default AlertManager;
