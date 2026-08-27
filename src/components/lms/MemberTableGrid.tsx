// =============================================================================
// MemberTableGrid — the LMS member directory as a TABLE (the Claude Design
// "DataTable" view), replacing the card grid. Same data and every action the
// card exposed: click a row to edit/review, the colour-coded status pill opens
// the approve flow, and remove. Drop-in: identical props to MemberCardGrid, so
// the member list can swap one for the other with no other changes.
// =============================================================================
import React from 'react';
import Icon from '../icon/Icon';
import Spinner from '../bootstrap/Spinner';
import { LMS } from './Charts';
import { MaskedNumber } from '../../redux/_common/common.utils';
import { S3_API_URL } from '../../redux/const';
import CopyableText from './CopyableText';

const DISPLAY = "'Fraunces', Georgia, serif";

export interface MemberTableGridProps {
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
	onAppraisalClick?: (item: any) => void;
	onDelete?: (item: any) => void;
	emptyText?: string;
}

// Approval status -> pill colours (warm LMS palette).
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
			return { bg: '#F5DAD3', fg: LMS.bad };
	}
}

function appraisalColor(status: string): string {
	if (status === 'Approved') return LMS.good;
	if (status === 'Yet To Approve') return LMS.warn;
	if (status === 'Rejected') return LMS.bad;
	return LMS.info;
}

