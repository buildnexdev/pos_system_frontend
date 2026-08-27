import React, {
	FC,
	forwardRef,
	HTMLAttributes,
	ReactElement,
	ReactNode,
	useLayoutEffect,
	useRef,
} from 'react';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import Portal from '../../layout/Portal/Portal';
import TagWrapper from '../TagWrapper';
import useEventListener from '../../hooks/useEventListener';
import { TModalFullScreen, TModalSize } from '../../type/modal-type';

interface IModalTitleProps extends HTMLAttributes<HTMLElement> {
	id: string;
	children: ReactNode;
	className?: string;
	tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'span';
}

export const ModalTitle = forwardRef<HTMLHeadingElement, IModalTitleProps>(
	({ tag = 'h5', id, children, className, ...props }, ref) => {
		return (
			<TagWrapper
				tag={tag}
				ref={ref}
				id={id}
				className={classNames('modal-title', className)}
				{...props}>
				{children}
			</TagWrapper>
		);
	},
);
ModalTitle.displayName = 'ModalTitle';

interface IModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactElement<IModalTitleProps> | ReactNode;
	className?: string;
	setIsOpen?(...args: unknown[]): unknown | undefined;
}

export const ModalHeader = forwardRef<HTMLDivElement, IModalHeaderProps>(
	({ children, className, setIsOpen, ...props }, ref) => {
		return (
			<div ref={ref} className={classNames('modal-header', className)} {...props}>
				{children}
				{setIsOpen && (
					<button
						type='button'
						className='btn-close'
						aria-label='Close'
						onClick={() => setIsOpen(false)}
					/>
				)}
			</div>
		);
	},
);
ModalHeader.displayName = 'ModalHeader';

interface IModalBodyProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	className?: string;
}

export const ModalBody = forwardRef<HTMLDivElement, IModalBodyProps>(
	({ children, className, ...props }, ref) => {
		return (
			<div ref={ref} className={classNames('modal-body', className)} {...props}>
				{children}
			</div>
		);
	},
);
ModalBody.displayName = 'ModalBody';

interface IModalFooterProps extends HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	className?: string;
}

export const ModalFooter = forwardRef<HTMLDivElement, IModalFooterProps>(
	({ children, className, ...props }, ref) => {
		return (
			<div ref={ref} className={classNames('modal-footer', className)} {...props}>
				{children}
			</div>
		);
	},
);
ModalFooter.displayName = 'ModalFooter';

interface IModalProps extends Record<string, any> {
	children:
		| ReactElement<IModalHeaderProps | IModalBodyProps | IModalFooterProps>
		| ReactElement<IModalHeaderProps | IModalBodyProps | IModalFooterProps>[]
		| ReactNode;
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	id?: string;
	titleId?: string;
	isStaticBackdrop?: boolean;
	isScrollable?: boolean;
	isCentered?: boolean;
	size?: TModalSize;
	fullScreen?: TModalFullScreen;
	isAnimation?: boolean;
}

const Modal: FC<IModalProps> = ({
	children,
	isOpen,
	setIsOpen,
	id,
	titleId,
	isStaticBackdrop,
	isScrollable,
	isCentered,
	size,
	fullScreen,
	isAnimation = true,
	...props
}) => {
	const refModal = useRef<HTMLDivElement | null>(null);
	const ref = useRef<HTMLDivElement | null>(null);

	useLayoutEffect(() => {
		if (isOpen) {
			document.body.classList.add('modal-open');
		}
		return () => {
			document.body.classList.remove('modal-open');
		};
	}, [isOpen]);

	const closeModal = (event: { target: any }) => {
		if (ref.current && !ref.current.contains(event.target) && !isStaticBackdrop) {
			setIsOpen(false);
		}
	};

	useEventListener('mousedown', closeModal);
	useEventListener('touchstart', closeModal);

	const escFunction = (event: { key: string }) => {
		if (event.key === 'Escape' && !isStaticBackdrop) {
			setIsOpen(false);
		}
	};

	useEventListener('keydown', escFunction);

	const ANIMATION_PROPS = isAnimation
		? {
				initial: { opacity: 0, y: '-50%' },
				animate: { opacity: 1, x: '0%', y: '0%' },
				exit: { opacity: 0, y: '-50%' },
				transition: { ease: 'easeInOut', duration: 0.3 },
			}
		: {
				initial: false,
				animate: { opacity: 1 },
				// `exit` must be a transition target, not `false` (see MotionProps typings).
				exit: { opacity: 0, transition: { duration: 0 } },
				transition: { duration: 0 },
			};

	return (
		<Portal>
			{/* One keyed child only — fragment + two siblings broke AnimatePresence (double overlay / double enter). */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						key='modal-layer'
						style={{
							position: 'fixed',
							inset: 0,
							zIndex: 1055,
							pointerEvents: 'none',
						}}
						{...ANIMATION_PROPS}>
						<div
							className={classNames('modal-backdrop', { fade: isAnimation }, 'show')}
							style={{ pointerEvents: 'auto' }}
						/>
						<div
							ref={refModal}
							className={classNames('modal', { fade: isAnimation }, 'show')}
							role='dialog'
							style={{ display: 'block', pointerEvents: 'auto' }}
							id={id}
							tabIndex={-1}
							aria-labelledby={titleId}
							aria-hidden='true'
							{...props}>
							<div
								ref={ref}
								onMouseDown={(e) => e.stopPropagation()}
								onTouchStart={(e) => e.stopPropagation()}
								className={classNames('modal-dialog', {
									'modal-dialog-scrollable': isScrollable,
									'modal-dialog-centered': isCentered,
									[`modal-${size}`]: size,
									[`modal-fullscreen${
										typeof fullScreen === 'string' ? `-${fullScreen}-down` : ''
									}`]: fullScreen,
								})}>
								<div className='modal-content'>{children}</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</Portal>
	);
};

export default Modal;
