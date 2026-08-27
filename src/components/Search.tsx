import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import Icon from './icon/Icon';
import Input from './bootstrap/forms/Input';
import { Manager, Popper, Reference } from 'react-popper';
import Portal from '../layout/Portal/Portal';
import {
	masterPageMenu,
	operationsPageMenu,
	reportsPageMenu,
	financePageMenu,
	userControlAccessPageMenu,
	dashboardPagesMenu,
	companyPageMenu,
	companyCreationRequestsMenu,
	passwordResetRequestsMenu,
	commonUpdatePageMenu,
	schemaSyncPageMenu,
} from '../menu';

interface SearchProps {
	menus?: any[];
}

const Search: React.FC<SearchProps> = ({ menus }) => {
	const refSearchInput = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();
	const [searchModalStatus, setSearchModalStatus] = useState(false);
	const formik = useFormik({
		initialValues: {
			searchInput: '',
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onSubmit: (values) => {
			setSearchModalStatus(true);
		},
	});

	const searchWrapperRef = useRef<HTMLDivElement>(null);
	const inputWrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent | TouchEvent) => {
			if (
				searchWrapperRef.current &&
				!searchWrapperRef.current.contains(event.target as Node) &&
				inputWrapperRef.current &&
				!inputWrapperRef.current.contains(event.target as Node)
			) {
				setSearchModalStatus(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('touchstart', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('touchstart', handleClickOutside);
		};
	}, []);

	useEffect(() => {
		if (formik.values.searchInput) {
			setSearchModalStatus(true);
		} else {
			setSearchModalStatus(false);
		}
	}, [formik.values.searchInput]);

	const searchPages: {
		[key: string]: {
			id: string;
			text: string;
			path: string;
			icon: string;
			groupText?: string;
		};
	} = {};
	const allMenus = menus || [
		masterPageMenu,
		operationsPageMenu,
		reportsPageMenu,
		financePageMenu,
		userControlAccessPageMenu,
		dashboardPagesMenu,
		companyPageMenu,
		companyCreationRequestsMenu,
		passwordResetRequestsMenu,
		commonUpdatePageMenu,
		schemaSyncPageMenu,
	];
	allMenus.forEach((menu) => {
		if (menu) {
			Object.values(menu).forEach((menuGroup: any) => {
				if (menuGroup && menuGroup.subMenu) {
					Object.values(menuGroup.subMenu).forEach((item: any) => {
						if (item && item.path) {
							searchPages[item.id] = {
								id: item.id,
								text: item.text,
								path: item.path,
								icon: item.icon,
								groupText: menuGroup.text,
							};
						}
					});
				}
			});
		}
	});

	const filterResult = Object.keys(searchPages)
		.filter(
			(key) =>
				searchPages[key].text
					.toString()
					.toLowerCase()
					.includes(formik.values.searchInput.toLowerCase()) ||
				searchPages[key].path
					.toString()
					.toLowerCase()
					.includes(formik.values.searchInput.toLowerCase()),
		)
		.map((i) => searchPages[i]);
	return (
		<Manager>
			<Reference>
				{({ ref }) => (
					<div className='position-relative' ref={(node) => {
						// @ts-ignore
						ref(node);
						// @ts-ignore
						inputWrapperRef.current = node;
					}}>
						<div className='d-flex align-items-center' data-tour='search'>
							<Input
								id='searchInput'
								type='search'
								className='border-0 shadow-none bg-transparent'
								placeholder='Search Pages'
								onChange={formik.handleChange}
								value={formik.values.searchInput}
								autoComplete='off'
								onFocus={() => { if (formik.values.searchInput) setSearchModalStatus(true) }}
							/>
						</div>
					</div>
				)}
			</Reference>
			{searchModalStatus && (
				<Portal>
					<Popper placement="bottom-start" modifiers={[{ name: 'flip', options: { fallbackPlacements: ['bottom-end', 'top-start'] } }]}>
						{({ ref, style, placement }) => (
							<div 
								ref={(node) => {
									// @ts-ignore
									ref(node);
									// @ts-ignore
									searchWrapperRef.current = node;
								}}
								className="dropdown-menu show shadow" 
								style={{ 
									...style,
									width: '280px',
									maxHeight: '400px',
									overflowY: 'auto',
									zIndex: 1050,
									marginTop: '0.5rem'
								}}
								data-placement={placement}
							>
								<div className="px-3 py-2 text-muted" style={{ fontSize: '0.8rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
									Results: {filterResult.length}
								</div>
					<div className="list-group list-group-flush">
						{filterResult.length ? (
							filterResult.map((item) => (
								<button
									type="button"
									key={item.id}
									className='list-group-item list-group-item-action border-0 d-flex flex-column text-start'
									onClick={() => {
										navigate(`../${item.path}`);
										setSearchModalStatus(false);
										formik.resetForm();
									}}>
									<div className="d-flex align-items-center">
										{item.icon && (
											<Icon
												icon={item.icon}
												size='lg'
												className='me-2'
												color='primary'
											/>
										)}
										<span>{item.text}</span>
									</div>
									{item.groupText && (
										<small className="text-muted ms-4" style={{ fontSize: '0.75rem' }}>
											From: {item.groupText}
										</small>
									)}
								</button>
							))
						) : (
							<div className="px-3 py-3 text-muted text-center">
								No result found for "{formik.values.searchInput}"
							</div>
						)}
					</div>
				</div>
				)}
			</Popper>
		</Portal>
			)}
		</Manager>
	);
};

export default Search;
