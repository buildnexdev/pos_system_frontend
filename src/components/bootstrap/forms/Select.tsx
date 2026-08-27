/* eslint-disable react-hooks/exhaustive-deps */
import React, { forwardRef, HTMLAttributes, ReactNode, isValidElement, useMemo } from 'react';
import classNames from 'classnames';
import ReactSelect from 'react-select';
import Option, { IOptionsProps, Options } from '../Option';
import Validation from './Validation';

interface ISelectProps extends Partial<IOptionsProps>, HTMLAttributes<HTMLSelectElement> {
	id?: string;
	className?: string;
	name?: string;
	children?: ReactNode;
	ariaLabel: string;
	placeholder?: string;
	size?: 'lg' | 'sm';
	multiple?: boolean;
	disabled?: boolean;
	required?: boolean;
	ariaDescribedby?: string;
	ariaLabelledby?: string;
	title?: string;
	value?: string | number | string[];
	defaultValue?: string | string[];
	isTouched?: boolean;
	isValid?: boolean;
	invalidFeedback?: string;
	validFeedback?: string;
	isValidMessage?: boolean;
	isTooltipFeedback?: boolean;
	isSearchable?: boolean;
	searchPlaceholder?: string;
	menuPlacement?: 'auto' | 'bottom' | 'top';
	menuShouldScrollIntoView?: boolean;
	onBlur?(...args: unknown[]): unknown;
	onChange?(...args: unknown[]): unknown;
	onFocus?(...args: unknown[]): unknown;
	onInput?(...args: unknown[]): unknown;
	onInvalid?(...args: unknown[]): unknown;
	onSelect?(...args: unknown[]): unknown;
}
const Select = forwardRef<HTMLSelectElement, ISelectProps>(
	(
		{
			id,
			name,
			className,
			children,
			required,
			placeholder,
			ariaDescribedby,
			ariaLabelledby,
			ariaLabel,
			list,
			multiple,
			title,
			size,
			disabled,
			value,
			defaultValue,
			isValid,
			isTouched,
			invalidFeedback,
			validFeedback,
			isValidMessage = true,
			isTooltipFeedback,
			isSearchable = true,
			searchPlaceholder,
			menuPlacement = 'auto',
			menuShouldScrollIntoView = false,
			onBlur,
			onChange,
			onFocus,
			onInput,
			onInvalid,
			onSelect,
			...props
		},

		ref,
	) => {
		const hasInvalidState = Boolean(!isValid && isTouched && invalidFeedback);
		const hasValidState = Boolean(!isValid && isTouched && !invalidFeedback);

		const flattenOptionElements = (nodes: ReactNode): any[] => {
			const collected: any[] = [];
			React.Children.forEach(nodes, (node) => {
				if (!isValidElement(node)) return;
				if (node.type === React.Fragment) {
					collected.push(...flattenOptionElements(node.props?.children));
					return;
				}
				collected.push(node);
			});
			return collected;
		};

		const getSearchableText = (input: any): string => {
			if (input === null || input === undefined) return '';
			if (typeof input === 'string' || typeof input === 'number') return String(input);
			if (Array.isArray(input)) {
				return input
					.map((item) => getSearchableText(item))
					.join(' ')
					.trim();
			}
			if (typeof input === 'object' && 'props' in input) {
				return getSearchableText((input as any).props?.children);
			}
			return '';
		};

		const normalizedOptions = useMemo(() => {
			if (list && Array.isArray(list)) {
				return list.map((item) => ({
					value: item.value ?? '',
					label: getSearchableText(item.text ?? item.label ?? ''),
					searchText: getSearchableText(item.text ?? item.label ?? ''),
					isDisabled: false,
				}));
			}

			if (children) {
				return flattenOptionElements(children)
					.filter((child) => isValidElement(child))
					.map((child: any) => ({
						value: child?.props?.value ?? '',
						label: getSearchableText(child?.props?.children ?? ''),
						searchText: getSearchableText(child?.props?.children ?? ''),
						isDisabled: Boolean(child?.props?.disabled),
					}));
			}

			return [];
		}, [children, list]);

		const selectedValue = useMemo(() => {
			if (!multiple) {
				const currentValue = value ?? defaultValue ?? '';
				return (
					normalizedOptions.find(
						(option: any) => String(option.value) === String(currentValue),
					) || null
				);
			}

			const valueArr = Array.isArray(value)
				? value
				: typeof value === 'string'
					? value.split(',').filter(Boolean)
					: [];
			return normalizedOptions.filter((option: any) =>
				valueArr.some((current) => String(current) === String(option.value)),
			);
		}, [defaultValue, multiple, normalizedOptions, value]);

		const emitChangeForCompatibility = (selectedOption: any) => {
			const nextValue = multiple
				? (selectedOption || []).map((option: any) => option.value)
				: (selectedOption?.value ?? '');

			if (onChange) {
				onChange({
					target: {
						id,
						name,
						value: nextValue,
					},
				});
			}
		};

		const emitBlurForCompatibility = () => {
			if (onBlur) {
				onBlur({
					target: {
						id,
						name,
						value,
					},
				});
			}
		};
		const searchableMinHeight =
			size === 'sm'
				? 'calc(2.25rem + 2px)'
				: size === 'lg'
					? 'calc(3.5rem + 2px)'
					: 'calc(3rem + 2px)';
		const isInlineMemberSelect = String(className || '').includes('inline-member-select');
		const controlHeight = isInlineMemberSelect ? '32px' : searchableMinHeight;

		const themeMoss = 'var(--sn-moss, #2d5f4f)';
		const themeMossSoft = 'var(--sn-moss-soft, #dce8e3)';
		const themeFocusRing = '0 0 0 3px rgba(45, 95, 79, 0.18)';

		const selectStyles = useMemo(
			() => ({
				container: (provided: any) => ({
					...provided,
					width: '100%',
				}),
				control: (provided: any, state: any) => {
					const selectClass = String(state?.selectProps?.className || '');
					const isFormFloating = selectClass.includes('in-form-floating');
					const borderColor = hasInvalidState
						? '#dc3545'
						: hasValidState
							? '#198754'
							: state.isFocused
								? themeMoss
								: provided.borderColor;
					const boxShadow = hasInvalidState
						? '0 0 0 0.25rem rgba(220,53,69,.25)'
						: hasValidState
							? '0 0 0 0.25rem rgba(25,135,84,.25)'
							: state.isFocused
								? themeFocusRing
								: 'none';
					return {
						...provided,
						minHeight: controlHeight,
						height: controlHeight,
						alignItems: isFormFloating ? 'center' : provided.alignItems,
						overflow: isFormFloating ? 'hidden' : provided.overflow,
						backgroundColor: '#fff',
						borderRadius: isInlineMemberSelect ? '0.5rem' : '0.85rem',
						borderColor,
						boxShadow,
					};
				},
				placeholder: (provided: any, state: any) => {
					const selectClass = String(state?.selectProps?.className || '');
					const isCompactInline = selectClass.includes('inline-member-select');
					const isFormFloating = selectClass.includes('in-form-floating');
					const placeholderText = String(state?.selectProps?.placeholder ?? '').trim();
					return {
						...provided,
						color: 'var(--sn-ink-muted, #6b6457)',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						maxWidth: '100%',
						marginTop: isCompactInline || isFormFloating ? 0 : '0.2rem',
						lineHeight: isFormFloating ? '1.25' : provided.lineHeight,
						display: placeholderText ? provided.display : 'none',
					};
				},
				valueContainer: (provided: any, state: any) => {
					const selectClass = String(state?.selectProps?.className || '');
					const isCompactInline = selectClass.includes('inline-member-select');
					const isFormFloating = selectClass.includes('in-form-floating');
					const placeholderText = String(state?.selectProps?.placeholder ?? '').trim();
					return {
						...provided,
						alignItems: isFormFloating ? 'center' : provided.alignItems,
						flexWrap: isFormFloating ? 'nowrap' : provided.flexWrap,
						paddingTop: isCompactInline
							? '0'
							: isFormFloating
								? placeholderText
									? '1.05rem'
									: '0.85rem'
								: placeholderText
									? '1.1rem'
									: '0.65rem',
						paddingBottom: isCompactInline
							? '0'
							: isFormFloating
								? '0.15rem'
								: '0.2rem',
						paddingLeft: isCompactInline ? '8px' : provided.paddingLeft,
						paddingRight: isCompactInline ? '8px' : provided.paddingRight,
					};
				},
				singleValue: (provided: any, state: any) => {
					const selectClass = String(state?.selectProps?.className || '');
					const isAssignRightsRoleSelect = selectClass.includes('assign-rights-role-select');
					const isCashTransactionFullTextSelect = selectClass.includes(
						'cash-transaction-fulltext-select',
					);
					const isCompactInline = selectClass.includes('inline-member-select');
					const isFormFloating = selectClass.includes('in-form-floating');
					return {
						...provided,
						color: 'var(--sn-ink, #1a1814)',
						marginTop: isCompactInline || isFormFloating ? '0' : '0.15rem',
						fontSize: isCompactInline ? '0.85rem' : provided.fontSize,
						whiteSpace: 'nowrap',
						overflow:
							isAssignRightsRoleSelect || isCashTransactionFullTextSelect
								? 'visible'
								: 'hidden',
						textOverflow:
							isAssignRightsRoleSelect || isCashTransactionFullTextSelect
								? 'clip'
								: 'ellipsis',
					};
				},
				menuPortal: (provided: any) => ({
					...provided,
					zIndex: 9999,
				}),
				menu: (provided: any, state: any) => {
					const selectClass = String(state?.selectProps?.className || '');
					const isAssignRightsRoleSelect = selectClass.includes('assign-rights-role-select');
					const isCashTransactionFullTextSelect = selectClass.includes(
						'cash-transaction-fulltext-select',
					);
					return {
						...provided,
						zIndex: 9999,
						backgroundColor: '#ffffff',
						borderRadius: '0.85rem',
						overflow: 'hidden',
						...(isAssignRightsRoleSelect
							? {
									left: 'auto',
									right: 0,
									width: 'max-content',
									minWidth: '100%',
									maxWidth: 'calc(100vw - 16px)',
								}
							: {}),
						...(isCashTransactionFullTextSelect
							? {
									width: 'max-content',
									minWidth: '100%',
									maxWidth: 'calc(100vw - 16px)',
								}
							: {}),
					};
				},
				menuList: (provided: any) => ({
					...provided,
					backgroundColor: '#ffffff',
				}),
				option: (provided: any, state: any) => {
					const selectClass = String(state?.selectProps?.className || '');
					const isAssignRightsRoleSelect = selectClass.includes('assign-rights-role-select');
					const isCashTransactionFullTextSelect = selectClass.includes(
						'cash-transaction-fulltext-select',
					);
					const hoverBackground = state.isSelected ? themeMoss : themeMossSoft;
					return {
						...provided,
						backgroundColor: state.isSelected
							? themeMoss
							: state.isFocused
								? themeMossSoft
								: 'transparent',
						color: state.isSelected ? '#ffffff' : '#212529',
						cursor: 'pointer',
						transition: 'none',
						':hover': {
							backgroundColor: hoverBackground,
							color: state.isSelected ? '#ffffff' : '#212529',
						},
						whiteSpace: 'nowrap',
						overflow:
							isAssignRightsRoleSelect || isCashTransactionFullTextSelect
								? 'visible'
								: 'hidden',
						textOverflow:
							isAssignRightsRoleSelect || isCashTransactionFullTextSelect
								? 'clip'
								: 'ellipsis',
					};
				},
				input: (provided: any, state: any) => ({
					...provided,
					opacity: state.selectProps.menuIsOpen ? 1 : 0,
					width: state.selectProps.menuIsOpen ? '100%' : 0,
					minWidth: state.selectProps.menuIsOpen ? '2ch' : 0,
					margin: 0,
					padding: state.selectProps.menuIsOpen ? '0 0.25rem' : 0,
					border: 'none',
					background: 'transparent',
					boxShadow: 'none',
				}),
				inputContainer: (provided: any, state: any) => ({
					...provided,
					margin: 0,
					padding: 0,
					maxWidth: state.selectProps.menuIsOpen ? '100%' : 0,
					overflow: state.selectProps.menuIsOpen ? 'visible' : 'hidden',
					position: state.selectProps.menuIsOpen ? 'relative' : 'absolute',
					width: state.selectProps.menuIsOpen ? 'auto' : '1px',
					height: state.selectProps.menuIsOpen ? 'auto' : '1px',
					clip: state.selectProps.menuIsOpen ? 'auto' : 'rect(0, 0, 0, 0)',
				}),
			}),
			[controlHeight, hasInvalidState, hasValidState, isInlineMemberSelect],
		);

		return (
			<>
				{isSearchable ? (
					<ReactSelect
						inputId={id}
						name={name}
						className={classNames(
							'sn-floating-select',
							{
								'is-invalid': hasInvalidState,
								'is-valid': hasValidState,
							},
							className,
						)}
						classNamePrefix='sn-select'
						isMulti={multiple}
						isDisabled={disabled}
						isSearchable
						placeholder={
							searchPlaceholder ??
							(typeof placeholder === 'string' ? placeholder : '')
						}
						options={normalizedOptions}
						value={selectedValue as any}
						onChange={emitChangeForCompatibility}
						onBlur={emitBlurForCompatibility}
						onFocus={onFocus as any}
						aria-label={ariaLabel}
						aria-labelledby={ariaLabelledby}
						aria-describedby={ariaDescribedby}
						menuPortalTarget={document.body}
						menuPlacement={menuPlacement}
						menuShouldScrollIntoView={menuShouldScrollIntoView}
						filterOption={(candidate: any, inputValue: string) => {
							const text =
								`${candidate?.data?.searchText ?? candidate?.label ?? ''}`.toLowerCase();
							const valueText = `${candidate?.value ?? ''}`.toLowerCase();
							const search = inputValue.toLowerCase().trim();
							return text.includes(search) || valueText.includes(search);
						}}
						styles={selectStyles}
					/>
				) : (
					<select
						ref={ref}
						id={id}
						className={classNames(
							'form-select',
							{
								[`form-select-${size}`]: size,
								'text-muted': value === '' && placeholder,
								'is-invalid': !isValid && isTouched && invalidFeedback,
								'is-valid': !isValid && isTouched && !invalidFeedback,
							},
							className,
						)}
						name={name}
						aria-label={ariaLabel}
						aria-describedby={ariaDescribedby}
						aria-labelledby={ariaLabelledby}
						multiple={multiple}
						disabled={disabled}
						title={title}
						value={value}
						defaultValue={defaultValue}
						required={required}
						onBlur={onBlur}
						onChange={onChange}
						onFocus={onFocus}
						onInput={onInput}
						onInvalid={onInvalid}
						onSelect={onSelect}
						{...props}>
						{placeholder && (
							<Option value='' hidden>
								{placeholder}
							</Option>
						)}
						{children || (list && <Options list={list} />)}
					</select>
				)}
				{isValidMessage && (
					<Validation
						isTouched={isTouched}
						invalidFeedback={invalidFeedback}
						validFeedback={validFeedback}
						isTooltip={isTooltipFeedback}
					/>
				)}
			</>
		);
	},
);
Select.displayName = 'Select';

export default Select;
