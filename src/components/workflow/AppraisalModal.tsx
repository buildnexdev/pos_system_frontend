// Version : 0.0.2
// Author : AGALYA

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import OffCanvas, { OffCanvasBody, OffCanvasHeader, OffCanvasTitle } from '../bootstrap/OffCanvas';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../layout/SubHeader/SubHeader';
import Card, { CardBody, CardHeader, CardLabel, CardTitle, CardSubTitle } from '../bootstrap/Card';
import { HeaderLeft, HeaderRight } from '../../layout/Header/Header';
import FormGroup from '../bootstrap/forms/FormGroup';
import Select from '../bootstrap/forms/Select';
import Option from '../bootstrap/Option';
import Button from '../bootstrap/Button';

// INTERFACE
interface AppraisalModalProps {
	isOpen: boolean;
	onClose: () => void;
	item: any;
	index: number;
	roleOptions: any[];
	onRemoveAppraisal: (index: number) => void;
	onAddMoreAppraisals: (index: number) => void;
	onSubmit: (index: number) => void;
	onAppraisalChange: (field: string, value: string) => void;
}

const AppraisalModal: React.FC<AppraisalModalProps> = ({
	isOpen,
	onClose,
	item,
	index,
	roleOptions,
	onRemoveAppraisal,
	onAddMoreAppraisals,
	onSubmit,
	onAppraisalChange,
}) => {
	// HELPER TO RENDER EACH APPRAISAL DROPDOWN
	const renderAppraisalForm = (
		appraisalNumber: number,
		appraisalTitle: string,
		value: string | number,
	) => {
		const strValue = value ? String(value) : '';

		return (
			<Card>
				<CardHeader>
					<CardLabel>
						<CardTitle>Appraisal No</CardTitle>
						<CardSubTitle>{appraisalTitle}</CardSubTitle>
					</CardLabel>
				</CardHeader>
				<CardBody>
					<FormGroup id={`Appraisal${appraisalNumber}`} label='Role' isFloating>
						<Select
							ariaLabel='Select Role'
							placeholder='Select Role'
							value={strValue}
							onChange={(e: any) => {
								// MAP THE FIELD NAMES CORRECTLY
								const fieldMap: { [key: number]: string } = {
									1: 'FirstAppraisal',
									2: 'SecondAppraisal',
									3: 'ThirdAppraisal',
									4: 'FourthAppraisal',
									5: 'FifthAppraisal',
								};
								onAppraisalChange(fieldMap[appraisalNumber], e.target.value);
							}}>
							<Option value=''>Select Role</Option>
							{roleOptions && roleOptions.length > 0 ? (
								roleOptions.map((role: any, idx: number) => {
									return (
										<Option
											key={role.RoleID}
											value={String(role.RoleID)}
											data-index={idx}>
											{`${role.RoleName}-${role.LevelText}`}
										</Option>
									);
								})
							) : (
								<Option value='' disabled>
									No roles available
								</Option>
							)}
						</Select>
					</FormGroup>
				</CardBody>
			</Card>
		);
	};

	// RENDER TREE/LEVEL LAYOUT
	const renderAppraisalLevel = (level: number | string) => {
		// Convert to number and ensure we always show at least the first appraisal
		const numericLevel = typeof level === 'string' ? parseInt(level, 10) : level;
		const actualLevel = numericLevel <= 0 ? 1 : numericLevel;
		const fields = [
			{ number: 1, title: 'First', value: item.FirstAppraisal },
			{ number: 2, title: 'Second', value: item.SecondAppraisal },
			{ number: 3, title: 'Third', value: item.ThirdAppraisal },
			{ number: 4, title: 'Fourth', value: item.FourthAppraisal },
			{ number: 5, title: 'Fifth', value: item.FifthAppraisal },
		];

		// REUSE YOUR EXISTING LAYOUTS, JUST PLUG RENDERAPPRAISALFORM WITH CLEAN BINDING
		if (actualLevel === 1) {
			return (
				<div className='col-md-3'>
					{renderAppraisalForm(1, 'First', item.FirstAppraisal)}
				</div>
			);
		}
		if (actualLevel === 2) {
			return (
				<>
					{/* CONNECTOR LINES HERE */}
					<div className='row'>
						<div className='col-3' />
						<div className='col-3'>
							{renderAppraisalForm(1, 'First', item.FirstAppraisal)}
						</div>
						<div className='col-3'>
							{renderAppraisalForm(2, 'Second', item.SecondAppraisal)}
						</div>
						<div className='col-3' />
					</div>
				</>
			);
		}
		if (actualLevel === 3) {
			return (
				<div className='row'>
					<div className='col-4'>
						{renderAppraisalForm(1, 'First', item.FirstAppraisal)}
					</div>
					<div className='col-4'>
						{renderAppraisalForm(2, 'Second', item.SecondAppraisal)}
					</div>
					<div className='col-4'>
						{renderAppraisalForm(3, 'Third', item.ThirdAppraisal)}
					</div>
				</div>
			);
		}
		if (actualLevel === 4) {
			return (
				<div className='row'>
					<div className='col-3'>
						{renderAppraisalForm(1, 'First', item.FirstAppraisal)}
					</div>
					<div className='col-3'>
						{renderAppraisalForm(2, 'Second', item.SecondAppraisal)}
					</div>
					<div className='col-3'>
						{renderAppraisalForm(3, 'Third', item.ThirdAppraisal)}
					</div>
					<div className='col-3'>
						{renderAppraisalForm(4, 'Fourth', item.FourthAppraisal)}
					</div>
				</div>
			);
		}
		if (actualLevel === 5) {
			return (
				<>
					<div className='row'>
						<div className='col-3'>
							{renderAppraisalForm(1, 'First', item.FirstAppraisal)}
						</div>
						<div className='col-3'>
							{renderAppraisalForm(2, 'Second', item.SecondAppraisal)}
						</div>
						<div className='col-3'>
							{renderAppraisalForm(3, 'Third', item.ThirdAppraisal)}
						</div>
						<div className='col-3'>
							{renderAppraisalForm(4, 'Fourth', item.FourthAppraisal)}
						</div>
					</div>
					<div className='row mt-3'>
						<div className='col-3'>
							{renderAppraisalForm(5, 'Fifth', item.FifthAppraisal)}
						</div>
					</div>
				</>
			);
		}
		return null;
	};

	// const [currentAppraisalIndex, setCurrentAppraisalIndex] = useState<number | null>(null);

	// VIEW APPRAISAL
	// function ViewAppraisal(index: number) {
	// 	const appraisal = formik.values.creditAppraisalArr[index];
	// 	const { AppraisalType, SelectPage, Questionairre, Weightage, BranchID } = appraisal;

	// 	// Set the current appraisal index to track which card was clicked
	// 	setCurrentAppraisalIndex(index);

	// 	if (!AppraisalType) {
	// 		return showNotification('Oopss!', 'Please Select Appraisal Type', 'danger');
	// 	}
	// 	if (AppraisalType === 'Page' && !SelectPage) {
	// 		return showNotification('Oopss!', 'Please Select Page', 'danger');
	// 	}
	// 	if (AppraisalType === 'Question' && !Questionairre) {
	// 		return showNotification('Oopss!', 'Please Select Questionairre', 'danger');
	// 	}
	// 	if (AppraisalType === 'Question' && !Weightage) {
	// 		return showNotification('Oopss!', 'Please Select Weightage', 'danger');
	// 	}
	// 	if (!BranchID) {
	// 		return showNotification('Oopss!', 'Please Select Branch', 'danger');
	// 	}

	// 	openEdit();
	// }

	// OPEN EDIT FUNCION
	// const openEdit = () => {
	// 	dispatch(isEditDetailsStart(!isEdit));
	// };

	// GET THE CURRENT APPRAISAL ITEM BASED ON THE VIEW INDEX
	// function getCurrentAppraisalItem() {
	// 	if (
	// 		currentAppraisalIndex !== null &&
	// 		formik.values.creditAppraisalArr[currentAppraisalIndex]
	// 	) {
	// 		return formik.values.creditAppraisalArr[currentAppraisalIndex];
	// 	}
	// 	return null;
	// }
	// this model user means your Ui use this code
	{
		/* <AppraisalModal
			isOpen={isEdit}
			onClose={openEdit}
			item={getCurrentAppraisalItem() || items}
			index={
				currentAppraisalIndex !== null
					? currentAppraisalIndex
					: index
			}
			roleOptions={AllRoleListArr || []}
			onRemoveAppraisal={removeappraisals}
			onAddMoreAppraisals={addMoreappraisals}
			onSubmit={onsubmit}
			onAppraisalChange={(field, value) => {
				const updatedArray = [
					...formik.values.creditAppraisalArr,
				];
				const targetIndex =
					currentAppraisalIndex !== null
						? currentAppraisalIndex
						: index;
				(updatedArray[targetIndex] as any)[field] = value;
				formik.setFieldValue(
					'creditAppraisalArr',
					updatedArray,
				);
			}}
		/> */
	}

	//this  is view button when  you click means that model showing
	{
		/* <Button
			title='View'
			color='primary'
			className='w-35 p-2'
			onClick={() => {
				ViewAppraisal(
					index,
				);
			}}>
			View Appraisal
		</Button> */
	}

	return (
		<OffCanvas isOpen={isOpen} tag='form' noValidate>
			<OffCanvasHeader setOpen={onClose}>
				<OffCanvasTitle id='edit-panel' style={{ width: '-webkit-fill-available' }}>
					<SubHeader className='mt-3'>
						<SubHeaderLeft>
							<CardLabel icon='list' iconColor='primary'>
								<CardTitle>Work Flow Management</CardTitle>
							</CardLabel>
						</SubHeaderLeft>
						<SubHeaderRight>
							<Button
								color='danger'
								isDisable={parseInt(item.IsShowAppraisal, 10) <= 1}
								onClick={() => onRemoveAppraisal(index)}>
								- Remove Appraisal
							</Button>
						</SubHeaderRight>
						<SubHeaderRight>
							<Button
								color='primary'
								className='w-35 p-2'
								isDisable={parseInt(item.IsShowAppraisal, 10) == 5}
								onClick={() => onAddMoreAppraisals(index)}>
								+ Add Appraisals
							</Button>
						</SubHeaderRight>
						<SubHeaderRight>
							<Button
								color='primary'
								className='w-35 p-2'
								onClick={() => onSubmit(index)}>
								+ Save Appraisals
							</Button>
						</SubHeaderRight>
					</SubHeader>
				</OffCanvasTitle>
			</OffCanvasHeader>

			<OffCanvasBody>
				<div className='row h-100 pb-3'>
					<div className='col-lg-12 col-md-12'>
						{/* APPRAISAL DETAILS */}
						<div className='row justify-content-center'>
							<Card className='col-md-4'>
								<CardHeader>
									<HeaderLeft>
										<CardLabel>
											<CardTitle>{item.AppraisalType}</CardTitle>
											<CardSubTitle>Appraisal Type</CardSubTitle>
										</CardLabel>
									</HeaderLeft>
									<HeaderRight>
										<CardLabel>
											<CardTitle>
												{item.AppraisalType === 'Question'
													? item.QuestionListName
													: item.SelectPage}
											</CardTitle>
											<CardSubTitle>
												{item.AppraisalType === 'Question'
													? 'Questionnaire'
													: 'Page'}
											</CardSubTitle>
										</CardLabel>
									</HeaderRight>
								</CardHeader>
								<CardBody>
									<CardHeader>
										<HeaderLeft>
											<CardTitle>{item.BranchListCombined}</CardTitle>
											<CardSubTitle>Branch</CardSubTitle>
										</HeaderLeft>
										{item.AppraisalType === 'Question' && (
											<HeaderRight>
												<CardTitle>{item.Weightage}</CardTitle>
												<CardSubTitle>Weightage</CardSubTitle>
											</HeaderRight>
										)}
									</CardHeader>
								</CardBody>
							</Card>
						</div>

						{/* TREE CONNECTOR */}
						<div className='row justify-content-center'>
							<div className='col-md-3 d-flex justify-content-center'>
								<div className='vertical-line' />
							</div>
						</div>

						{/* RENDER APPRAISAL LEVELS */}
						<div className='row d-flex justify-content-center'>
							{item ? renderAppraisalLevel(item.IsShowAppraisal) : null}
						</div>
					</div>
				</div>
			</OffCanvasBody>
		</OffCanvas>
	);
};

export default AppraisalModal;
