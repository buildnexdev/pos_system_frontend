/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
	FC,
	forwardRef,
	HTMLAttributes,
	ReactNode,
	useState,
	useEffect,
	useContext,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getLoginObjDetails } from '../../redux/login/login.selector';
import { TIcons } from '../../type/icons-type';
import Item from './Item';
import List from './List';
import ThemeContext from '../../contexts/themeContext';

interface INavigationLineProps {
	className?: string;
}
export const NavigationLine: FC<INavigationLineProps> = ({ className }) => {
	return <hr className={classNames('navigation-line', className)} />;
};
NavigationLine.propTypes = {
	className: PropTypes.string,
};
NavigationLine.defaultProps = {
	className: undefined,
};

interface INavigationTitleProps extends HTMLAttributes<HTMLSpanElement> {
	className?: string;
	children: ReactNode;
}
export const NavigationTitle: FC<INavigationTitleProps> = ({ className, children, ...props }) => {
	return (
		<li className='navigation-item'>
			{/* eslint-disable-next-line react/jsx-props-no-spreading */}
			<span className={classNames('navigation-title', className)} {...props}>
				{children}
			</span>
		</li>
	);
};
NavigationTitle.propTypes = {
	children: PropTypes.node.isRequired as any,
	className: PropTypes.string,
};
NavigationTitle.defaultProps = {
	className: undefined,
};

interface INavigationProps {
	horizontal?: boolean;
	menu: {
		[key: string]: {
			id?: string | number;
			text?: string;
			path?: string;
			icon?: TIcons;
			isDisable?: boolean;
			hide?: boolean;
			subMenu?: {
				[key: string]: {
					id?: string | number;
					text?: string;
					path?: string;
					icon?: TIcons;
					isDisable?: boolean;
					hide?: boolean;
				};
			} | null;
		};
	};
	id: string;
	className?: string;
}
const Navigation = forwardRef<HTMLElement, INavigationProps>(
	({ menu, horizontal, id, className, ...props }, ref) => {
		const [activeItem, setActiveItem] = useState<string | null>(null);
		const location = useLocation();
		const { activeNavigationMenu, setActiveNavigationMenu } = useContext(ThemeContext);

		const loginData = useSelector(getLoginObjDetails);
		const { databaseName } = loginData;

		// Close this menu if another menu is opened globally
		useEffect(() => {
			if (activeNavigationMenu && activeNavigationMenu !== activeItem && activeItem) {
				setActiveItem(null);
			}
		}, [activeNavigationMenu, activeItem]);

		// Timer-based auto-close (closes after 5 seconds of inactivity)
		// useEffect(() => {
		// 	if (!activeItem) return;

		// 	const timer = setTimeout(() => {
		// 		setActiveItem(null);
		// 	}, 5000); // 5 seconds

		// 	return () => clearTimeout(timer);
		// }, [activeItem]);

		// ESC key to close menus
		useEffect(() => {
			const handleKeyDown = (event: KeyboardEvent) => {
				if (event.key === 'Escape' && activeItem) {
					setActiveItem(null);
				}
			};

			document.addEventListener('keydown', handleKeyDown);
			return () => document.removeEventListener('keydown', handleKeyDown);
		}, [activeItem]);

		const setActiveItemAndPersist = (Id: any, hasChildren: boolean = false) => {
			// If clicking the same menu, close it
			if (Id === activeItem) {
				setActiveItem(null);
				setActiveNavigationMenu(null);
			} else if (hasChildren) {
				// If clicking a different menu with children (main menu), close the current one and open the new one
				setActiveItem(Id);
				setActiveNavigationMenu(Id);
			} else {
				// If clicking a sub-menu item, don't change the active menu state
				// This keeps the parent menu open
			}
		};

		const { t } = useTranslation('menu');

		function fillMenu(
			data:
				| {
					id?: string | number;
					text?: string;
					path?: string;
					icon?: TIcons;
					isDisable?: boolean;
					subMenu?:
					| {
						id?: string | number;
						text?: string;
						path?: string;
						icon?: TIcons;
						isDisable?: boolean;
					}[]
					| undefined;
				}[]
				| any,
			parentId: string,
			rootId: string,
			isHorizontal: boolean | undefined,
			isMore: boolean | undefined,
		) {
			return Object.keys(data).map((item) => {
				if (data[item].id === 'centerWiseReport' && (databaseName !== 'AanandhaJeevan')) {
					return null;
				}
				return data[item].path ? (
					<Item
						key={data[item].id}
						rootId={rootId}
						id={data[item].id}
						title={data[item].text}
						icon={data[item].icon}
						to={`${data[item].path}`}
						parentId={parentId}
						isHorizontal={isHorizontal}
						setActiveItem={(Id: any) =>
							setActiveItemAndPersist(Id, !!data[item].subMenu)
						}
						activeItem={activeItem || undefined}
						notification={data[item].notification}
						hide={data[item].hide}>
						{!!data[item].subMenu &&
							fillMenu(
								data[item].subMenu,
								data[item].id,
								rootId,
								isHorizontal,
								undefined,
							)}
					</Item>
				) : (
					!isMore &&
					!isHorizontal && (
						<NavigationTitle key={data[item].id}>
							{t(data[item].text) as ReactNode}
						</NavigationTitle>
					)
				);
			});
		}

		return (
			// @ts-ignore
			// eslint-disable-next-line react/jsx-props-no-spreading
			<nav ref={ref} aria-label={id} className={className} {...props}>
				<List id={id} horizontal={horizontal}>
					{fillMenu(menu, id, id, horizontal, undefined)}
					{horizontal && (
						<Item
							rootId={`other-${id}`}
							title={t('More') as string}
							icon='MoreHoriz'
							isHorizontal
							isMore>
							{fillMenu(menu, `other-${id}`, `other-${id}`, false, true)}
						</Item>
					)}
				</List>
			</nav>
		);
	},
);
Navigation.displayName = 'Navigation';
Navigation.propTypes = {
	horizontal: PropTypes.bool,
	// @ts-ignore
	menu: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		text: PropTypes.string,
		path: PropTypes.string,
		icon: PropTypes.string,
		isDisable: PropTypes.bool,
		subMenu: PropTypes.arrayOf(
			PropTypes.shape({
				id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
				text: PropTypes.string,
				path: PropTypes.string,
				icon: PropTypes.string,
				isDisable: PropTypes.bool,
			}),
		),
	}).isRequired,
	id: PropTypes.string.isRequired,
	className: PropTypes.string,
};
Navigation.defaultProps = {
	horizontal: false,
	className: undefined,
};

export default Navigation;