function isFirstAppraisalDone(item: any): boolean {
	const doneCount = Number(item.AppraisalApproveDoneCount ?? 0);
	if (Number.isFinite(doneCount) && doneCount >= 1) {
		return true;
	}

	const status = String(item.AppraisalStatus ?? '');
	if (
		status === 'First Appraisal Done' ||
		status === 'Second Appraisal Done' ||
		status === 'Third Appraisal Done' ||
		status === 'Fourth Appraisal Done' ||
		status === 'Fifth Appraisal Done' ||
		status === 'Approved'
	) {
		return true;
	}

	const details = item.AppraisalDetails;
	if (Array.isArray(details)) {
		const firstStage = details.find((row: any) => row.Stage === 'First');
		if (firstStage?.Status === 'Approved') {
			return true;
		}
	}

	return false;
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

const TH: React.CSSProperties = {
	textAlign: 'left',
	fontSize: 10.5,
	textTransform: 'uppercase',
	letterSpacing: '0.06em',
	color: LMS.inkMuted,
	fontWeight: 700,
	padding: '12px 16px',
	background: LMS.sand,
	borderBottom: `1px solid ${LMS.line}`,
	whiteSpace: 'nowrap',
	position: 'sticky',
	top: 0,
	zIndex: 1,
};

const TD: React.CSSProperties = {
	padding: '12px 16px',
	borderBottom: `1px solid ${LMS.line}`,
	verticalAlign: 'middle',
	color: LMS.ink,
	fontSize: 13,
};

const SUB: React.CSSProperties = {
	fontSize: 11,
	color: LMS.inkMuted,
	marginTop: 2,
};

const MemberTableGrid: React.FC<MemberTableGridProps> = ({
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
	onAppraisalClick,
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
		<div
			style={{
				border: `1px solid ${LMS.line}`,
				borderRadius: 16,
				background: '#fff',
				overflowX: 'auto',
			}}>
			<style>{`
				.sn-mtable { width: 100%; border-collapse: collapse; }
				.sn-mtable tbody tr { cursor: pointer; transition: background-color .12s ease; }
				.sn-mtable tbody tr:hover { background: ${LMS.sand}66; }
				.sn-mtable tbody tr:last-child td { border-bottom: none; }
			`}</style>
			<table className='sn-mtable'>
				<thead>
					<tr>
						<th style={TH}>Member</th>
						<th style={TH}>Branch</th>
						<th style={TH}>Center</th>
						{showGroup && <th style={TH}>Group</th>}
						{workflow && <th style={TH}>Appraisal</th>}
						<th style={TH}>Aadhar</th>
						<th style={TH}>Created</th>
						<th style={TH}>Status</th>
						<th style={{ ...TH, textAlign: 'right' }}>Actions</th>
					</tr>
				</thead>
				<tbody>
					{items.map((item: any) => {
						const tone = statusTone(item.MemberStatus);
						const editing =
							editLoadingId !== null &&
							editLoadingId !== undefined &&
							String(editLoadingId) === String(item.MemberID);
						const photo =
							item.MemberPhoto &&
							item.MemberPhoto !== '' &&
							item.MemberPhoto !== '-'
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
						const appraisalStatus = item.AppraisalStatus || 'Not Started';
						const canViewAppraisalDetails =
							Boolean(onAppraisalClick) && isFirstAppraisalDone(item);

						return (
							<tr
								key={item.MemberID}
								onClick={primary}
								onKeyDown={(e: React.KeyboardEvent) => {
									if (e.key === 'Enter') primary();
								}}
								tabIndex={0}>
								{/* Member: avatar + name + id·phone */}
								<td style={TD}>
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
													width: 38,
													height: 38,
													borderRadius: 10,
													objectFit: 'cover',
													flexShrink: 0,
													border: `1px solid ${LMS.line}`,
												}}
											/>
										) : (
											<span
												style={{
													width: 38,
													height: 38,
													borderRadius: 10,
													background: LMS.moss,
													color: '#fff',
													fontWeight: 700,
													fontSize: 12,
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
													fontSize: 15,
													fontWeight: 600,
													color: LMS.ink,
													lineHeight: 1.2,
													whiteSpace: 'nowrap',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													maxWidth: 220,
												}}
												title={item.MemberName || ''}>
												{item.MemberName ?? '-'}
											</div>
											<div
												style={{
													...SUB,
													display: 'flex',
													alignItems: 'center',
													flexWrap: 'wrap',
													gap: 4,
												}}>
												<CopyableText
													display={item.UniqueMemberID ?? '-'}
													copyValue={item.UniqueMemberID}
													label='Member ID'
												/>
												<span aria-hidden='true'>·</span>
												<CopyableText
													display={item.MemberPhone ?? '-'}
													copyValue={item.MemberPhone}
													label='Phone number'
												/>
											</div>
										</div>
									</div>
								</td>

								<td style={TD}>{branch}</td>
								<td style={TD}>{center}</td>
								{showGroup && <td style={TD}>{group}</td>}
								{workflow && (
									<td style={TD}>
										{canViewAppraisalDetails ? (
											<button
												type='button'
												title='View appraisal details'
												onClick={(e) => {
													e.stopPropagation();
													onAppraisalClick?.(item);
												}}
												style={{
													border: 'none',
													background: 'transparent',
													padding: 0,
													fontSize: 12,
													fontWeight: 600,
													color: appraisalColor(appraisalStatus),
													cursor: 'pointer',
													textDecoration: 'underline',
													textUnderlineOffset: 3,
												}}>
												{appraisalStatus}
											</button>
										) : (
											<span
												style={{
													fontSize: 12,
													fontWeight: 600,
													color: appraisalColor(appraisalStatus),
												}}>
												{appraisalStatus}
											</span>
										)}
									</td>
								)}
								<td style={TD}>
									<CopyableText
										display={aadhar}
										copyValue={item.MemberAadarNum}
										label='Aadhar number'
									/>
								</td>
								<td style={TD}>{item.MemberCreateDate ?? '-'}</td>

								{/* Status pill — opens approve flow when allowed */}
								<td style={TD}>
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
											cursor: canApprove ? 'pointer' : 'default',
											background: tone.bg,
											color: tone.fg,
										}}>
										{statusLabel}
									</button>
								</td>

								{/* Actions */}
								<td style={{ ...TD, textAlign: 'right', whiteSpace: 'nowrap' }}>
									<div
										style={{
											display: 'inline-flex',
											alignItems: 'center',
											gap: 14,
											justifyContent: 'flex-end',
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
											{isShowEdit ? 'Edit' : 'Review'} →
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
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export default MemberTableGrid;
