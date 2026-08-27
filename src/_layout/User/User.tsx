import React, { useMemo, useState, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { loginPages, profilePageMenu } from '../../menu';
import { DropdownItem, DropdownMenu } from '../../components/bootstrap/Dropdown';
import Button from '../../components/bootstrap/Button';
import Collapse from '../../components/bootstrap/Collapse';
import { NavigationLine } from '../Navigation/Navigation';
import Icon from '../../components/icon/Icon';
import useNavigationItemHandle from '../../hooks/useNavigationItemHandle';
import AuthContext from '../../contexts/authContext';
import { getLoginObjDetails } from '../../redux/login/login.selector';
import { S3_API_URL } from '../../redux/const';
import UserImageWebp from '../../assets/img/wanna/wanna1.webp';
import UserImage from '../../assets/img/wanna/wanna1.png';
import { userSignInLogOutStart, updateUserAccessBranchStart } from '../../redux/login/login.action';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../components/bootstrap/Modal';
import Select from '../../components/bootstrap/forms/Select';
import Option from '../../components/bootstrap/Option';
import showNotification from '../../components/extras/showNotification';

const User = () => {
	const dispatch = useDispatch();
	const { userData } = useContext(AuthContext);
	const loginDetails = useSelector(getLoginObjDetails);

	const navigate = useNavigate();
	const handleItem = useNavigationItemHandle();

	const [collapseStatus, setCollapseStatus] = useState<boolean>(false);
	const [switchBranchModalOpen, setSwitchBranchModalOpen] = useState(false);
	const [selectedBranchForSwitch, setSelectedBranchForSwitch] = useState('');

	const { t } = useTranslation(['translation', 'menu']);

	const showSwitchBranch = useMemo(() => {
		const isAdminLevel =
			loginDetails?.userLevel === 'level4' || loginDetails?.userLevel === 'level100';
		const list = loginDetails?.userAccess;
		return !isAdminLevel && Array.isArray(list) && list.length > 1;
	}, [loginDetails?.userLevel, loginDetails?.userAccess]);

	const openSwitchBranchModal = () => {
		setSelectedBranchForSwitch(String(loginDetails?.userAccessBranchID ?? ''));
		setSwitchBranchModalOpen(true);
		setCollapseStatus(false);
	};

	const confirmSwitchBranch = () => {
		const current = String(loginDetails?.userAccessBranchID ?? '');
		if (selectedBranchForSwitch === '' || selectedBranchForSwitch === current) {
			setSwitchBranchModalOpen(false);
			return;
		}
		const list = loginDetails?.userAccess as any[] | undefined;
		const chosen = Array.isArray(list)
			? list.find(
					(ua: any) => String(ua?.UserAccessBranchID ?? '') === selectedBranchForSwitch,
				)
			: undefined;
		dispatch(
			updateUserAccessBranchStart({
				UserAccessBranchID: selectedBranchForSwitch,
			}),
		);
		setSwitchBranchModalOpen(false);
		const label =
			chosen?.UserAccessBranchUniqueID && chosen?.UserAccessBranchName
				? `${chosen.UserAccessBranchUniqueID} — ${chosen.UserAccessBranchName}`
				: chosen?.UserAccessBranchName || selectedBranchForSwitch;
		showNotification('Success', `${t('menu:SwitchBranchTitle' as any)}: ${label}`, 'success');
	};

	const logoutAction = () => {
		dispatch(userSignInLogOutStart());
		navigate(`../${loginPages.login.path}`);
	};

	return (
		<>
			<div
				className={classNames('user', { open: collapseStatus })}
				role='presentation'
				onClick={() => setCollapseStatus(!collapseStatus)}>
				<div className='user-avatar'>
					{loginDetails?.userPhoto &&
					loginDetails?.userPhoto !== '' &&
					loginDetails?.userPhoto !== '-' ? (
						<img
							// Test report #26: userPhoto is a bare S3 object key
							// (e.g. uploads/x.jpg) — every other consumer prefixes
							// it with S3_API_URL. Without the prefix the sidebar
							// <img> 404s and shows the alt/fallback.
							srcSet={
								/^(https?:|data:)/.test(String(loginDetails.userPhoto))
									? loginDetails.userPhoto
									: `${S3_API_URL}${loginDetails.userPhoto}`
							}
							src={
								/^(https?:|data:)/.test(String(loginDetails.userPhoto))
									? loginDetails.userPhoto
									: `${S3_API_URL}${loginDetails.userPhoto}`
							}
							alt='Avatar'
							width={128}
							height={128}
						/>
					) : (
						<img
							srcSet={UserImageWebp}
							src={UserImage}
							alt='Avatar'
							width={128}
							height={128}
						/>
					)}
				</div>
				<div className='user-info'>
					<div className='user-name d-flex align-items-center'>
						{`${loginDetails?.userName}`}
						<Icon icon='Verified' className='ms-1' color='info' />
					</div>
					<div className='user-sub-title'>{loginDetails?.userPhoneNumber}</div>
				</div>
			</div>
			<DropdownMenu>
				<DropdownItem>
					<Button
						icon='AccountBox'
						onClick={() =>
							navigate(`../${profilePageMenu.profile.path}/${userData?.id}`)
						}>
						Profile
					</Button>
				</DropdownItem>
				{/* Light/Dark mode toggle removed per user 2026-07-01. */}
			</DropdownMenu>

			<Collapse isOpen={collapseStatus} className='user-menu'>
				<nav aria-label='aside-bottom-user-menu'>
					<div className='navigation'>
						<div
							role='presentation'
							className='navigation-item cursor-pointer'
							onClick={() =>
								navigate(
									`../${profilePageMenu.profile.path}`,
									// @ts-ignore
									// handleItem(),
								)
							}>
							<span className='navigation-link navigation-link-pill'>
								<span className='navigation-link-info'>
									<Icon icon='AccountBox' className='navigation-icon' />
									<span className='navigation-text'>
										{t('menu:Profile') as ReactNode}
									</span>
								</span>
							</span>
						</div>
						{/* Collapsed-menu Light/Dark toggle removed per user 2026-07-01. */}
						{showSwitchBranch && (
							<div
								role='presentation'
								className='navigation-item cursor-pointer'
								onClick={() => {
									openSwitchBranchModal();
									handleItem();
								}}>
								<span className='navigation-link navigation-link-pill'>
									<span className='navigation-link-info'>
										<Icon icon='AccountTree' className='navigation-icon' />
										<span className='navigation-text'>
											{t('menu:SwitchBranch' as any) as ReactNode}
										</span>
									</span>
								</span>
							</div>
						)}
					</div>
				</nav>
				<NavigationLine />
				<nav aria-label='aside-bottom-user-menu-2'>
					<div className='navigation'>
						<div
							role='presentation'
							className='navigation-item cursor-pointer'
							onClick={() => {
								logoutAction();
							}}>
							<span className='navigation-link navigation-link-pill'>
								<span className='navigation-link-info'>
									<Icon icon='Logout' className='navigation-icon' />
									<span className='navigation-text'>
										{t('menu:Logout') as ReactNode}
									</span>
								</span>
							</span>
						</div>
					</div>
				</nav>
			</Collapse>

			{showSwitchBranch && (
				<Modal
					isOpen={switchBranchModalOpen}
					setIsOpen={setSwitchBranchModalOpen}
					titleId='switch-branch-modal'
					isCentered
					isAnimation>
					<ModalHeader setIsOpen={setSwitchBranchModalOpen}>
						<ModalTitle id='switch-branch-modal'>
							{t('menu:SwitchBranchTitle' as any) as ReactNode}
						</ModalTitle>
					</ModalHeader>
					<ModalBody>
						<p className='text-muted small mb-3'>
							{t('menu:SwitchBranchHint' as any) as ReactNode}
						</p>
						<Select
							ariaLabel={t('menu:SwitchBranchTitle' as any) as string}
							placeholder={t('menu:SwitchBranchTitle' as any) as string}
							value={selectedBranchForSwitch}
							onChange={(e: any) => setSelectedBranchForSwitch(e.target.value)}>
							{(loginDetails?.userAccess as any[] | undefined)?.map((ua: any) => (
								<Option
									key={String(ua.UserAccessBranchID)}
									value={String(ua.UserAccessBranchID)}>
									{ua.UserAccessBranchUniqueID
										? `${ua.UserAccessBranchUniqueID} — ${ua.UserAccessBranchName || ''}`
										: ua.UserAccessBranchName || String(ua.UserAccessBranchID)}
								</Option>
							))}
						</Select>
					</ModalBody>
					<ModalFooter>
						<Button
							color='info'
							isOutline
							onClick={() => setSwitchBranchModalOpen(false)}>
							Cancel
						</Button>
						<Button color='primary' onClick={confirmSwitchBranch}>
							{t('menu:SwitchBranchConfirm' as any) as ReactNode}
						</Button>
					</ModalFooter>
				</Modal>
			)}
		</>
	);
};

export default User;
