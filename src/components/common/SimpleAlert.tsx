// Version : 0.0.1
// Author : Assistant
// Purpose : Simple alert modal with default message

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { userSignInLogOutStart } from '../../redux/login/login.action';
import { useNavigate } from 'react-router-dom';
import { loginPages } from '../../menu';

interface SimpleAlertProps {
	show: boolean;
	onClose?: () => void;
}

const SimpleAlert: React.FC<SimpleAlertProps> = ({ show, onClose }) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(show);
	}, [show]);

	const handleLogout = () => {
		setIsVisible(false);
		// Clear tokens and redirect to login
		dispatch(userSignInLogOutStart());
		navigate(`../${loginPages.login.path}`);
	};

	const handleLogin = () => {
		setIsVisible(false);
		// Clear tokens and redirect to login
		// localStorage.removeItem('sessionToken');
		// sessionStorage.removeItem('sessionToken');
		// window.location.href = '/login';
	};

	if (!isVisible) return null;

	return (
		<div
			className='modal fade show d-block'
			style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
			<div className='modal-dialog modal-dialog-centered'>
				<div className='modal-content border-danger'>
					<div className='modal-header'>
						<h5 className='modal-title'>
							<span className='me-2'>⚠️</span>
							Session Expired
						</h5>
						<button type='button' className='btn-close' onClick={handleLogout} />
					</div>
					<div className='modal-body'>
						<p>Your session has expired. Please Login again.</p>
					</div>
					<div className='modal-footer'>
						<button type='button' className='btn btn-primary' onClick={handleLogin}>
							Close
						</button>
						<button type='button' className='btn btn-secondary' onClick={handleLogout}>
							Logout
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SimpleAlert;
