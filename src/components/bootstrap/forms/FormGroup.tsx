import React, { cloneElement, FC, HTMLAttributes, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import TagWrapper from '../../TagWrapper';
import Label from './Label';
import FormText from './FormText';

interface IFormGroupProps extends HTMLAttributes<HTMLElement> {
	children: ReactElement | ReactElement[];
	className?: string;
	labelClassName?: string;
	childWrapperClassName?: string;
	tag?: 'div' | 'section';
	isFloating?: boolean;
	id?: string;
	label?: ReactNode;
	size?: 'lg' | 'sm' | null;
	isHiddenLabel?: boolean;
	isColForLabel?: boolean;
	formText?: ReactNode;
}
const FormGroup: FC<IFormGroupProps> = ({
	children,
	tag = 'div',
	className,
	labelClassName,
	childWrapperClassName,
	label,
	id,
	isFloating,
	size,
	isColForLabel,
	isHiddenLabel,
	formText,
	...props
}) => {
	const LABEL = (
		<Label
			className={labelClassName}
			htmlFor={id}
			isHidden={isHiddenLabel}
			isColForLabel={isColForLabel}
			size={size}>
			{label}
		</Label>
	);

	const childElement = Array.isArray(children) ? null : children;
	const childProps = childElement?.props as { placeholder?: string; className?: string };
	const isSelectChild =
		childElement &&
		typeof childElement.type !== 'string' &&
		(childElement.type as { displayName?: string }).displayName === 'Select';
	const childPlaceholder = childProps?.placeholder;
	// Bootstrap form-floating requires a placeholder for :placeholder-shown; use a blank space
	// so the visible label does not duplicate label text or "Enter …" helper text from children.
	const floatingInputPlaceholder = ' ';

	const CHILDREN =
		id && childElement
			? cloneElement(childElement, {
					id,
					size: size || childElement.props.size,
					className: classNames(childProps?.className, {
						'in-form-floating': isFloating && isSelectChild,
					}),
					placeholder: isFloating
						? isSelectChild
							? childPlaceholder
							: floatingInputPlaceholder
						: childPlaceholder,
					'aria-describedby': formText ? `${id}-text` : null,
				})
			: children;

	const FORM_TEXT = formText && <FormText id={`${id}-text`}>{formText}</FormText>;
	return (
		<TagWrapper
			tag={tag}
			className={classNames({ 'form-floating': isFloating, row: isColForLabel }, className)}
			// eslint-disable-next-line react/jsx-props-no-spreading
			{...props}>
			{label && !isFloating && LABEL}

			{childWrapperClassName ? (
				<div className={childWrapperClassName}>
					{CHILDREN}
					{FORM_TEXT}
				</div>
			) : (
				CHILDREN
			)}

			{label && isFloating && LABEL}

			{!childWrapperClassName && FORM_TEXT}
		</TagWrapper>
	);
};

export default FormGroup;
