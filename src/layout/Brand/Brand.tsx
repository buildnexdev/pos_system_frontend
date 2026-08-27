import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Icon from '../../components/icon/Icon';
// import Logo from '../../components/Logo';
import DashLogo from '../../components/DashLogo';
import { getLoginObjDetails } from '../../redux/login/login.selector';

interface IBrandProps {
	asideStatus: boolean;
	setAsideStatus(...args: unknown[]): unknown;
}
const Brand: FC<IBrandProps> = ({ asideStatus, setAsideStatus }) => {
	const loginData = useSelector(getLoginObjDetails);
	const isSuperAdmin = loginData?.userType === 'SuperAdmin';

	return (
		<div className='brand'>
			<div className='brand-logo'>
				<h1 className='brand-title '>
					{isSuperAdmin ? (
						<div style={{ cursor: 'default' }} aria-label='Logo'>
							<DashLogo height={10} />
						</div>
					) : (
						<Link to='/' aria-label='Logo'>
							<DashLogo height={10} />
						</Link>
					)}
				</h1>
			</div>
			<button
				type='button'
				className='btn brand-aside-toggle'
				aria-label='Toggle Aside'
				onClick={() => setAsideStatus(!asideStatus)}>
				<Icon icon='FirstPage' className='brand-aside-toggle-close' />
				<Icon icon='LastPage' className='brand-aside-toggle-open' />
			</button>
		</div>
	);
};

export default Brand;
