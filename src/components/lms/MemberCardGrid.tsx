// =============================================================================
// MemberCardGrid — the LMS member directory, rebuilt as a grid of rich cards.
// A member is more than a master row: it carries a photo, an approval state
// that drives a workflow, optional appraisal status, and location lineage
// (branch / center / group). This renders all of that as one scannable card
// with the sn-tilt / glare / reveal motion, while keeping every action the old
// table exposed: click-to-edit, the colour-coded status pill that opens the
// approve flow, and remove.
// =============================================================================
import React from 'react';
import Icon from '../icon/Icon';
import Spinner from '../bootstrap/Spinner';
import { LMS } from './Charts';
import { MaskedNumber } from '../../redux/_common/common.utils';
import { S3_API_URL } from '../../redux/const';
import CopyableText from './CopyableText';

const DISPLAY = "'Fraunces', Georgia, serif";

export interface MemberCardGridProps {
	items: any[];
	isWorkFlowManagementNeeded?: string | number;
	isNbfcLogin?: string | number;
	isAadharMaskingNeeded?: boolean;
	isShowEdit?: boolean;
	isShowDelete?: boolean;
	/** Per-role approve right (default true). When false the status pill stays
	 *  visible but is non-interactive (read-only roles can see, not change). */
	canApprove?: boolean;
	/** MemberID currently loading its edit drawer (shows an inline spinner). */
	editLoadingId?: string | number | null;
	onEdit: (item: any) => void;
	onApprove: (item: any) => void;
	onDelete?: (item: any) => void;
	emptyText?: string;
}

// Approval status -> pill colours. Mirrors the old badge colour logic but in
// the warm LMS palette instead of Bootstrap contextual colours.
function statusTone(status: string): { bg: string; fg: string } {
	switch (status) {
		case 'Approved':
			return { bg: '#DCEEDC', fg: LMS.good };
		case 'Yet To Approve':
			return { bg: '#FAEFC9', fg: LMS.warn };
		case 'Recheck':
		case 'Register':
			return { bg: '#DDE9F1', fg: LMS.info };
		case 'Disbursed':
			return { bg: '#DCE8E3', fg: LMS.moss };
		default:
			// Rejected / Credit Check Rejected / InActive / unknown
			return { bg: '#F5DAD3', fg: LMS.bad };
	}
}

function appraisalColor(status: string): string {
	if (status === 'Approved') return LMS.good;
	if (status === 'Yet To Approve') return LMS.warn;
	if (status === 'Rejected') return LMS.bad;
	return LMS.info;
}

function initials(name: string): string {
	return (
		(name || '')
			.replace(/[^A-Za-z ]/g, '')
			.split(' ')
			.filter(Boolean)
			.map((w) => w[0])
			.slice(0, 2)
			.join('')
			.toUpperCase() || 'M'
	);
}

const Field: React.FC<{
	label: string;
	value: React.ReactNode;
	copyValue?: string;
}> = ({ label, value, copyValue }) => (
	<div style={{ minWidth: 0 }}>
		<div
			style={{
				fontSize: 10,
				textTransform: 'uppercase',
				letterSpacing: '0.06em',
				color: LMS.inkMuted,
				fontWeight: 700,
			}}>
			{label}
		</div>
		<div
			style={{
				fontSize: 13,
				color: LMS.ink,
				fontWeight: 600,
				whiteSpace: 'nowrap',
				overflow: 'hidden',
				textOverflow: 'ellipsis',
			}}
			title={typeof value === 'string' ? value : undefined}>
			{copyValue !== undefined ? (
				<CopyableText display={value} copyValue={copyValue} label={label} />
			) : (
				value
			)}
		</div>
	</div>
);

