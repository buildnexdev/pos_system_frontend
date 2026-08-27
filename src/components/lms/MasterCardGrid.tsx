// =============================================================================
// MasterCardGrid — the Branch card design, generalized for every master page.
// Renders a responsive grid where each record is the SAME card (moss code
// square + title + subtitle + optional badge + a row of stats + edit/delete),
// with the sn-tilt / glare / reveal motion. Drop this into any master page's
// list area and map its fields via the getters — so all masters look identical.
// =============================================================================
import React from 'react';
import Icon from '../icon/Icon';
import Checks from '../bootstrap/forms/Checks';
import { LMS } from './Charts';

export interface MasterStat {
	label: string;
	value: React.ReactNode;
}

export interface MasterBadge {
	label: string;
	tone?: 'moss' | 'neutral' | 'good' | 'warn' | 'bad' | 'info' | 'amber';
}

const BADGE_BG: Record<string, string> = {
	moss: '#DCE8E3',
	neutral: '#F4EFE7',
	good: '#DCEEDC',
	warn: '#FAEFC9',
	bad: '#F5DAD3',
	info: '#DDE9F1',
	amber: '#FBEBD7',
};
const BADGE_FG: Record<string, string> = {
	moss: LMS.moss,
	neutral: LMS.ink2,
	good: LMS.good,
	warn: LMS.warn,
	bad: LMS.bad,
	info: LMS.info,
	amber: LMS.amber,
};

export interface MasterCardGridProps {
	items: any[];
	isLoading?: boolean;
	getKey: (item: any, index: number) => React.Key;
	/** Short text for the moss square (initials / code). */
	getCode: (item: any) => string;
	getTitle: (item: any) => React.ReactNode;
	getSubtitle?: (item: any) => React.ReactNode;
	/** Pin icon shown before the subtitle (default true). */
	subtitleIcon?: string | null;
	getBadge?: (item: any) => MasterBadge | null;
	getStats?: (item: any) => MasterStat[];
	onEdit?: (item: any) => void;
	onDelete?: (item: any) => void;
	/** Publish / unpublish toggle (switch). */
	getPublishChecked?: (item: any) => boolean;
	onPublishChange?: (e: React.ChangeEvent<HTMLInputElement>, item: any) => void;
	/** Per-role action rights (default true = allowed). When false the matching
	 *  modify affordance is hidden; the card click (View) stays available so a
	 *  read-only role can still open and view the record. */
	canEdit?: boolean;
	canDelete?: boolean;
	editLabel?: string;
	emptyText?: string;
	/** Columns on wide screens: 2 | 3 | 4 (default 3). */
	cols?: 2 | 3 | 4;
	loadingNode?: React.ReactNode;
}

const DISPLAY = "'Fraunces', Georgia, serif";

