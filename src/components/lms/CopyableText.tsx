import React, { useCallback } from 'react';
import Icon from '../icon/Icon';
import showNotification from '../extras/showNotification';
import { LMS } from './Charts';

async function copyToClipboard(text: string): Promise<boolean> {
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
			return true;
		}
	} catch {
		// fall through to legacy copy
	}

	try {
		const textarea = document.createElement('textarea');
		textarea.value = text;
		textarea.style.position = 'fixed';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.select();
		const ok = document.execCommand('copy');
		document.body.removeChild(textarea);
		return ok;
	} catch {
		return false;
	}
}

export interface CopyableTextProps {
	/** Shown in the UI (may be masked). */
	display: React.ReactNode;
	/** Value written to the clipboard; defaults to `display` when it is a string. */
	copyValue?: string;
	/** Short label for the success toast, e.g. "Member ID". */
	label?: string;
}

const CopyableText: React.FC<CopyableTextProps> = ({ display, copyValue, label }) => {
	const resolvedCopy =
		copyValue ?? (typeof display === 'string' ? display : undefined);
	const canCopy = Boolean(resolvedCopy && resolvedCopy !== '-');

	const handleCopy = useCallback(
		async (e: React.MouseEvent) => {
			e.stopPropagation();
			if (!canCopy || !resolvedCopy) return;

			const ok = await copyToClipboard(resolvedCopy);
			if (ok) {
				showNotification(
					'Copied',
					`${label ? `${label} ` : ''}copied to clipboard`,
					'success',
				);
			} else {
				showNotification('Copy failed', 'Could not copy to clipboard', 'danger');
			}
		},
		[canCopy, label, resolvedCopy],
	);

	const stopRowNav = (e: React.MouseEvent | React.KeyboardEvent) => {
		e.stopPropagation();
	};

	if (!canCopy) {
		return <span>{display}</span>;
	}

	return (
		<span
			className='sn-copyable'
			style={{ display: 'inline-flex', alignItems: 'center', gap: 4, maxWidth: '100%' }}
			onClick={stopRowNav}
			onMouseDown={stopRowNav}
			onKeyDown={stopRowNav}>
			<span
				role='button'
				tabIndex={0}
				title={`Copy ${label || 'value'}`}
				onClick={handleCopy}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						handleCopy(e as unknown as React.MouseEvent);
					}
				}}
				style={{
					cursor: 'copy',
					userSelect: 'text',
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					whiteSpace: 'nowrap',
				}}>
				{display}
			</span>
			<button
				type='button'
				className='sn-copy-btn'
				title={`Copy ${label || 'value'}`}
				onClick={handleCopy}
				style={{
					border: 'none',
					background: 'transparent',
					padding: 2,
					lineHeight: 0,
					cursor: 'pointer',
					color: LMS.inkMuted,
					flexShrink: 0,
					opacity: 0.55,
					transition: 'opacity .12s ease, color .12s ease',
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.opacity = '1';
					e.currentTarget.style.color = LMS.moss;
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.opacity = '0.55';
					e.currentTarget.style.color = LMS.inkMuted;
				}}>
				<Icon icon='ContentCopy' size='sm' />
			</button>
		</span>
	);
};

export default CopyableText;