const MemberCardGrid: React.FC<MemberCardGridProps> = ({
	items,
	isWorkFlowManagementNeeded,
	isNbfcLogin,
	isAadharMaskingNeeded,
	isShowEdit = false,
	isShowDelete = false,
	canApprove = true,
	editLoadingId,
	onEdit,
	onApprove,
	onDelete,
	emptyText = 'Member Not Found',
}) => {
	if (!items || items.length === 0) {
		return (
			<div className='text-center py-5' style={{ color: LMS.inkMuted }}>
				{emptyText}
			</div>
		);
	}

	const workflow = String(isWorkFlowManagementNeeded) === '1';
	const showGroup = String(isNbfcLogin) === '0';

	return (
		<div className='row g-3'>
			{items.map((item: any) => {
				const tone = statusTone(item.MemberStatus);
				const editing =
					editLoadingId !== null &&
					editLoadingId !== undefined &&
					String(editLoadingId) === String(item.MemberID);
				const photo =
					item.MemberPhoto && item.MemberPhoto !== '' && item.MemberPhoto !== '-'
						? `${S3_API_URL}${item.MemberPhoto}`
						: null;
				const primary = () => (isShowEdit ? onEdit(item) : onApprove(item));
				const branch =
					item.UniqueAreaID && item.AreaName
						? `${item.UniqueAreaID} - ${item.AreaName}`
						: '-';
				const center =
					item.MemberBranchUID && item.MemberBranch
						? `${item.MemberBranchUID} - ${item.MemberBranch}`
						: '-';
				const group =
					item.MemberGroupUID && item.MemberGroup
						? `${item.MemberGroupUID} - ${item.MemberGroup}`
						: '-';
				const aadhar =
					MaskedNumber(item.MemberAadarNum, isAadharMaskingNeeded) ?? '-';
				const statusLabel =
					item.MemberStatus === 'Yet To Approve'
						? 'YTA'
						: item.MemberStatus || '-';

				return (
					<div className='col-12 col-md-6 col-xxl-4' key={item.MemberID}>
						<div
							role='button'
							tabIndex={0}
							onClick={primary}
							onKeyDown={(e: React.KeyboardEvent) => {
								if (e.key === 'Enter') primary();
							}}
							className='card sn-tilt sn-reveal h-100'
							style={{
								position: 'relative',
								background: '#fff',
								border: `1px solid ${LMS.line}`,
								borderRadius: 16,
								padding: 20,
								cursor: 'pointer',
								textAlign: 'left',
							}}>
							<span className='sn-glare' aria-hidden='true' />

							{/* Header: avatar + name + id, status pill on the right */}
							<div
								style={{
									display: 'flex',
									alignItems: 'flex-start',
									justifyContent: 'space-between',
									gap: 8,
								}}>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 12,
										minWidth: 0,
									}}>
									{photo ? (
										<img
											src={photo}
											alt={item.MemberName || 'member'}
											style={{
												width: 44,
												height: 44,
												borderRadius: 12,
												objectFit: 'cover',
												flexShrink: 0,
												border: `1px solid ${LMS.line}`,
											}}
										/>
									) : (
										<span
											style={{
												width: 44,
												height: 44,
												borderRadius: 12,
												background: LMS.moss,
												color: '#fff',
												fontWeight: 700,
												fontSize: 13,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												flexShrink: 0,
											}}>
											{initials(item.MemberName)}
										</span>
									)}
									<div style={{ minWidth: 0 }}>
										<div
											style={{
												fontFamily: DISPLAY,
												fontSize: 17,
												fontWeight: 600,
												color: LMS.ink,
												lineHeight: 1.15,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}
											title={item.MemberName || ''}>
											{item.MemberName ?? '-'}
										</div>
										<div
											style={{
												fontSize: 11,
												color: LMS.inkMuted,
												display: 'flex',
												alignItems: 'center',
												gap: 4,
												marginTop: 2,
											}}>
											<Icon icon='Badge' size='sm' />
											<CopyableText
												display={item.UniqueMemberID ?? '-'}
												copyValue={item.UniqueMemberID}
												label='Member ID'
											/>
										</div>
										{workflow ? (
											<div
												style={{
													fontSize: 11,
													fontWeight: 600,
													color: appraisalColor(item.AppraisalStatus || 'Not Started'),
													marginTop: 3,
												}}>
												{item.AppraisalStatus || 'Not Started'}
											</div>
										) : null}
									</div>
								</div>

								<button
									type='button'
									disabled={!canApprove}
									onClick={(e) => {
										e.stopPropagation();
										if (canApprove) onApprove(item);
									}}
									title={
										canApprove
											? 'Review / change approval status'
											: 'View only — no approval rights'
									}
									style={{
										border: 'none',
										display: 'inline-flex',
										alignItems: 'center',
										borderRadius: 999,
										fontSize: 10,
										fontWeight: 700,
										textTransform: 'uppercase',
										letterSpacing: '0.04em',
										padding: '4px 10px',
										whiteSpace: 'nowrap',
										flexShrink: 0,
										cursor: canApprove ? 'pointer' : 'default',
										background: tone.bg,
										color: tone.fg,
									}}>
									{statusLabel}
								</button>
							</div>

							{/* Info grid */}
							<div
								style={{
									display: 'grid',
									gridTemplateColumns: '1fr 1fr',
									gap: '10px 16px',
									borderTop: `1px solid ${LMS.line}`,
									borderBottom: `1px solid ${LMS.line}`,
									padding: '14px 0',
									margin: '16px 0 0',
								}}>
								<Field label='Branch' value={branch} />
								<Field label='Center' value={center} />
								{showGroup && <Field label='Group' value={group} />}
								<Field
									label='Phone'
									value={item.MemberPhone ?? '-'}
									copyValue={item.MemberPhone}
								/>
								<Field
									label='Aadhar'
									value={aadhar}
									copyValue={item.MemberAadarNum}
								/>
								<Field label='Created' value={item.MemberCreateDate ?? '-'} />
							</div>

							{/* Footer actions */}
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									marginTop: 14,
								}}>
								<span
									style={{
										fontSize: 12,
										color: LMS.moss,
										fontWeight: 600,
										display: 'inline-flex',
										alignItems: 'center',
										gap: 6,
									}}>
									{editing && <Spinner isSmall inButton />}
									{isShowEdit ? 'Edit member' : 'Review member'} →
								</span>
								{isShowDelete && onDelete && (
									<button
										type='button'
										onClick={(e) => {
											e.stopPropagation();
											onDelete(item);
										}}
										style={{
											border: 'none',
											background: 'transparent',
											color: LMS.bad,
											cursor: 'pointer',
											display: 'inline-flex',
											alignItems: 'center',
											gap: 4,
											fontSize: 12,
											fontWeight: 600,
										}}>
										<Icon icon='Delete' size='sm' /> Remove
									</button>
								)}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default MemberCardGrid;