const MasterCardGrid: React.FC<MasterCardGridProps> = ({
	items,
	isLoading = false,
	getKey,
	getCode,
	getTitle,
	getSubtitle,
	subtitleIcon = 'Place',
	getBadge,
	getStats,
	onEdit,
	onDelete,
	getPublishChecked,
	onPublishChange,
	canEdit = true,
	canDelete = true,
	editLabel = 'View',
	emptyText = 'No records found',
	cols = 3,
	loadingNode,
}) => {
	const colClass =
		cols === 4
			? 'col-12 col-sm-6 col-lg-4 col-xxl-3'
			: cols === 2
				? 'col-12 col-lg-6'
				: 'col-12 col-md-6 col-xxl-4';

	if (isLoading) {
		return (
			<div className='text-center py-5'>
				{loadingNode ?? <span className='spinner-border text-primary' />}
			</div>
		);
	}
	if (!items || items.length === 0) {
		return (
			<div className='text-center py-5' style={{ color: LMS.inkMuted }}>
				{emptyText}
			</div>
		);
	}

	return (
		<div className='row g-3'>
			{items.map((item, index) => {
				const badge = getBadge ? getBadge(item) : null;
				const stats = getStats ? getStats(item) : [];
				const subtitle = getSubtitle ? getSubtitle(item) : null;
				const clickable = !!onEdit;
				const itemKey = getKey(item, index);
				const isPublished = getPublishChecked ? getPublishChecked(item) : false;
				const showFooter = !!(
					onEdit ||
					(onDelete && canDelete) ||
					(onPublishChange && canEdit)
				);
				return (
					<div className={colClass} key={itemKey}>
						<div
							role={clickable ? 'button' : undefined}
							tabIndex={clickable ? 0 : undefined}
							onClick={clickable ? () => onEdit!(item) : undefined}
							onKeyDown={
								clickable
									? (e: React.KeyboardEvent) => {
											if (e.key === 'Enter') onEdit!(item);
										}
									: undefined
							}
							className='card sn-tilt sn-reveal h-100'
							style={{
								position: 'relative',
								background: '#fff',
								border: `1px solid ${LMS.line}`,
								borderRadius: 16,
								padding: 20,
								cursor: clickable ? 'pointer' : 'default',
								textAlign: 'left',
							}}>
							<span className='sn-glare' aria-hidden='true' />
							<div
								style={{
									display: 'flex',
									alignItems: 'flex-start',
									justifyContent: 'space-between',
									gap: 8,
									marginBottom: stats.length ? 16 : 0,
								}}>
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 12,
										minWidth: 0,
									}}>
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
										{getCode(item)}
									</span>
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
											}}>
											{getTitle(item)}
										</div>
										{subtitle && (
											<div
												style={{
													fontSize: 11,
													color: LMS.inkMuted,
													display: 'flex',
													alignItems: 'center',
													gap: 4,
													marginTop: 2,
												}}>
												{subtitleIcon && (
													<Icon icon={subtitleIcon} size='sm' />
												)}
												{subtitle}
											</div>
										)}
									</div>
								</div>
								{badge && (
									<span
										style={{
											display: 'inline-flex',
											alignItems: 'center',
											borderRadius: 999,
											fontSize: 10,
											fontWeight: 600,
											textTransform: 'uppercase',
											letterSpacing: '0.04em',
											padding: '2px 8px',
											whiteSpace: 'nowrap',
											flexShrink: 0,
											background: BADGE_BG[badge.tone || 'neutral'],
											color: BADGE_FG[badge.tone || 'neutral'],
										}}>
										{badge.label}
									</span>
								)}
							</div>

							{stats.length > 0 && (
								<div
									className='row g-2'
									style={{
										borderTop: `1px solid ${LMS.line}`,
										borderBottom: `1px solid ${LMS.line}`,
										padding: '12px 0',
										margin: 0,
									}}>
									{stats.map((s) => (
										<div
											className={`col-${Math.floor(12 / Math.min(stats.length, 4))}`}
											key={s.label}
											style={{ textAlign: 'center' }}>
											<div
												style={{
													fontFamily: DISPLAY,
													fontSize: 20,
													fontWeight: 600,
													color: LMS.ink,
												}}>
												{s.value ?? 0}
											</div>
											<div
												style={{
													fontSize: 10,
													textTransform: 'uppercase',
													letterSpacing: '0.06em',
													color: LMS.inkMuted,
													fontWeight: 700,
												}}>
												{s.label}
											</div>
										</div>
									))}
								</div>
							)}

							{showFooter && (
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										marginTop: 14,
										gap: 12,
									}}>
									{onEdit ? (
										<span
											style={{
												fontSize: 12,
												color: LMS.moss,
												fontWeight: 600,
											}}>
											{editLabel} →
										</span>
									) : (
										<span />
									)}
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: 12,
											marginLeft: 'auto',
										}}>
										{onPublishChange && canEdit && (
											<div
												className='d-flex align-items-center'
												role='presentation'
												onClick={(e) => e.stopPropagation()}
												onKeyDown={(e) => e.stopPropagation()}>
												<Checks
													id={`publish-${String(itemKey)}`}
													type='switch'
													className='mb-0'
													checked={isPublished}
													onChange={(
														e: React.ChangeEvent<HTMLInputElement>,
													) => onPublishChange(e, item)}
													label={
														<span
															style={{
																fontSize: 12,
																fontWeight: 600,
																color: isPublished
																	? LMS.good
																	: LMS.inkMuted,
															}}>
															{isPublished
																? 'Published'
																: 'Unpublished'}
														</span>
													}
												/>
											</div>
										)}
										{onDelete && canDelete && (
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
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default MasterCardGrid;
