import React from 'react';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Button from '../bootstrap/Button';
import { LMS } from './Charts';

export type MemberAppraisalDetail = {
	Stage: string;
	Status: string;
	ApprovedBy: string;
	Notes: string;
	ApprovedOn: string;
};

export interface MemberAppraisalDetailsModalProps {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	memberName?: string;
	appraisalStatus?: string;
	details?: MemberAppraisalDetail[];
}

function statusColor(status: string): string {
	if (status === 'Approved') return LMS.good;
	if (status === 'Rejected') return LMS.bad;
	if (status === 'Hold') return LMS.warn;
	return LMS.inkMuted;
}

const MemberAppraisalDetailsModal: React.FC<MemberAppraisalDetailsModalProps> = ({
	isOpen,
	setIsOpen,
	memberName,
	appraisalStatus,
	details = [],
}) => {
	return (
		<Modal isOpen={isOpen} isCentered setIsOpen={setIsOpen}>
			<ModalHeader setIsOpen={setIsOpen}>
				<ModalTitle id='member-appraisal-details'>Appraisal Details</ModalTitle>
			</ModalHeader>
			<ModalBody>
				{memberName ? (
					<div style={{ marginBottom: 12, fontWeight: 600, color: LMS.ink }}>
						{memberName}
						{appraisalStatus ? (
							<span style={{ marginLeft: 8, fontSize: 13, color: LMS.inkMuted }}>
								({appraisalStatus})
							</span>
						) : null}
					</div>
				) : null}
				{details.length > 0 ? (
					<div style={{ overflowX: 'auto' }}>
						<table className='table table-modern mb-0'>
							<thead>
								<tr>
									<th>Stage</th>
									<th>Status</th>
									<th>Approved By</th>
									<th>Notes</th>
									<th>Date</th>
								</tr>
							</thead>
							<tbody>
								{details.map((row) => (
									<tr key={row.Stage}>
										<td>{row.Stage}</td>
										<td style={{ fontWeight: 600, color: statusColor(row.Status) }}>
											{row.Status}
										</td>
										<td>{row.ApprovedBy || '-'}</td>
										<td style={{ maxWidth: 220, whiteSpace: 'pre-wrap' }}>
											{row.Notes || '-'}
										</td>
										<td>{row.ApprovedOn || '-'}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className='text-center py-3' style={{ color: LMS.inkMuted }}>
						No appraisal details available.
					</div>
				)}
			</ModalBody>
			<ModalFooter>
				<Button color='primary' onClick={() => setIsOpen(false)}>
					Close
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default MemberAppraisalDetailsModal;
