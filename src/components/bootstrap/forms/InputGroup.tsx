import React, {
	Children,
	cloneElement,
	forwardRef,
	HTMLAttributes,
	isValidElement,
	ReactElement,
	type ReactNode,
} from 'react';
import classNames from 'classnames';
import TagWrapper from '../../TagWrapper';
import Validation from './Validation';
import { IInputProps } from './Input';
import { IButtonProps } from '../Button';
import { ITextareaProps } from './Textarea';
import { IChecksProps } from './Checks';

interface IInputGroupTextProps extends HTMLAttributes<HTMLElement> {
	tag?: 'span' | 'div' | 'label';
	children: ReactElement<IChecksProps> | string;
	id?: string;
	className?: string;
	htmlFor?: string;
}
export const InputGroupText = forwardRef<HTMLDivElement, IInputGroupTextProps>(
	({ tag = 'span', id, className, children, htmlFor, ...props }, ref) => {
		return (
			<TagWrapper
				tag={tag}
				ref={ref}
				id={id}
				className={classNames('input-group-text', className)}
				htmlFor={htmlFor}
				// eslint-disable-next-line react/jsx-props-no-spreading
				{...props}>
				{}
				{isValidElement(children) && children?.props?.type
					? cloneElement(children, { isFormCheckInput: true })
					: children}
			</TagWrapper>
		);
	},
);
InputGroupText.displayName = 'InputGroupText';

type TInputGroupChildren =
	| ReactElement<IInputGroupTextProps>[]
	| ReactElement<IInputProps>[]
	| ReactElement<ITextareaProps>[]
	| ReactElement<IButtonProps>[];

/** Props that may appear on Input/Textarea children inside InputGroup */
type TInputGroupChildFeedbackProps = {
	invalidFeedback?: string;
	validFeedback?: string;
	isValidMessage?: boolean;
};
interface IInputGroupProps extends HTMLAttributes<HTMLDivElement> {
	children: TInputGroupChildren;
	id?: string;
	className?: string;
	isWrap?: boolean;
	size?: 'sm' | 'lg';
}
const InputGroup = forwardRef<HTMLDivElement, IInputGroupProps>(
	({ id, className, children, isWrap = true, size, ...props }, ref) => {
		let IS_VALID = false;
		let IS_TOUCHED = false;
		let INVALID_FEEDBACK;
		let VALID_FEEDBACK;
		let IS_TOOLTIP_FEEDBACK = false;

		const validClass = (child: TInputGroupChildren) => {
			for (let i = 0; i < child?.length; i += 1) {
				// @ts-ignore
				if (child[i].props.isValid) {
					IS_VALID = true;
				}
				// @ts-ignore
				if (child[i].props.isTouched) {
					IS_TOUCHED = true;
				}
				// @ts-ignore
				if (child[i].props.invalidFeedback) {
					// @ts-ignore
					INVALID_FEEDBACK = child[i].props.invalidFeedback;
				}
				// @ts-ignore
				if (child[i].props.validFeedback) {
					// @ts-ignore
					VALID_FEEDBACK = child[i].props.validFeedback;
				}
				// @ts-ignore
				if (child[i].props.isTooltipFeedback) {
					IS_TOOLTIP_FEEDBACK = true;
					break;
				}
			}
		};
		validClass(children);

		return (
			<div
				ref={ref}
				id={id}
				className={classNames(
					'input-group',
					{
						'flex-nowrap': !isWrap,
						[`input-group-${size}`]: size,
						'has-validation':
							(!IS_VALID && IS_TOUCHED && (INVALID_FEEDBACK || VALID_FEEDBACK)) ||
							(IS_VALID && VALID_FEEDBACK),
					},
					className,
				)}
				{...props}>
				{Children.map(children as ReactNode, (item, index) => {
					if (!isValidElement(item)) {
						return item;
					}
					const childProps = item.props as TInputGroupChildFeedbackProps;
					const hasFeedback = childProps.invalidFeedback || childProps.validFeedback;
					// InputGroup renders <Validation> below; suppress duplicate feedback on the child
					return hasFeedback
						? cloneElement(item as ReactElement<TInputGroupChildFeedbackProps>, {
								key: index,
								isValidMessage: false,
							})
						: cloneElement(item, { key: index });
				})}
				<Validation
					isTouched={IS_TOUCHED}
					validFeedback={VALID_FEEDBACK}
					invalidFeedback={INVALID_FEEDBACK}
					isTooltip={IS_TOOLTIP_FEEDBACK}
				/>
			</div>
		);
	},
);
InputGroup.displayName = 'InputGroup';

export default InputGroup;
