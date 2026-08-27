// =============================================================================
// MemberOnboard — one-shot Member onboarding, ported from the Claude Design
// prototype (squarenow-lms/project/pages-member-onboard.jsx) into the real React
// app, in the LMS visual style (inline styles + LMS palette, no Tailwind).
//
// A full-screen overlay that replaces the 17-click sidebar wizard with a single
// continuous-scroll pass: a left stage rail, overall progress, per-stage autosave
// indicator, a "Mandatory only" toggle, optional stages that collapse behind an
// "Expand" button, and a sticky submit bar gated on mandatory completion.
//
// The flow is wired to the REAL redux saga API:
//   • Verify stage creates the member (addMemberDetailsStart → MemberID) and
//     verifies the OTP (verifyMemberNumberOtpStart). The captured MemberID threads
//     into every later stage save.
//   • Loan-type selection pulls the company's mandatory-field config
//     (getMemberMandatoryStart), which is merged with the design's static `req`
//     flags so gating reflects the real config.
//   • Each stage's "Save & continue" dispatches its real section action with the
//     mapped payload keys (basic/personal/residential/current/nominee/bank/
//     official/family/house/extra/other/business/coapplicant/docs).
//   • Dropdowns (centers, products, product types, economic-activity types,
//     economic activities) load on open from their master selectors.
//   • File uploads use a real hidden <input type="file"> read as a base64 data URL.
// =============================================================================

import React, { useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import Icon from '../icon/Icon';
import { LMS } from './Charts';
import Select from '../bootstrap/forms/Select';
import Option from '../bootstrap/Option';

// ---- login context ----------------------------------------------------------
import { getLoginObjDetails } from '../../redux/login/login.selector';

// ---- member identity / verify (the linchpin) --------------------------------
import {
	addMemberDetailsStart,
	addMemberDetailsResponseResetStart,
	addMemberOtherDetailsStart,
	addMemberBusinessDetailsStart,
} from '../../redux/master/member/member.action';
import { selectAddMemberResp, selectAddMemberArr } from '../../redux/master/member/member.selector';
import {
	verifyMemberNumberOtpStart,
	verifyMemberNumberOtpResponseResetStart,
} from '../../redux/master/member-add/verify-otp/verify-otp.action';
import { selectVerifyMemberOtpRespone } from '../../redux/master/member-add/verify-otp/verify-otp.selector';

// ---- mandatory config -------------------------------------------------------
import { getMemberMandatoryStart } from '../../redux/master/member-add/add-member/add-member.action';
import { selectMandResponseArr } from '../../redux/master/member-add/add-member/add-member.selector';

// ---- dropdown data (load on open) -------------------------------------------
import { getCenterListStart } from '../../redux/master/center/center.action';
import { selectCenterListData } from '../../redux/master/center/center.selector';
import { getProductListStart } from '../../redux/master/product/product.action';
import { getProductTypeListStart } from '../../redux/master/product-type/product-type.action';
import { selectProductTypeListData } from '../../redux/master/product-type/product-type.selector';
import { fetchAllEconomicActivityTypeStart } from '../../redux/master/economic-activity-type/economic-activity-type.action';
import { selectFetchAllEconomicActivityTypeData } from '../../redux/master/economic-activity-type/economic-activity-type.selector';
import {
	economicActivityListStart,
	officialDetailsAddStart,
} from '../../redux/master/member-add/official-details/official-details.action';
import { selectEconomicActivityList } from '../../redux/master/member-add/official-details/official-details.selector';
import { mapMemberToOnboardData } from './mapMemberToOnboardData';
import { resolveMemberLoanTypeFromSources } from '../../redux/master/member/member.utils';
import { getImageUrl } from '../../redux/operations/loan-proposal/auto-loan-proposal/auto-loan-proposal.utils';
import { getImageUploadDateFromPath } from '../../redux/general/general.utils';
import { imageUploadToS3 } from '../../redux/_common/common.utils';
import {
	accountNumberChars,
	ageFromDOB,
	blockInvalidNumericPaste,
	blockNegativeNumberKeyDown,
	blockNonDigitKeyDown,
	blockNonIdProofKeyDown,
	digitsOnly,
	idProofChars,
	isValidAccountNumber,
	isValidIFSC,
	isValidName,
	isValidPAN,
	isValidPincode,
	isExactDigits,
	validateDOBAge,
	MEMBER_NAME_ERROR,
	blockNonNameKeyDown,
	mergeAccountNumberPaste,
	mergeIdProofPaste,
	mergeNamePaste,
	mergePhonePaste,
	mergePincodePaste,
	monthlyFromAnnual,
	nameChars,
	numericChars,
	getDOBInputBoundsForRole,
} from '../../utils/memberValidators';

/** Resolve S3 folder path for member uploads (aligned with add-member components). */
function resolveMemberUploadPath(
	generalCompanyID: string | number,
	memberId: string | number,
	fieldKey: string,
	personal?: Record<string, any>,
): string {
	const base = `uploadsA/Company/Company-${generalCompanyID}/Member-${memberId}`;
	switch (fieldKey) {
		case 'photo':
			return `${base}/Nominee`;
		case 'sign':
			return `${base}/Nominee/Aadhar`;
		case 'passbook':
			return `${base}/PassbookCheque`;
		case 'panFront':
		case 'panBack':
			return `${base}/PanCard`;
		case 'aadFront':
		case 'aadBack':
			return `${base}/Aadhar`;
		case 'idFront':
		case 'idBack': {
			const idProof = personal?.idProof || 'IDProof';
			return `${base}/${idProof}`;
		}
		case 'addrFront':
		case 'addrBack': {
			const addrProof = personal?.addrProof || 'AddressProof';
			return `${base}/${addrProof}`;
		}
		case 'nomPhoto':
			return `${base}/Nominee`;
		case 'nomAadFront':
		case 'nomAadBack':
			return `${base}/Nominee/Aadhar`;
		case 'nomIdFront':
		case 'nomIdBack':
			return `${base}/Nominee/IdProof`;
		case 'msmeDoc':
		case 'gstDoc':
		case 'fin1':
		case 'fin2':
		case 'fin3':
		case 'inc1':
		case 'inc2':
		case 'inc3':
		case 'itr1':
		case 'itr2':
		case 'itr3':
			return `${base}/OtherDetails`;
		case 'noc1':
		case 'noc2':
		case 'noc3':
			return `${base}/NOC`;
		case 'h1':
		case 'h2':
		case 'h3':
		case 'h4':
		case 'h5':
			return `${base}/HouseImages`;
		case 'coPhoto':
		case 'coTogether':
			return `${base}/CoApplicantDetails`;
		case 'coAadFront':
		case 'coAadBack':
			return `${base}/CoApplicantDetails/Aadhar`;
		case 'coIdFront':
		case 'coIdBack':
			return `${base}/CoApplicantDetails/IdProof`;
		case 'coAddrFront':
		case 'coAddrBack':
			return `${base}/CoApplicantDetails/AddressProof`;
		default:
			return `${base}/${fieldKey}`;
	}
}

/** Resolve stored path or fresh base64 upload to a displayable image URL. */
function resolveUploadPreviewSrc(value?: string): string {
	if (!value) return '';
	if (/^data:/i.test(value) || /^https?:\/\//i.test(value)) return value;
	return getImageUrl(value);
}

// ---- per-stage section saves ------------------------------------------------
import { basicDetailsAddStart } from '../../redux/master/member-add/basic-details/basic-details.action';
import { addMemberPhotoStart } from '../../redux/master/member-add/photo-verification/photo-verification.action';
import { uploadSignatureStart } from '../../redux/master/member-add/signature/signature.action';
import { personalDetailsStart } from '../../redux/master/member-add/personal-details/personal-details.action';
import { residentialDetailsAddStart } from '../../redux/master/member-add/residential-details/residential-details.action';
import { currentAddressAddStart } from '../../redux/master/member-add/current-address/current-address.action';
import { nomineeDetailsAddStart } from '../../redux/master/member-add/basic-nominee-details/basic-nominee-details.action';
import {
	bankCreateStart,
	bankIFSCcodeReset,
	bankIFSCcodeStart,
} from '../../redux/master/member-add/bank-details/bank-details.action';
import { selectBankIFSCcode } from '../../redux/master/member-add/bank-details/bank-details.selector';
import {
	familyIncomeStart,
	familyMemberAddStart,
} from '../../redux/master/member-add/family-details/family-details.action';
import { houseCreateStart } from '../../redux/master/member-add/house-details/house-details.action';
import { extraInformationAddStart } from '../../redux/master/member-add/extra-infromation/extra-information.action';
import { addCoBorrowerStart } from '../../redux/master/member-add/co-applicant/co-applicant.action';
import { updateAadharStart } from '../../redux/master/member-add/aadhar-details/aadhar-details.action';
import { updateRationCardStart } from '../../redux/master/member-add/ration-card-details/ration-card-details.action';
import { updateVoterIdStart } from '../../redux/master/member-add/voter-id-details/voter-id-details.action';
import { updateDrivingLicenceStart } from '../../redux/master/member-add/driving-licence-details/driving-licence-details.action';
import { updatePassportStart } from '../../redux/master/member-add/passport-details/passport-details.action';
import { updatePancardStart } from '../../redux/master/member-add/pancard-details/pancard-details.action';
import { updatePassbookChequeStart } from '../../redux/master/member-add/passbook-cheque-details/passbook-cheque-details.action';
import { updateAddressExtraProofStart } from '../../redux/master/member-add/address-extra-proof/address-extra-proof.action';
import { updateHousePhotosStart } from '../../redux/master/member-add/house-photos/house-photos.action';
import { updateNocPhotosStart } from '../../redux/master/member-add/noc-photos/noc-photos.action';

const DISPLAY = "'Fraunces', Georgia, serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

const MO_NOW_DATE = new Date().toISOString().slice(0, 10);
const moNowTime = () =>
	new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const ID_PROOFS = ['Aadhaar', 'Voter ID', 'Driving License', 'Passport', 'PAN', 'Ration Card'];
const NOMINEE_ID_PROOFS = ['RationCard', 'VoterID', 'DrivingLicense', 'Passport'];
const MEMBER_ID_PROOF_TYPES = ['RationCard', 'VoterID', 'DrivingLicense', 'Passport'];
const MEMBER_ADDRESS_PROOF_TYPES = [
	'RationCard',
	'VoterID',
	'DrivingLicense',
	'Passport',
	'Electricity',
	'Gas',
	'Telephone',
	'Water',
];
const FAMILY_RELATIONS = [
	'Father',
	'Mother',
	'Spouse',
	'Son',
	'Daughter',
	'Father-in-law',
	'Mother-in-law',
	'Uncle',
	'Son-in-law',
	'Daughter-in-law',
	'Brother',
	'Sister',
	'Brother-in-law',
	'Sister-in-law',
	'Grandfather',
	'Grandmother',
	'Other',
	'Self',
];
const FAMILY_GENDERS = ['Male', 'Female', 'Others'];
const ASSET_TYPE_OPTIONS = [
	'Land',
	'Own Land',
	'Lease Land',
	'Cow',
	'Goat/hen/prawn',
	'Vehicle',
	'Equipment',
	'Machinery',
];
const RELATIONS = [
	'Spouse',
	'Son',
	'Daughter',
	'Father',
	'Mother',
	'Brother',
	'Sister',
	'Father-in-law',
	'Mother-in-law',
	'Other',
];
const GENDERS = ['Female', 'Male', 'Other'];

// ---- types ------------------------------------------------------------------
interface MOFieldDef {
	k?: string;
	label?: string;
	type?: string;
	req?: boolean;
	opts?: string[];
	optsRef?: string;
	placeholder?: string;
	col?: number;
	def?: string;
	age?: string;
	hideOn?: string;
	showOn?: string;
	verify?: boolean;
		inputFilter?:
		| 'account'
		| 'ifsc'
		| 'phone'
		| 'aadhaar'
		| 'pan'
		| 'pincode'
		| 'idProof'
		| 'numeric'
		| 'name';
	readOnly?: boolean;
	minAge?: number;
	/** Maps DOB to mandatory-access age limits (member/spouse/nominee/coapplicant). */
	ageRole?: 'member' | 'spouse' | 'nominee' | 'coapplicant';
	sub?: string;
	toggle?: { k: string; label: string };
	// real-config key (member-mandatory response field name) this field maps to
	mand?: string;
	/** Whole-number fields (age, counts) — no decimals. */
	numInteger?: boolean;
}

const isIntegerNumField = (f: MOFieldDef): boolean => {
	if (f.numInteger === true) return true;
	if (f.numInteger === false) return false;
	const id = `${f.k ?? ''} ${f.label ?? ''}`;
	return /\bAge\b|Years in Operation|Duration of Stay|No\. of Rooms/i.test(id);
};

interface MOStage {
	id: string;
	name: string;
	icon: string;
	kind: 'verify' | 'loantype' | 'fields' | 'family' | 'house' | 'docs';
	blurb?: string;
	optional?: boolean;
	/** When true, every field in this stage is shown even in "Mandatory only" mode. */
	showAllFields?: boolean;
	fields?: MOFieldDef[];
	docs?: { k: string; label: string; detail?: string }[];
}

// =============================================================================
// STAGE CONFIG — 17 stages, per-field `req` flags. `mand` maps a field to the
// company mandatory-config response key (where one exists) so the real config
// merges with the static design flags.
// =============================================================================
const MO_STAGES: MOStage[] = [
	{
		id: 'verify',
		name: 'Verification',
		icon: 'VerifiedUser',
		kind: 'verify',
		blurb: 'Verify the member’s mobile with an OTP before anything else.',
	},
	{
		id: 'loan',
		name: 'Loan Type',
		icon: 'Layers',
		kind: 'loantype',
		blurb: 'What product is this application for?',
	},
	{
		id: 'basic',
		name: 'Basic Details',
		icon: 'Person',
		kind: 'fields',
		fields: [
			{ k: 'name', label: 'Member Name', type: 'text', req: true, inputFilter: 'name' },
			{ k: 'gender', label: 'Gender', type: 'select', req: true, opts: GENDERS },
			{
				k: 'aadhaar',
				label: 'Aadhaar Number',
				type: 'text',
				req: true,
				inputFilter: 'aadhaar',
				placeholder: '12-digit Aadhaar',
			},
			{
				k: 'pan',
				label: 'PAN Card',
				type: 'text',
				req: true,
				inputFilter: 'pan',
				placeholder: 'ABCDE1234F',
			},
			{ k: 'photo', label: 'Member Photo', type: 'upload', col: 1, mand: 'Photo' },
			{ k: 'sign', label: 'Signature', type: 'upload', col: 1, mand: 'Signature' },
		],
	},
	{
		id: 'personal',
		name: 'Personal Details',
		icon: 'Person',
		kind: 'fields',
		fields: [
			{ k: 'dob', label: 'Member DOB', type: 'date', req: true, age: 'age', ageRole: 'member', mand: 'DOB' },
			{ k: 'age', label: 'Member Age', type: 'num', req: true, numInteger: true, readOnly: true, mand: 'Age' },
			{
				k: 'marital',
				label: 'Marital Status',
				type: 'select',
				opts: ['Married', 'Unmarried', 'Widowed', 'Divorced'],
				mand: 'MarritialStatus',
			},
			{ k: 'father', label: 'Father Name', type: 'text', inputFilter: 'name', mand: 'FatherName' },
			{ k: 'mother', label: 'Mother Name', type: 'text', inputFilter: 'name', mand: 'MotherName' },
			{ k: 'spouse', label: 'Spouse Name', type: 'text', inputFilter: 'name', mand: 'SpouseName' },
			{ k: 'spouseDob', label: 'Spouse DOB', type: 'date', ageRole: 'spouse', mand: 'SpouseDOB' },
			{ k: 'altPhone', label: 'Alternate Phone Number', type: 'tel', inputFilter: 'phone', mand: 'AltPhone' },
			{ k: 'idProof', label: 'ID Proof', type: 'select', opts: MEMBER_ID_PROOF_TYPES, mand: 'IDProof1' },
			{ k: 'idProofNo', label: 'ID Proof Number', type: 'text', inputFilter: 'idProof', mand: 'IDProof1' },
			{ k: 'addrProof', label: 'Address Proof', type: 'select', opts: MEMBER_ADDRESS_PROOF_TYPES, mand: 'IDProof2' },
			{ k: 'addrProofNo', label: 'Address Proof Number', type: 'text', inputFilter: 'idProof', mand: 'IDProof2' },
			{ sub: 'Residential Address' },
			{ k: 'pincode', label: 'Pincode', type: 'text', inputFilter: 'pincode', mand: 'PinCode' },
			{ k: 'door', label: 'Door No', type: 'text', mand: 'DoorNo' },
			{ k: 'street', label: 'Address Street', type: 'text', mand: 'StreetAddress' },
			{ k: 'country', label: 'Country', type: 'text', def: 'India', mand: 'Country' },
			{ k: 'state', label: 'State', type: 'text', mand: 'State' },
			{ k: 'postOffice', label: 'Post Office', type: 'text', mand: 'City' },
			{ k: 'district', label: 'District', type: 'text', mand: 'District' },
			{ k: 'localArea', label: 'Local Area (Village / Town)', type: 'text', mand: 'Village' },
			{
				sub: 'Current Address',
				toggle: { k: 'sameAddr', label: 'Same as residential address' },
			},
			{ k: 'cPincode', label: 'Pincode', type: 'text', hideOn: 'sameAddr', inputFilter: 'pincode', mand: 'CurrentAddressPin' },
			{ k: 'cDoor', label: 'Door No', type: 'text', hideOn: 'sameAddr', mand: 'CurrentDoorNo' },
			{ k: 'cStreet', label: 'Address Street', type: 'text', hideOn: 'sameAddr', mand: 'CurrentAddress' },
			{ k: 'cState', label: 'State', type: 'text', hideOn: 'sameAddr', mand: 'CurrentAddressState' },
			{ k: 'cDistrict', label: 'District', type: 'text', hideOn: 'sameAddr', mand: 'CurrentAddressDistrict' },
		],
	},
	{
		id: 'family',
		name: 'Family Details',
		icon: 'Groups',
		kind: 'family',
		optional: true,
		blurb: 'Household profile and individual family members.',
	},
	{
		id: 'nominee',
		name: 'Nominee Details',
		icon: 'VerifiedUser',
		kind: 'fields',
		fields: [
			{ k: 'nomName', label: 'Nominee Name', type: 'text', req: true, inputFilter: 'name', mand: 'NomineeName' },
			{ k: 'nomPhone', label: 'Nominee Phone Number', type: 'tel', mand: 'NomineePhoneNumber' },
			{ k: 'nomAadhaar', label: 'Nominee Aadhaar', type: 'text', inputFilter: 'aadhaar', mand: 'NomineeAadhar' },
			{ k: 'nomDob', label: 'Nominee DOB', type: 'date', age: 'nomAge', ageRole: 'nominee', mand: 'NomineeDOB' },
			{ k: 'nomAge', label: 'Nominee Age', type: 'num', numInteger: true, readOnly: true, mand: 'NomineeAge' },
			{ k: 'nomRel', label: 'Nominee Relationship', type: 'select', opts: RELATIONS, mand: 'NomineeRelationship' },
			{ k: 'nomGender', label: 'Nominee Gender', type: 'select', opts: GENDERS, mand: 'NomineeGender' },
			{ k: 'nomFather', label: 'Nominee Father', type: 'text', mand: 'NomineeFatherName' },
			{ k: 'nomIdProof', label: 'Nominee ID Proof', type: 'select', opts: NOMINEE_ID_PROOFS, mand: 'NomineeIDProff' },
			{ k: 'nomIdNo', label: 'Nominee ID Proof Number', type: 'text', mand: 'NomineeIDProff' },
			{ k: 'nomDoor', label: 'Nominee Current Door Number', type: 'text', mand: 'NomineeCurrentDoorNo' },
			{ k: 'nomStreet', label: 'Nominee Current Address Street', type: 'text', mand: 'NomineeCurrentAddress' },
			{ sub: 'Nominee Images & Proofs' },
			{ k: 'nomPhoto', label: 'Nominee Photo', type: 'upload', col: 1, mand: 'NomineePhoto' },
			{
				k: 'nomAadFront',
				label: 'Nominee Aadhar Front',
				type: 'upload',
				col: 1,
				mand: 'NomineeAadharPhoto',
			},
			{
				k: 'nomAadBack',
				label: 'Nominee Aadhar Back',
				type: 'upload',
				col: 1,
				mand: 'NomineeAadharBackPhoto',
			},
			{
				k: 'nomIdFront',
				label: 'Nominee ID Proof Front',
				type: 'upload',
				col: 1,
				mand: 'NomineeIDProffImage',
			},
			{
				k: 'nomIdBack',
				label: 'Nominee ID Proof Back',
				type: 'upload',
				col: 1,
				mand: 'NomineeIDProffBackImage',
			},
		],
	},
	{
		id: 'bank',
		name: 'Bank Details',
		icon: 'AccountBalance',
		kind: 'fields',
		fields: [
			{
				k: 'acctNo',
				label: 'Account Number',
				type: 'text',
				req: true,
				inputFilter: 'account',
			},
			{
				k: 'acctRe',
				label: 'Re-enter Account Number',
				type: 'text',
				req: true,
				inputFilter: 'account',
			},
			{
				k: 'acctName',
				label: 'Account Holder Name',
				type: 'text',
				req: true,
				inputFilter: 'name',
			},
			{
				k: 'ifsc',
				label: 'IFSC Code',
				type: 'text',
				req: true,
				verify: true,
				inputFilter: 'ifsc',
			},
			{ k: 'bankName', label: 'Bank Name', type: 'text', req: true },
			{ k: 'branch', label: 'Bank Branch Name', type: 'text', req: true },
			{
				k: 'acctType',
				label: 'Account Type',
				type: 'select',
				req: true,
				opts: ['Savings', 'Current', 'Overdraft'],
			},
		],
	},
	{
		id: 'house',
		name: 'House Details',
		icon: 'Home',
		kind: 'house',
		optional: true,
		blurb: 'Living conditions, assets, agricultural land and livestock.',
	},
	{
		id: 'memberDocs',
		name: 'Member Documents',
		icon: 'Description',
		kind: 'docs',
		optional: true,
		docs: [
			{ k: 'aadFront', label: 'Aadhaar Card Front' },
			{ k: 'aadBack', label: 'Aadhaar Card Back' },
			{ k: 'idFront', label: 'ID Proof Front' },
			{ k: 'idBack', label: 'ID Proof Back' },
			{ k: 'addrFront', label: 'Address Proof Front' },
			{ k: 'addrBack', label: 'Address Proof Back' },
			{ k: 'panFront', label: 'PAN Card Front' },
			// { k: 'panBack', label: 'PAN Card Back' },
			{ k: 'passbook', label: 'Passbook / Cheque' },
		],
	},
	{
		id: 'houseImages',
		name: 'House Images',
		icon: 'Home',
		kind: 'docs',
		optional: true,
		docs: [
			{ k: 'h1', label: 'House Image 1' },
			{ k: 'h2', label: 'House Image 2' },
			{ k: 'h3', label: 'House Image 3' },
			{ k: 'h4', label: 'House Image 4' },
			{ k: 'h5', label: 'House Image 5' },
		],
	},
	{
		id: 'extra',
		name: 'Extra Information',
		icon: 'Info',
		kind: 'fields',
		optional: true,
		fields: [
			{
				k: 'blood',
				label: 'Blood Group',
				type: 'select',
				opts: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
				mand: 'BloodGroup',
			},
			{ k: 'identification', label: 'Identification Mark', type: 'text', mand: 'Identification' },
			{
				k: 'education',
				label: 'Education Qualification',
				type: 'select',
				opts: [
					'None',
					'Primary',
					'Secondary',
					'Higher Secondary',
					'Graduate',
					'Post Graduate',
				],
				mand: 'EducationQualification',
			},
			{
				k: 'religion',
				label: 'Religion',
				type: 'select',
				opts: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other'],
				mand: 'Religion',
			},
			{
				k: 'caste',
				label: 'Caste',
				type: 'select',
				opts: ['General', 'OBC', 'SC', 'ST', 'Other'],
				mand: 'Caste',
			},
			{ k: 'email', label: 'Email ID', type: 'email', mand: 'EmailID' },
			{
				k: 'mobileType',
				label: 'Mobile Type',
				type: 'select',
				opts: ['Smartphone', 'Feature phone', 'None'],
			},
			{ k: 'isDisability', label: 'Disability', type: 'toggle', mand: 'Disability' },
			{
				k: 'disability',
				label: 'Enter Disability',
				type: 'text',
				showOn: 'isDisability',
				inputFilter: 'name',
				placeholder: 'Enter Disability',
				mand: 'Disability',
			},
		],
	},
	{
		id: 'official',
		name: 'Official Details',
		icon: 'AccountTree',
		kind: 'fields',
		fields: [
			{ k: 'doj', label: 'Date Of Joining', type: 'date', def: MO_NOW_DATE, mand: 'DOJ' },
			{
				k: 'ecoType',
				label: 'Economic Activity Type',
				type: 'select',
				optsRef: 'ACTIVITY_TYPES',
				mand: 'EconomicActivity',
			},
			{
				k: 'ecoAct',
				label: 'Economic Activity',
				type: 'select',
				optsRef: 'ACTIVITIES',
				mand: 'EconomicActivity',
			},
			{
				k: 'center',
				label: 'Center',
				type: 'select',
				req: true,
				optsRef: 'CENTERS',
				mand: 'Center',
			},
			{ k: 'appAmount', label: 'Application Amount', type: 'num', mand: 'ApplicationAmount' },
			{
				k: 'annualIncome',
				label: 'Annual Income',
				type: 'text',
				inputFilter: 'numeric',
				mand: 'AnnualIncome',
			},
			{
				k: 'monthlyIncome',
				label: 'Monthly Income',
				type: 'text',
				readOnly: true,
				mand: 'MonthlyIncome',
			},
			{ k: 'otherIncome', label: 'Other Income', type: 'num', mand: 'OtherIncome' },
			{
				k: 'language',
				label: 'Preferred Language',
				type: 'select',
				opts: ['English', 'Tamil', 'Hindi', 'Telugu', 'Kannada'],
				def: 'English',
				mand: 'PreferredLanguage',
			},
			{
				k: 'productType',
				label: 'Product Type',
				type: 'select',
				req: true,
				optsRef: 'PRODUCT_TYPES',
				mand: 'ProductType',
			},
			{ k: 'appliedAmount', label: 'Applied Amount', type: 'num' },
		],
	},
	{
		id: 'noc',
		name: 'NOC Documents',
		icon: 'Description',
		kind: 'docs',
		optional: true,
		docs: [
			{ k: 'noc1', label: 'NOC Document 1', detail: 'NOC Document 1 Details' },
			{ k: 'noc2', label: 'NOC Document 2', detail: 'NOC Document 2 Details' },
			{ k: 'noc3', label: 'NOC Document 3', detail: 'NOC Document 3 Details' },
		],
	},
	{
		id: 'other',
		name: 'Other Details',
		icon: 'Receipt',
		kind: 'fields',
		optional: true,
		fields: [
			{ k: 'msme', label: 'MSME Number', type: 'text' },
			{ k: 'msmeDoc', label: 'MSME Document', type: 'upload' },
			{ k: 'gst', label: 'GST Number', type: 'text' },
			{ k: 'gstDoc', label: 'GST Document', type: 'upload' },
			{ sub: 'Supporting documents' },
			{ k: 'fin1', label: 'Financial Document 1', type: 'upload', col: 1 },
			{ k: 'fin2', label: 'Financial Document 2', type: 'upload', col: 1 },
			{ k: 'fin3', label: 'Financial Document 3', type: 'upload', col: 1 },
			{ k: 'inc1', label: 'Income Proof 1', type: 'upload', col: 1 },
			{ k: 'inc2', label: 'Income Proof 2', type: 'upload', col: 1 },
			{ k: 'inc3', label: 'Income Proof 3', type: 'upload', col: 1 },
			{ k: 'itr1', label: 'IT Return 1', type: 'upload', col: 1 },
			{ k: 'itr2', label: 'IT Return 2', type: 'upload', col: 1 },
			{ k: 'itr3', label: 'IT Return 3', type: 'upload', col: 1 },
		],
	},
	{
		id: 'business',
		name: 'Business Information',
		icon: 'Inventory2',
		kind: 'fields',
		optional: true,
		fields: [
			{ k: 'bizName', label: 'Business Name', type: 'text', col: 1 },
			{ k: 'bizType', label: 'Business Type', type: 'text', col: 1 },
			{ k: 'bizYears', label: 'No. of Years in Operation', type: 'num', col: 1, numInteger: true },
			{
				k: 'bizCycle',
				label: 'Business Cycle',
				type: 'select',
				opts: ['Daily', 'Weekly', 'Monthly'],
				def: 'Weekly',
				col: 1,
			},
			{ k: 'bizBill', label: 'Average Bill / Cycle', type: 'num', col: 1 },
		],
	},
	{
		id: 'coapplicant',
		name: 'Co-Applicant',
		icon: 'Groups',
		kind: 'fields',
		optional: true,
		showAllFields: true,
		blurb: 'Co-applicant identity, proofs, and address details.',
		fields: [
			{
				k: 'coName',
				label: 'Name',
				type: 'text',
				inputFilter: 'name',
				mand: 'CoApplicantName',
			},
			{
				k: 'coPhone',
				label: 'Phone Number',
				type: 'tel',
				inputFilter: 'phone',
				mand: 'CoApplicantPhoneNumber',
			},
			{
				k: 'coAadhaar',
				label: 'Aadhaar Number',
				type: 'text',
				inputFilter: 'aadhaar',
				mand: 'CoApplicantAadharNumber',
			},
			{
				k: 'coDob',
				label: 'DOB',
				type: 'date',
				age: 'coAge',
				ageRole: 'coapplicant',
				mand: 'CoApplicantDOB',
			},
			{ k: 'coAge', label: 'Age', type: 'text', readOnly: true },
			{
				k: 'coOccupation',
				label: 'Occupation',
				type: 'select',
				opts: [
					'Self-employed',
					'Salaried',
					'Daily wage',
					'Agriculture',
					'Homemaker',
					'Other',
				],
				mand: 'CoApplicantOccupation',
			},
			{
				k: 'coIncome',
				label: 'Monthly Income',
				type: 'text',
				inputFilter: 'numeric',
				mand: 'CoApplicantMonthlyIncome',
			},
			{
				k: 'coRel',
				label: 'Relationship With Member',
				type: 'select',
				opts: RELATIONS,
				mand: 'CoApplicantRelationShipWithMember',
			},
			{
				k: 'coGender',
				label: 'Gender',
				type: 'select',
				opts: GENDERS,
				mand: 'CoApplicantGender',
			},
			{
				k: 'coMarital',
				label: 'Marital Status',
				type: 'select',
				opts: ['Married', 'Single', 'Divorced', 'Widow'],
				mand: 'CoApplicantMaritalStatus',
			},
			{
				k: 'coIdProof',
				label: 'ID Proof',
				type: 'select',
				opts: ID_PROOFS,
				mand: 'CoApplicantIDProof',
			},
			{
				k: 'coIdNo',
				label: 'ID Proof Number',
				type: 'text',
				inputFilter: 'idProof',
				mand: 'CoApplicantIDProofNumber',
			},
			{
				k: 'coAddrProof',
				label: 'Address Proof',
				type: 'select',
				opts: ID_PROOFS,
				mand: 'CoApplicantAddressProof',
			},
			{
				k: 'coAddrProofNo',
				label: 'Address Proof Number',
				type: 'text',
				inputFilter: 'idProof',
				mand: 'CoApplicantAddressProofNumber',
			},
			{ sub: 'Address' },
			{
				k: 'coPincode',
				label: 'Pincode',
				type: 'text',
				inputFilter: 'pincode',
				mand: 'CoApplicantPincode',
			},
			{ k: 'coDoor', label: 'Door No', type: 'text', mand: 'CoApplicantDoorNumber' },
			{ k: 'coStreet', label: 'Street', type: 'text', mand: 'CoApplicantStreet' },
			{
				k: 'coCountry',
				label: 'Country',
				type: 'text',
				def: 'India',
				readOnly: true,
				mand: 'CoApplicantCountry',
			},
			{ k: 'coState', label: 'State', type: 'text', mand: 'CoApplicantState' },
			{ k: 'coPostOffice', label: 'Post Office', type: 'text', mand: 'CoApplicantPincode' },
			{ k: 'coDistrict', label: 'District', type: 'text', mand: 'CoApplicantDistrict' },
			{ sub: 'Documents' },
			{
				k: 'coAadFront',
				label: 'Aadhaar Card Front',
				type: 'upload',
				col: 1,
				mand: 'CoApplicantAadharFront',
			},
			{
				k: 'coAadBack',
				label: 'Aadhaar Card Back',
				type: 'upload',
				col: 1,
				mand: 'CoApplicantAadharBack',
			},
			{
				k: 'coIdFront',
				label: 'ID Proof Front',
				type: 'upload',
				col: 1,
				mand: 'CoApplicantIDProofFront',
			},
			{
				k: 'coIdBack',
				label: 'ID Proof Back',
				type: 'upload',
				col: 1,
				mand: 'CoApplicantIDProofBack',
			},
			{
				k: 'coAddrFront',
				label: 'Address Proof Front',
				type: 'upload',
				col: 1,
				mand: 'CoApplicantAddressProofFront',
			},
			{
				k: 'coAddrBack',
				label: 'Address Proof Back',
				type: 'upload',
				col: 1,
				mand: 'CoApplicantAddressProofBack',
			},
			{
				k: 'coPhoto',
				label: 'Co-applicant Photo',
				type: 'upload',
				col: 1,
				mand: 'CoApplicantPhoto',
			},
			{
				k: 'coTogether',
				label: 'Co-applicant & Member Together Photo',
				type: 'upload',
				col: 1,
				mand: 'CoApplicantTogetherPhoto',
			},
		],
	},
];

// ---- helpers ----------------------------------------------------------------
const moReqKeys = (st: MOStage, isReq: (st: MOStage, f: MOFieldDef) => boolean) =>
	st.kind === 'fields'
		? (st.fields || []).filter((f) => f.k && isReq(st, f)).map((f) => f.k!)
		: [];

const validateOnboardName = (
	value: unknown,
	label: string,
	required = false,
): string | null => {
	const trimmed = String(value ?? '').trim();
	if (required && !trimmed) return `${label} is required`;
	if (trimmed && !isValidName(trimmed)) return `${label}: ${MEMBER_NAME_ERROR}`;
	return null;
};

const validateBasicOnboardFields = (f: Record<string, any>): string | null => {
	const nameError = validateOnboardName(f.name, 'Member Name', true);
	if (nameError) return nameError;
	if (f.aadhaar && !/^\d{12}$/.test(String(f.aadhaar))) {
		return 'Aadhaar number must be exactly 12 digits';
	}
	if (f.pan && !isValidPAN(f.pan)) {
		return 'Invalid PAN format (e.g. ABCDE1234F)';
	}
	return null;
};

const validatePersonalOnboardFields = (
	f: Record<string, any>,
	mandConfig: Record<string, any> | null | undefined,
): string | null => {
	for (const [key, label] of [
		['father', 'Father Name'],
		['mother', 'Mother Name'],
		['spouse', 'Spouse Name'],
	] as const) {
		const err = validateOnboardName(f[key], label);
		if (err) return err;
	}
	const memberDobErr = validateDOBAge(f.dob, mandConfig, 'member', 'Member');
	if (memberDobErr) return memberDobErr;
	if (f.spouseDob) {
		const spouseDobErr = validateDOBAge(f.spouseDob, mandConfig, 'spouse', 'Spouse');
		if (spouseDobErr) return spouseDobErr;
	}
	if (f.idProof && f.addrProof && f.idProof === f.addrProof) {
		return 'ID Proof and Address Proof cannot be the same';
	}
	if (f.pincode && !isValidPincode(f.pincode)) {
		return 'Enter a valid 6-digit residential pincode';
	}
	if (!f.sameAddr && f.cPincode && !isValidPincode(f.cPincode)) {
		return 'Enter a valid 6-digit current address pincode';
	}
	if (f.altPhone && !isExactDigits(f.altPhone, 10)) {
		return 'Alternate phone number must be a valid 10-digit mobile number';
	}
	return null;
};

const validateBankOnboardFields = (f: Record<string, any>): string | null => {
	const nameError = validateOnboardName(f.acctName, 'Account Holder Name', true);
	if (nameError) return nameError;
	if (f.acctNo && !isValidAccountNumber(f.acctNo)) {
		return 'Account number must be 9–18 digits';
	}
	if (f.acctRe && !isValidAccountNumber(f.acctRe)) {
		return 'Re-enter account number must be 9–18 digits';
	}
	if (f.acctNo && f.acctRe && f.acctNo !== f.acctRe) {
		return 'Account number and re-enter account number do not match';
	}
	if (f.ifsc && !isValidIFSC(f.ifsc)) {
		return 'Enter a valid IFSC (e.g. SBIN0001234)';
	}
	return null;
};

const validateExtraOnboardFields = (
	f: Record<string, any>,
	mandConfig: Record<string, any> | null | undefined,
): string | null => {
	const disabilityMandatory =
		mandConfig?.Disability === '1' ||
		mandConfig?.Disability === 1 ||
		mandConfig?.Disability === true;
	if (disabilityMandatory && !f.isDisability) {
		return 'Disability is required';
	}
	if (f.isDisability && !String(f.disability || '').trim()) {
		return 'Please enter disability details';
	}
	return null;
};

const validateCoapplicantOnboardFields = (
	f: Record<string, any>,
	mandConfig: Record<string, any> | null | undefined,
): string | null => {
	const coNameError = validateOnboardName(
		f.coName,
		'Co-applicant Name',
		Boolean(f.coPhone || f.coAadhaar || f.coDob),
	);
	if (coNameError) return coNameError;
	const coDobErr = validateDOBAge(f.coDob, mandConfig, 'coapplicant', 'Co-applicant');
	if (coDobErr) return coDobErr;
	if (f.coPhone && !/^\d{10}$/.test(f.coPhone)) {
		return 'Phone number must be exactly 10 digits';
	}
	if (f.coAadhaar && !/^\d{12}$/.test(f.coAadhaar)) {
		return 'Aadhaar number must be exactly 12 digits';
	}
	if (f.coIdNo && !/^[a-zA-Z0-9\s]+$/.test(f.coIdNo)) {
		return 'ID Proof Number must not contain special characters';
	}
	if (f.coAddrProofNo && !/^[a-zA-Z0-9\s]+$/.test(f.coAddrProofNo)) {
		return 'Address Proof Number must not contain special characters';
	}
	if (f.coPincode && !isValidPincode(f.coPincode)) {
		return 'Enter a valid 6-digit pincode';
	}
	if (f.coIdProof && f.coAddrProof && f.coIdProof === f.coAddrProof) {
		return 'ID Proof and Address Proof must not be the same';
	}
	return null;
};

const isMandOn = (mandConfig: Record<string, any> | null | undefined, key: string) =>
	mandConfig?.[key] === '1' || mandConfig?.[key] === 1 || mandConfig?.[key] === true;

const normalizeProofType = (type: string): string => {
	const map: Record<string, string> = {
		'Ration Card': 'RationCard',
		RationCard: 'RationCard',
		'Voter ID': 'VoterID',
		VoterID: 'VoterID',
		'Driving License': 'DrivingLicense',
		DrivingLicense: 'DrivingLicense',
		Passport: 'Passport',
		Electricity: 'Electricity',
		Gas: 'Gas',
		Telephone: 'Telephone',
		Water: 'Water',
	};
	return map[type] || String(type || '').replace(/\s/g, '');
};

const dispatchMemberDocSaves = (
	dispatchFn: (action: any) => void,
	basePayload: Record<string, any>,
	docs: Record<string, any>,
	personal: Record<string, any>,
) => {
	if (docs.aadFront || docs.aadBack) {
		dispatchFn(
			updateAadharStart({
				...basePayload,
				memberAadharFrontImg: docs.aadFront,
				memberAadharBackImg: docs.aadBack,
				docType: 'Member',
			}),
		);
	}

	const dispatchProofPair = (
		proofKey: string,
		front: string,
		back: string,
		proofTypeLabel: 'IdProof' | 'AddressProof',
	) => {
		if (!front && !back) return;
		const proof = normalizeProofType(proofKey);
		const payload = { ...basePayload, proofType: proofTypeLabel, docType: 'Member' };
		if (proof === 'RationCard') {
			dispatchFn(
				updateRationCardStart({
					...payload,
					memberRationCardFrontImg: front,
					memberRationCardBackImg: back,
				}),
			);
		} else if (proof === 'VoterID') {
			dispatchFn(
				updateVoterIdStart({
					...payload,
					memberVoterIdFrontImg: front,
					memberVoterIdBackImg: back,
				}),
			);
		} else if (proof === 'DrivingLicense') {
			dispatchFn(
				updateDrivingLicenceStart({
					...payload,
					drivingLicenceFrontImg: front,
					drivingLicenceBackImg: back,
				}),
			);
		} else if (proof === 'Passport') {
			dispatchFn(
				updatePassportStart({
					...payload,
					passportImg: front,
				}),
			);
		} else if (
			proofTypeLabel === 'AddressProof' &&
			['Electricity', 'Gas', 'Telephone', 'Water'].includes(proof)
		) {
			dispatchFn(
				updateAddressExtraProofStart({
					...basePayload,
					addressExtraProofImg: front,
				}),
			);
		}
	};

	if (personal.idProof) {
		dispatchProofPair(personal.idProof, docs.idFront, docs.idBack, 'IdProof');
	}
	if (personal.addrProof) {
		dispatchProofPair(personal.addrProof, docs.addrFront, docs.addrBack, 'AddressProof');
	}
	if (docs.panFront || docs.panBack) {
		dispatchFn(
			updatePancardStart({
				...basePayload,
				memberPanCardFrontImg: docs.panFront,
				// memberPanCardBackImg: docs.panBack,
			}),
		);
	}
	if (docs.passbook) {
		dispatchFn(
			updatePassbookChequeStart({
				...basePayload,
				memberPassbookChequeImg: docs.passbook,
			}),
		);
	}
};

const validateNomineeOnboardFields = (
	f: Record<string, any>,
	mandConfig: Record<string, any> | null | undefined,
): string | null => {
	const nameError = validateOnboardName(f.nomName, 'Nominee Name', true);
	if (nameError) return nameError;
	const nomineeDobErr = validateDOBAge(f.nomDob, mandConfig, 'nominee', 'Nominee');
	if (nomineeDobErr) return nomineeDobErr;
	if (isMandOn(mandConfig, 'NomineePhoto') && !f.nomPhoto) {
		return 'Upload nominee photo';
	}
	if (isMandOn(mandConfig, 'NomineeAadharPhoto') && !f.nomAadFront) {
		return 'Upload nominee Aadhar front image';
	}
	if (isMandOn(mandConfig, 'NomineeAadharBackPhoto') && !f.nomAadBack) {
		return 'Upload nominee Aadhar back image';
	}
	const needsIdFront = isMandOn(mandConfig, 'NomineeIDProffImage');
	const needsIdBack = isMandOn(mandConfig, 'NomineeIDProffBackImage');
	if ((needsIdFront || needsIdBack || f.nomIdFront || f.nomIdBack) && !f.nomIdProof) {
		return 'Select nominee ID proof type';
	}
	if (needsIdFront && !f.nomIdFront) {
		return 'Upload nominee ID proof front image';
	}
	if (needsIdBack && !f.nomIdBack) {
		return 'Upload nominee ID proof back image';
	}
	if (f.nomAadhaar && !/^\d{12}$/.test(String(f.nomAadhaar))) {
		return 'Nominee Aadhaar must be exactly 12 digits';
	}
	return null;
};

const getTextInputProps = (
	f: MOFieldDef,
	val: any,
	set: (v: any) => void,
	disabled = false,
	mandConfig?: Record<string, any> | null,
) => {
	const paddingRight = f.verify ? 40 : 12;
	const locked = disabled || !!f.readOnly;
	const lockedStyle = locked ? { background: '#f3f4f6', cursor: 'not-allowed' as const } : {};

	if (f.inputFilter === 'account') {
		const digits = String(val ?? '').replace(/\D/g, '');
		return {
			type: 'text' as const,
			inputMode: 'numeric' as const,
			autoComplete: 'off',
			value: digits,
			onKeyDown: blockNonDigitKeyDown,
			onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
				set(mergeAccountNumberPaste(e, digits));
			},
			onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
				set(accountNumberChars(e.target.value)),
			placeholder: f.placeholder || f.label,
			readOnly: locked,
			disabled: locked,
			style: {
				...inputStyle,
				paddingRight,
				...(f.k === 'acctNo' ? { WebkitTextSecurity: 'disc' } : {}),
				...lockedStyle,
			},
		};
	}

	if (f.inputFilter === 'ifsc') {
		return {
			type: 'text' as const,
			value: val ?? '',
			onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
				set(
					e.target.value
						.toUpperCase()
						.replace(/[^A-Z0-9]/g, '')
						.slice(0, 11),
				);
			},
			placeholder: f.placeholder || f.label,
			readOnly: locked,
			disabled: locked,
			style: {
				...inputStyle,
				paddingRight,
				textTransform: 'uppercase' as const,
				...lockedStyle,
			},
		};
	}

	if (f.inputFilter === 'phone') {
		const digits = digitsOnly(val, 10);
		return {
			type: 'tel' as const,
			inputMode: 'numeric' as const,
			maxLength: 10,
			value: digits,
			onKeyDown: blockNonDigitKeyDown,
			onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
				set(mergePhonePaste(e, digits, 10));
			},
			onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
				set(digitsOnly(e.target.value, 10)),
			placeholder: f.placeholder || f.label,
			readOnly: locked,
			disabled: locked,
			style: { ...inputStyle, paddingRight, ...lockedStyle },
		};
	}

	if (f.inputFilter === 'aadhaar') {
		const digits = digitsOnly(val, 12);
		return {
			type: 'text' as const,
			inputMode: 'numeric' as const,
			maxLength: 12,
			value: digits,
			onKeyDown: blockNonDigitKeyDown,
			onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
				e.preventDefault();
				set(digitsOnly(`${digits}${e.clipboardData.getData('text')}`, 12));
			},
			onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
				set(digitsOnly(e.target.value, 12)),
			placeholder: f.placeholder || f.label,
			readOnly: locked,
			disabled: locked,
			style: { ...inputStyle, paddingRight, ...lockedStyle },
		};
	}

	if (f.inputFilter === 'pan') {
		const panValue = String(val ?? '')
			.toUpperCase()
			.replace(/[^A-Z0-9]/g, '')
			.slice(0, 10);
		return {
			type: 'text' as const,
			maxLength: 10,
			value: panValue,
			onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
				set(
					e.target.value
						.toUpperCase()
						.replace(/[^A-Z0-9]/g, '')
						.slice(0, 10),
				);
			},
			placeholder: f.placeholder || f.label,
			readOnly: locked,
			disabled: locked,
			style: {
				...inputStyle,
				paddingRight,
				textTransform: 'uppercase' as const,
				...lockedStyle,
			},
		};
	}

	if (f.inputFilter === 'pincode') {
		const digits = digitsOnly(val, 6);
		return {
			type: 'text' as const,
			inputMode: 'numeric' as const,
			maxLength: 6,
			value: digits,
			onKeyDown: blockNonDigitKeyDown,
			onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
				set(mergePincodePaste(e, digits));
			},
			onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
				set(digitsOnly(e.target.value, 6)),
			placeholder: f.placeholder || f.label,
			readOnly: locked,
			disabled: locked,
			style: { ...inputStyle, paddingRight, ...lockedStyle },
		};
	}

	if (f.inputFilter === 'idProof') {
		const sanitized = idProofChars(val);
		return {
			type: 'text' as const,
			value: sanitized,
			onKeyDown: blockNonIdProofKeyDown,
			onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
				e.preventDefault();
				set(mergeIdProofPaste(e, sanitized));
			},
			onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(idProofChars(e.target.value)),
			placeholder: f.placeholder || f.label,
			readOnly: locked,
			disabled: locked,
			style: { ...inputStyle, paddingRight, ...lockedStyle },
		};
	}

	if (f.inputFilter === 'numeric') {
		const sanitized = numericChars(val);
		return {
			type: 'text' as const,
			inputMode: 'decimal' as const,
			value: sanitized,
			onKeyDown: blockNegativeNumberKeyDown,
			onPaste: (e: React.ClipboardEvent<HTMLInputElement>) =>
				blockInvalidNumericPaste(e),
			onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(numericChars(e.target.value)),
			placeholder: f.placeholder || f.label,
			readOnly: locked,
			disabled: locked,
			style: { ...inputStyle, paddingRight, ...lockedStyle },
		};
	}

	if (f.inputFilter === 'name') {
		const sanitized = nameChars(val);
		return {
			type: 'text' as const,
			value: sanitized,
			onKeyDown: blockNonNameKeyDown,
			onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => {
				set(mergeNamePaste(e, sanitized));
			},
			onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(nameChars(e.target.value)),
			placeholder: f.placeholder || f.label,
			readOnly: locked,
			disabled: locked,
			style: { ...inputStyle, paddingRight, ...lockedStyle },
		};
	}

	if (f.type === 'date') {
		const bounds = f.ageRole
			? getDOBInputBoundsForRole(mandConfig, f.ageRole)
			: getDOBInputBoundsForRole(null, 'member');
		return {
			type: 'date' as const,
			value: val ?? '',
			min: bounds.min,
			max: bounds.max,
			onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value),
			placeholder: f.placeholder || f.label,
			readOnly: locked,
			disabled: locked,
			style: { ...inputStyle, paddingRight, ...lockedStyle },
		};
	}

	if (f.type === 'num') {
		const allowDecimal = !isIntegerNumField(f);
		return {
			type: 'tel' as const,
			inputMode: 'numeric' as const,
			value: val ?? '',
			onKeyDown: allowDecimal ? blockNegativeNumberKeyDown : blockNonDigitKeyDown,
			onPaste: (e: React.ClipboardEvent<HTMLInputElement>) =>
				blockInvalidNumericPaste(e, allowDecimal),
			onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
				set(numericChars(e.target.value, allowDecimal)),
			placeholder: f.placeholder || f.label,
			readOnly: locked,
			disabled: locked,
			style: { ...inputStyle, paddingRight, ...lockedStyle },
		};
	}

	return {
		type:
			f.type === 'email'
				? ('email' as const)
				: f.type === 'tel'
					? ('tel' as const)
					: ('text' as const),
		value: val ?? '',
		onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(e.target.value),
		placeholder: f.placeholder || f.label,
		readOnly: locked,
		disabled: locked,
		style: { ...inputStyle, paddingRight, ...lockedStyle },
	};
};

// =============================================================================
// Small presentational primitives (inline-style, LMS palette)
// =============================================================================
const Toggle: React.FC<{ on: boolean; onChange: (v: boolean) => void; label?: string }> = ({
	on,
	onChange,
	label,
}) => (
	<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
		<button
			type='button'
			onClick={() => onChange(!on)}
			aria-pressed={on}
			style={{
				width: 40,
				height: 22,
				borderRadius: 999,
				border: 'none',
				cursor: 'pointer',
				background: on ? LMS.moss : LMS.line,
				position: 'relative',
				flexShrink: 0,
			}}>
			<span
				style={{
					position: 'absolute',
					top: 2,
					left: on ? 20 : 2,
					width: 18,
					height: 18,
					borderRadius: 999,
					background: '#fff',
					transition: 'left .15s',
					boxShadow: '0 1px 3px rgba(0,0,0,.2)',
				}}
			/>
		</button>
		{label && <span style={{ fontSize: 12, color: LMS.inkMuted }}>{label}</span>}
	</span>
);

const inputStyle: React.CSSProperties = {
	width: '100%',
	height: 42,
	padding: '0 12px',
	fontSize: 13,
	background: '#fff',
	border: `1px solid ${LMS.line}`,
	borderRadius: 10,
	outline: 'none',
	color: LMS.ink,
	boxSizing: 'border-box',
};

/** getCenterList returns camelCase; fetchAllCenterList uses PascalCase — support both. */
const centerOptionId = (c: any) => c.LocationID ?? c.locationID ?? '';
const centerOptionLabel = (c: any) => {
	if (c.locationName) return String(c.locationName);
	if (c.LocationName) {
		return c.UniqueBranchID ? `${c.UniqueBranchID} - ${c.LocationName}` : String(c.LocationName);
	}
	return '';
};

const labelStyle: React.CSSProperties = {
	fontSize: 12,
	fontWeight: 600,
	color: LMS.ink2,
	marginBottom: 6,
	display: 'block',
};

const Btn: React.FC<{
	children: React.ReactNode;
	onClick?: () => void;
	variant?: 'primary' | 'secondary' | 'soft' | 'ghost';
	disabled?: boolean;
	loading?: boolean;
	icon?: string;
	small?: boolean;
}> = ({ children, onClick, variant = 'primary', disabled, loading, icon, small }) => {
	const bg =
		variant === 'primary'
			? LMS.moss
			: variant === 'soft'
				? '#DCE8E3'
				: variant === 'ghost'
					? 'transparent'
					: '#fff';
	const color = variant === 'primary' ? '#fff' : variant === 'soft' ? LMS.moss : LMS.ink2;
	const border = variant === 'secondary' ? `1px solid ${LMS.line}` : 'none';
	return (
		<button
			type='button'
			onClick={onClick}
			disabled={disabled || loading}
			style={{
				height: small ? 34 : 40,
				padding: small ? '0 12px' : '0 16px',
				borderRadius: 10,
				border,
				background: bg,
				color,
				fontSize: 13,
				fontWeight: 700,
				cursor: disabled || loading ? 'not-allowed' : 'pointer',
				opacity: disabled || loading ? 0.5 : 1,
				display: 'inline-flex',
				alignItems: 'center',
				gap: 6,
				whiteSpace: 'nowrap',
			}}>
			{loading ? (
				'Sending…'
			) : (
				<>
					{icon && <Icon icon={icon} size='sm' />}
					{children}
				</>
			)}
		</button>
	);
};

const Badge: React.FC<{ children: React.ReactNode; tone: 'neutral' | 'warn' | 'good' }> = ({
	children,
	tone,
}) => {
	const map = {
		neutral: { bg: LMS.sand, fg: LMS.inkMuted },
		warn: { bg: '#FBEFD8', fg: LMS.warn },
		good: { bg: '#DCEEE3', fg: LMS.good },
	}[tone];
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 4,
				padding: '2px 8px',
				borderRadius: 999,
				fontSize: 10,
				fontWeight: 700,
				background: map.bg,
				color: map.fg,
				whiteSpace: 'nowrap',
			}}>
			{children}
		</span>
	);
};

// ---- member file upload tile (S3 upload on select, like basic-details) ----
const MOUpload: React.FC<{
	label: string;
	value?: string;
	onUpload: (relativePath: string) => void;
	uploadFile?: (file: File) => Promise<string | null>;
	beforeUpload?: () => boolean;
	uploadedOn?: string;
	detail?: string;
	detailValue?: string;
	onDetail?: (v: string) => void;
}> = ({ label, value, onUpload, uploadFile, beforeUpload, uploadedOn, detail, detailValue, onDetail }) => {
	const ref = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const previewSrc = resolveUploadPreviewSrc(value);
	const openPicker = () => {
		if (beforeUpload && !beforeUpload()) return;
		ref.current?.click();
	};
	const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files && e.target.files[0];
		if (!file) return;
		e.target.value = '';

		if (!uploadFile) {
			return;
		}

		setUploading(true);
		try {
			const relativePath = await uploadFile(file);
			if (relativePath) {
				onUpload(relativePath);
			}
		} finally {
			setUploading(false);
		}
	};
	return (
		<div
			style={{
				borderRadius: 12,
				border: `1px solid ${value ? '#9CC7B4' : LMS.line}`,
				background: value ? '#EAF3EE' : LMS.sand,
				padding: 14,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				textAlign: 'center',
			}}>
			<input
				ref={ref}
				type='file'
				accept='image/png,image/jpeg,image/jpg,image/*'
				style={{ display: 'none' }}
				onChange={onChange}
			/>
			{previewSrc ? (
				<button
					type='button'
					onClick={openPicker}
					style={{
						width: 120,
						height: 120,
						borderRadius: 14,
						overflow: 'hidden',
						marginBottom: 8,
						padding: 0,
						border: `1px solid ${LMS.line}`,
						background: '#fff',
						cursor: 'pointer',
					}}
					title={`Replace ${label}`}>
					<img
						src={previewSrc}
						alt={label}
						style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
					/>
				</button>
			) : (
				<span
					style={{
						width: 48,
						height: 48,
						borderRadius: 14,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						marginBottom: 8,
						background: '#fff',
						color: LMS.inkMuted,
						border: `1px solid ${LMS.line}`,
					}}>
					<Icon icon='CloudUpload' size='lg' />
				</span>
			)}
			<div style={{ fontSize: 12, fontWeight: 600, color: LMS.ink2 }}>{label}</div>
			{value ? (
				<div
					style={{
						fontSize: 11,
						color: LMS.inkMuted,
						marginTop: 4,
						lineHeight: 1.4,
					}}>
					<b>Image Uploaded On:</b>{' '}
					{getImageUploadDateFromPath(value, uploadedOn)}
				</div>
			) : (
				<div
					style={{
						fontSize: 11,
						color: LMS.inkMuted,
						marginTop: 2,
					}}>
					No file chosen
				</div>
			)}
			<div style={{ marginTop: 8 }}>
				<Btn
					variant={value ? 'soft' : 'secondary'}
					small
					icon='CloudUpload'
					onClick={openPicker}
					disabled={uploading || !uploadFile}>
					{uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
				</Btn>
			</div>
			{detail && (
				<input
					value={detailValue || ''}
					onChange={(e) => onDetail && onDetail(e.target.value)}
					placeholder={detail}
					style={{ ...inputStyle, height: 36, marginTop: 8, fontSize: 12 }}
				/>
			)}
		</div>
	);
};

// =============================================================================
// Field renderer
// =============================================================================
interface OptRefs {
	CENTERS: { id: any; name: string }[];
	ACTIVITY_TYPES: { id: any; name: string }[];
	ACTIVITIES: { id: any; name: string }[];
	PRODUCT_TYPES: { id: any; name: string }[];
}

const MOField: React.FC<{
	f: MOFieldDef;
	val: any;
	set: (v: any) => void;
	required: boolean;
	optRefs: OptRefs;
	onSelectExtra?: (f: MOFieldDef, value: any) => void;
	onIfscCheck?: () => void;
	disabled?: boolean;
	ifscVerified?: boolean;
	uploadFile?: (file: File, fieldKey: string, label: string) => Promise<string | null>;
	uploadedOn?: string;
	mandConfig?: Record<string, any> | null;
}> = ({
	f,
	val,
	set,
	required,
	optRefs,
	onSelectExtra,
	onIfscCheck,
	disabled,
	ifscVerified,
	uploadFile,
	uploadedOn,
	mandConfig,
}) => {
	const span = f.col === 1 ? 'span 1' : f.col === 3 ? 'span 3' : 'span 1';

	if (f.type === 'toggle') {
		return (
			<div style={{ gridColumn: span }}>
				<span style={labelStyle}>{f.label}</span>
				<Toggle on={!!val} onChange={(v) => set(v)} label={val ? 'Yes' : 'No'} />
			</div>
		);
	}

	if (f.type === 'upload') {
		return (
			<div style={{ gridColumn: span }}>
				<MOUpload
					label={f.label || ''}
					value={val}
					uploadedOn={uploadedOn}
					onUpload={(path) => set(path)}
					uploadFile={
						uploadFile && f.k
							? (file) => uploadFile(file, f.k!, f.label || '')
							: undefined
					}
				/>
			</div>
		);
	}

	let control: React.ReactNode;
	if (f.type === 'select') {
		// option refs resolve to {id,name}; static opts are plain strings
		const fieldLabel = f.label ?? 'Option';
		const refList: { id: any; name: string }[] | null = f.optsRef
			? (optRefs as any)[f.optsRef] || []
			: null;
		control = (
			<Select
				ariaLabel={fieldLabel}
				placeholder={`Select ${fieldLabel}`}
				searchPlaceholder={`Search ${fieldLabel}`}
				className='w-100 cash-transaction-fulltext-select'
				disabled={disabled}
				value={val || ''}
				isValidMessage={false}
				onChange={(e: any) => {
					set(e.target.value);
					if (onSelectExtra) onSelectExtra(f, e.target.value);
				}}>
				<Option value=''>{`Select ${fieldLabel}`}</Option>
				{refList
					? refList.map((o) => (
							<Option key={String(o.id)} value={String(o.id)}>
								{o.name}
							</Option>
						))
					: (f.opts || []).map((o) => (
							<Option key={o} value={o}>
								{o}
							</Option>
						))}
			</Select>
		);
	} else {
		const inputProps = getTextInputProps(f, val, set, disabled, mandConfig);
		const inputEl = (
			<div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
				<input {...inputProps} />
				{f.verify && val && (ifscVerified || isValidIFSC(val)) && (
					<span
						style={{
							position: 'absolute',
							right: 6,
							top: '50%',
							transform: 'translateY(-50%)',
							width: 26,
							height: 26,
							borderRadius: 8,
							background: LMS.good,
							color: '#fff',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}>
						<Icon icon='Check' size='sm' />
					</span>
				)}
			</div>
		);

		if (f.inputFilter === 'ifsc' && onIfscCheck) {
			control = (
				<div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
					<div style={{ flex: 1, minWidth: 0 }}>
						<input
							{...inputProps}
							style={{ ...inputProps.style, paddingRight: 12, width: '100%' }}
						/>
					</div>
					<button
						type='button'
						onClick={onIfscCheck}
						disabled={!val}
						title='Check IFSC'
						style={{
							width: 34,
							height: 42,
							flexShrink: 0,
							borderRadius: 10,
							border: `1px solid ${LMS.line}`,
							background: ifscVerified ? '#DCEEE3' : '#fff',
							color: ifscVerified ? LMS.good : LMS.ink2,
							cursor: !val ? 'not-allowed' : 'pointer',
							opacity: !val ? 0.5 : 1,
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							padding: 0,
						}}>
						<Icon icon='Done' size='sm' />
					</button>
				</div>
			);
		} else {
			control = inputEl;
		}
	}

	return (
		<div style={{ gridColumn: span }}>
			<span style={labelStyle}>
				{f.label}
				{required && <span style={{ color: LMS.bad, marginLeft: 3 }}>*</span>}
			</span>
			{control}
		</div>
	);
};

// =============================================================================
// Main component
// =============================================================================
interface MemberOnboardProps {
	open: boolean;
	onClose: () => void;
	mode?: 'add' | 'edit';
	editMember?: Record<string, any> | null;
	showLoanExists?: boolean;
}

const MemberOnboard: React.FC<MemberOnboardProps> = ({
	open,
	onClose,
	mode = 'add',
	editMember = null,
	showLoanExists = false,
}) => {
	const dispatch = useDispatch();
	const isEditMode = mode === 'edit';

	// ---- login context ----
	const loginData = useSelector(getLoginObjDetails) as any;
	const { databaseName, companyID, userID } = loginData || {};

	// ---- member identity / verify selectors ----
	const addMemberResp = useSelector(selectAddMemberResp) as any;
	const addMemberArr = useSelector(selectAddMemberArr) as any;
	const verifyOtpResp = useSelector(selectVerifyMemberOtpRespone) as any;

	// ---- mandatory config ----
	const mandConfig = useSelector(selectMandResponseArr) as any;
	const bankIFSCResp = useSelector(selectBankIFSCcode) as any;

	// ---- dropdown data ----
	const centerList = useSelector(selectCenterListData) as any;
	const productTypeList = useSelector(selectProductTypeListData) as any;
	const activityTypeList = useSelector(selectFetchAllEconomicActivityTypeData) as any;
	const activityList = useSelector(selectEconomicActivityList) as any;

	// ---- component state ----
	const [data, setData] = useState<Record<string, Record<string, any>>>({});
	const [saved, setSaved] = useState<Record<string, { status: string; at?: string }>>({});
	const [mandOnly, setMandOnly] = useState(false);
	const [active, setActive] = useState('verify');
	const [expandOpt, setExpandOpt] = useState<Record<string, boolean>>({});
	const [toast, setToast] = useState<{ kind: 'good' | 'warn'; msg: string } | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [done, setDone] = useState(false);

	// verify stage local state
	const [memberID, setMemberID] = useState<any>('');
	const [otpSent, setOtpSent] = useState(false);
	const [otpSending, setOtpSending] = useState(false);

	// family draft row
	const [famDraft, setFamDraft] = useState<Record<string, any>>({});
	const [editingFamilyId, setEditingFamilyId] = useState<number | null>(null);
	const [personalDetailsPrompt, setPersonalDetailsPrompt] = useState(false);
	const [bankFieldsLocked, setBankFieldsLocked] = useState(false);

	const scrollRef = useRef<HTMLDivElement>(null);
	const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

	const set = (stageId: string, key: string, value: any) =>
		setData((d) => ({ ...d, [stageId]: { ...(d[stageId] || {}), [key]: value } }));
	const stageForm = (id: string) => data[id] || {};

	// ---- load dropdowns on open ----
	useEffect(() => {
		if (!open) return;
		const base = { companyID, databaseName, limit: 0, inputSearch: '' };
		dispatch(
			getCenterListStart({
				...base,
				userID,
				userRole: loginData?.userRole,
				userLevel: loginData?.userLevel,
				userAccessBranchID: loginData?.userAccessBranchID,
			}),
		);
		dispatch(
			getProductListStart({
				...base,
				userID,
				userRole: loginData?.userRole,
				userLevel: loginData?.userLevel,
				infogCompanyID: loginData?.generalCompanyID,
			}),
		);
		dispatch(getProductTypeListStart(base));
		dispatch(fetchAllEconomicActivityTypeStart({ companyID, databaseName }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	// ---- hydrate existing member for edit mode ----
	useEffect(() => {
		if (!open || !isEditMode || !editMember) return;

		const mapped = mapMemberToOnboardData(editMember);
		setData(mapped);
		setSaved({});
		setMemberID(editMember.MemberID);
		setOtpSent(false);
		setOtpSending(false);
		setDone(false);
		setExpandOpt({});
		setMandOnly(false);
		setActive('basic');

		const bank = mapped.bank;
		setBankFieldsLocked(
			!!(bank?.ifsc && isValidIFSC(bank.ifsc) && bank?.bankName && bank?.branch),
		);

		const loanType = resolveMemberLoanTypeFromSources(editMember);
		dispatch(
			getMemberMandatoryStart({
				databaseName,
				companyID,
				userID,
				type: loanType,
				memberID: editMember.MemberID,
			}),
		);

		const ecoType = mapped.official?.ecoType;
		if (ecoType) {
			dispatch(
				economicActivityListStart({
					companyID,
					databaseName,
					EconomicActivityTypeID: ecoType,
					memberID: editMember.MemberID,
				}),
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, isEditMode, editMember]);

	// ---- reset form when opening a new member add flow ----
	useEffect(() => {
		if (open && !isEditMode) {
			setData({});
			setSaved({});
			setMemberID('');
			setOtpSent(false);
			setOtpSending(false);
			setMandOnly(false);
			setExpandOpt({});
			setDone(false);
			setActive('verify');
		}
	}, [open, isEditMode]);

	// ---- option refs for selects (real redux data) ----
	const optRefs: OptRefs = useMemo(
		() => ({
			CENTERS: (centerList || []).map((c: any) => ({
				id: centerOptionId(c),
				name: centerOptionLabel(c),
			})),
			ACTIVITY_TYPES: (activityTypeList || []).map((a: any) => ({
				id: a.EconomicActivityTypeID,
				name: a.EconomicActivityTypeName,
			})),
			ACTIVITIES: (data.official?.ecoType ? activityList || [] : []).map((a: any) => ({
				id: a.EconomicActivityID,
				name: a.EconomicActivityName,
			})),
			PRODUCT_TYPES: (productTypeList || []).map((p: any) => ({
				id: p.ProductTypeID,
				name: p.ProductTypeName,
			})),
		}),
		[centerList, activityTypeList, activityList, productTypeList, data.official?.ecoType],
	);

	// ---- mandatory gating: design req OR company-config mandatory ----
	const isFieldRequired = (st: MOStage, f: MOFieldDef): boolean => {
		if (f.req) return true;
		if (f.mand && mandConfig && (mandConfig as any)[f.mand]) {
			const v = (mandConfig as any)[f.mand];
			return v === '1' || v === 1 || v === true;
		}
		return false;
	};

	// ---- per-stage required accounting ----
	const stageReqStatus = (st: MOStage) => {
		if (st.kind === 'verify') {
			return { need: 1, have: memberID && isVerified ? 1 : 0 };
		}
		if (st.kind === 'loantype') {
			const f = stageForm('loan');
			return { need: 1, have: f.product ? 1 : 0 };
		}
		const f = stageForm(st.id);
		const keys = moReqKeys(st, isFieldRequired).filter((k) => {
			const fld = st.fields?.find((x) => x.k === k);
			if (fld?.showOn && !f[fld.showOn]) return false;
			if (fld?.hideOn && f[fld.hideOn]) return false;
			return true;
		});
		return {
			need: keys.length,
			have: keys.filter((k) => {
				const v = f[k];
				if (k === 'isDisability') return !!v;
				return v != null && v !== '';
			}).length,
		};
	};

	// ---- verify-stage response handling (member creation + OTP) ----
	const verifyForm = stageForm('verify');
	const isVerified = !!verifyForm.verified;

	useEffect(() => {
		if (addMemberResp == null) return;
		setOtpSending(false);
		const { statusCode } = addMemberResp;
		if (statusCode === '01' || statusCode === '102') {
			setOtpSent(true);
			setToast({ kind: 'good', msg: 'OTP sent to mobile' });
		} else if (statusCode === '101' || statusCode === '103') {
			// number already verified — mark verified directly
			set('verify', 'verified', true);
			setToast({ kind: 'good', msg: 'Mobile already verified' });
		} else if (statusCode === '111') {
			setToast({ kind: 'warn', msg: 'Request could not be processed right now' });
		} else {
			setToast({ kind: 'warn', msg: 'Could not send OTP' });
		}
		// capture MemberID from the created member
		if (addMemberArr && addMemberArr.length > 0 && addMemberArr[0]?.MemberID) {
			setMemberID(addMemberArr[0].MemberID);
		}
		dispatch(addMemberDetailsResponseResetStart());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addMemberResp]);

	useEffect(() => {
		if (verifyOtpResp == null) return;
		if (verifyOtpResp.statusCode === '01' || verifyOtpResp.statusCode === '103') {
			set('verify', 'verified', true);
			setOtpSent(false);
			setToast({ kind: 'good', msg: 'Mobile verified' });
		} else if (verifyOtpResp.statusCode === '111') {
			setToast({ kind: 'warn', msg: 'Request could not be processed right now' });
		} else {
			setToast({ kind: 'warn', msg: 'Incorrect OTP' });
		}
		dispatch(verifyMemberNumberOtpResponseResetStart());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [verifyOtpResp]);

	// ---- IFSC lookup (same API as center-wise loan / member bank details) ----
	useEffect(() => {
		if (bankIFSCResp == null || bankIFSCResp === undefined) return;
		if (bankIFSCResp?.IFSC) {
			set('bank', 'ifsc', bankIFSCResp.IFSC);
			set('bank', 'bankName', bankIFSCResp.BANK || '');
			set(
				'bank',
				'branch',
				bankIFSCResp.BRANCH && bankIFSCResp.ADDRESS
					? `${bankIFSCResp.BRANCH}(${bankIFSCResp.ADDRESS})`
					: bankIFSCResp.BRANCH || '',
			);
			setBankFieldsLocked(true);
			setToast({ kind: 'good', msg: 'Bank name and branch fetched from IFSC' });
		} else {
			setBankFieldsLocked(false);
			setToast({ kind: 'warn', msg: 'Please Check the IFSC Code' });
		}
		dispatch(bankIFSCcodeReset());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bankIFSCResp]);

	// ---- verify-stage actions ----
	const sendOtp = () => {
		const phone = (verifyForm.phone || '').replace(/[^0-9]/g, '');
		if (phone.length !== 10) {
			setToast({ kind: 'warn', msg: 'Enter a valid 10-digit mobile number' });
			return;
		}
		setOtpSending(true);
		dispatch(
			addMemberDetailsStart({
				memberPhoneNumber: phone,
				userID,
				databaseName,
				companyID,
				sendOTP: 1,
				from: 'WEB',
			}),
		);
	};

	const verifyOtp = () => {
		const otp = verifyForm.otp || '';
		if (otp.length !== 6) {
			setToast({ kind: 'warn', msg: 'Enter the 6-digit OTP' });
			return;
		}
		dispatch(
			verifyMemberNumberOtpStart({
				verifyOtp: otp,
				userID,
				companyID,
				databaseName,
				memberID,
				memberPhoneNumber: (verifyForm.phone || '').replace(/[^0-9]/g, ''),
			}),
		);
	};

	// ---- loan-type selection → pull mandatory config ----
	const selectLoanType = (t: string) => {
		set('loan', 'product', t);
		if (!ensureMember()) return;
		dispatch(getMemberMandatoryStart({ databaseName, companyID, userID, type: t, memberID }));
	};

	// ---- guard: member must be verified before downstream saves ----
	const ensureMember = (): boolean => {
		if (!memberID || !isVerified) {
			setToast({ kind: 'warn', msg: 'Verify the member’s mobile first' });
			goToStage('verify');
			return false;
		}
		return true;
	};

	/** Upload to S3 on file select (same as member-basic-details handleFileChange). */
	const handleMemberImageUpload = async (
		file: File,
		fieldKey: string,
		label: string,
	): Promise<string | null> => {
		if (!memberID) {
			setToast({ kind: 'warn', msg: 'Verify member mobile before uploading files' });
			return null;
		}
		if (
			(fieldKey === 'idFront' || fieldKey === 'idBack') &&
			(!stageForm('personal').idProof || !String(stageForm('personal').idProofNo || '').trim())
		) {
			setPersonalDetailsPrompt(true);
			return null;
		}
		if (
			(fieldKey === 'addrFront' || fieldKey === 'addrBack') &&
			(!stageForm('personal').addrProof ||
				!String(stageForm('personal').addrProofNo || '').trim())
		) {
			setPersonalDetailsPrompt(true);
			return null;
		}
		if (
			(fieldKey === 'nomIdFront' || fieldKey === 'nomIdBack') &&
			!stageForm('nominee').nomIdProof
		) {
			setToast({ kind: 'warn', msg: 'Select nominee ID proof type before uploading' });
			return null;
		}
		const generalCompanyID = loginData?.generalCompanyID;
		if (!generalCompanyID) {
			setToast({ kind: 'warn', msg: 'Company context missing for upload' });
			return null;
		}

		const path = resolveMemberUploadPath(
			generalCompanyID,
			memberID,
			fieldKey,
			stageForm('personal'),
		);
		try {
			const uploadResponse = await imageUploadToS3(file, path, loginData);
			if (!uploadResponse) {
				setToast({ kind: 'warn', msg: 'File upload failed' });
				return null;
			}
			const relativePath = uploadResponse.replace(/^.*uploadsA\//, 'uploadsA/');
			setToast({ kind: 'good', msg: `${label} uploaded successfully` });

			if (fieldKey === 'coPhoto') {
				set(
					'coapplicant',
					'coPhotoUploadedOn',
					moment().format('DD-MM-YYYY hh:mm A'),
				);
			}

			const uploadBase = { companyID, databaseName, userID, memberID };
			if (fieldKey === 'photo') {
				dispatch(
					addMemberPhotoStart({
						...uploadBase,
						memberProfileImg: relativePath,
						docType: 'Member',
					}),
				);
			} else if (fieldKey === 'nomPhoto') {
				dispatch(
					addMemberPhotoStart({
						...uploadBase,
						memberProfileImg: relativePath,
						docType: 'Nominee',
					}),
				);
			} else if (fieldKey === 'sign') {
				dispatch(
					uploadSignatureStart({
						...uploadBase,
						memberSignature: relativePath,
					}),
				);
			}

			return relativePath;
		} catch {
			setToast({ kind: 'warn', msg: 'File upload failed' });
			return null;
		}
	};

	const checkIfscCode = () => {
		const ifsc = stageForm('bank').ifsc;
		if (!isValidIFSC(ifsc)) {
			setToast({ kind: 'warn', msg: 'Enter a valid IFSC (e.g. SBIN0001234)' });
			return;
		}
		dispatch(bankIFSCcodeStart({ ifscCode: ifsc }));
	};

	const base = () => ({ companyID, databaseName, userID, memberID });

	// ---- per-stage real save dispatch ----
	const dispatchStageSave = (id: string) => {
		const f = stageForm(id);
		switch (id) {
			case 'basic': {
				dispatch(
					basicDetailsAddStart({
						...base(),
						memberName: f.name,
						memberGender: f.gender,
						memberAadharNumber: f.aadhaar,
						memberPanNumber: f.pan,
						memberPhone: (stageForm('verify').phone || '').replace(/[^0-9]/g, ''),
						isAadharVerified: 0,
					}),
				);
				if (f.photo)
					dispatch(
						addMemberPhotoStart({
							...base(),
							memberProfileImg: f.photo,
							docType: 'Member',
						}),
					);
				if (f.sign) dispatch(uploadSignatureStart({ ...base(), memberSignature: f.sign }));
				break;
			}
			case 'personal': {
				dispatch(
					personalDetailsStart({
						...base(),
						memberDOB: f.dob,
						memberAge: f.age,
						maritialStatus: f.marital,
						fatherName: f.father,
						motherName: f.mother,
						spouseName: f.spouse,
						spouseDOB: f.spouseDob,
						alternatePhoneNumber: f.altPhone,
						selectedIdProof: f.idProof,
						idProofNumber: f.idProofNo,
						addressProofType: f.addrProof,
						addressProofNumber: f.addrProofNo,
					}),
				);
				dispatch(
					residentialDetailsAddStart({
						...base(),
						pincode: f.pincode,
						doorNo: f.door,
						addressStreet: f.street,
						country: f.country || 'India',
						state: f.state,
						district: f.district,
						village: f.localArea,
						postOffice: f.postOffice,
					}),
				);
				dispatch(
					currentAddressAddStart({
						...base(),
						pincode: f.sameAddr ? f.pincode : f.cPincode,
						doorNo: f.sameAddr ? f.door : f.cDoor,
						addressStreet: f.sameAddr ? f.street : f.cStreet,
						country: f.country || 'India',
						state: f.sameAddr ? f.state : f.cState,
						district: f.sameAddr ? f.district : f.cDistrict,
						village: f.localArea,
						postOffice: f.postOffice,
						sameForCurrent: f.sameAddr ? 1 : 0,
					}),
				);
				break;
			}
			case 'nominee': {
				dispatch(
					nomineeDetailsAddStart({
						...base(),
						nomineeRelationship: f.nomRel,
						nomineeName: f.nomName,
						nomineeDOB: f.nomDob,
						gender: f.nomGender,
						nomineeFatherName: f.nomFather,
						nomineeAadharNumber: f.nomAadhaar,
						nomineeIDProofType: f.nomIdProof,
						nomineeIDProofNumber: f.nomIdNo,
						nomineePhoneNumber: f.nomPhone,
						doorNo: f.nomDoor,
						addressStreet: f.nomStreet,
						livingInSameAddress: 0,
					}),
				);
				if (f.nomPhoto) {
					dispatch(
						addMemberPhotoStart({
							...base(),
							memberProfileImg: f.nomPhoto,
							docType: 'Nominee',
						}),
					);
				}
				if (f.nomAadFront || f.nomAadBack) {
					dispatch(
						updateAadharStart({
							...base(),
							memberAadharFrontImg: f.nomAadFront,
							memberAadharBackImg: f.nomAadBack,
							docType: 'Nominee',
						}),
					);
				}
				if (f.nomIdFront || f.nomIdBack) {
					const proofType = normalizeProofType(f.nomIdProof || '');
					const idPayload = {
						...base(),
						proofType: 'IdProof',
						docType: 'Nominee',
					};
					if (proofType === 'RationCard') {
						dispatch(
							updateRationCardStart({
								...idPayload,
								memberRationCardFrontImg: f.nomIdFront,
								memberRationCardBackImg: f.nomIdBack,
							}),
						);
					} else if (proofType === 'VoterID') {
						dispatch(
							updateVoterIdStart({
								...idPayload,
								memberVoterIdFrontImg: f.nomIdFront,
								memberVoterIdBackImg: f.nomIdBack,
							}),
						);
					} else if (proofType === 'DrivingLicense') {
						dispatch(
							updateDrivingLicenceStart({
								...idPayload,
								drivingLicenceFrontImg: f.nomIdFront,
								drivingLicenceBackImg: f.nomIdBack,
							}),
						);
					} else if (proofType === 'Passport') {
						dispatch(
							updatePassportStart({
								...idPayload,
								passportImg: f.nomIdFront,
							}),
						);
					}
				}
				break;
			}
			case 'bank': {
				dispatch(
					bankCreateStart({
						...base(),
						accountNumber: f.acctNo,
						reEnterAccountNumber: f.acctRe,
						accountHolderName: f.acctName,
						ifscCode: f.ifsc,
						bankName: f.bankName,
						bankBranchName: f.branch,
						accountType: f.acctType,
					}),
				);
				break;
			}
			case 'official': {
				dispatch(
					officialDetailsAddStart({
						...base(),
						economicActivitySelectValue: f.ecoAct,
						centerSelectValue: f.center,
						applicationAmount: f.appAmount,
						annualIncome: f.annualIncome,
						monthlyIncome: f.monthlyIncome,
						otherMonthlyIncome: f.otherIncome,
						perferredLanguage: f.language || 'English',
						appliedAmount: f.appliedAmount,
						productTypeSelectValue: f.productType,
					}),
				);
				break;
			}
			case 'family': {
				dispatch(
					familyIncomeStart({
						...base(),
						familyMonthlyIncome: f.famIncome,
						familyMonthlyExpenses: f.famExpenses,
						familyMonthlyExtraSpent: f.famExtra,
						familyType: f.familyType,
						cityType: f.area,
					}),
				);
				break;
			}
			case 'house': {
				dispatch(
					houseCreateStart({
						...base(),
						houseType: f.houseType,
						landValue: f.agriValue,
						landSize: f.agriSize,
						durationOfStay: f.stayYears,
						noOfRooms: f.rooms,
						facilityType: (f.facilities || []).join(','),
						havingAgriculturalLand: f.hasAgri ? 1 : 0,
						agriculturalLandValue: f.agriValue,
						incomeFromLiveStock: f.livestockIncome,
						havingLivestock: f.hasLivestock ? 1 : 0,
						assetsType: (f.assets || []).join(','),
					}),
				);
				break;
			}
			case 'extra': {
				dispatch(
					extraInformationAddStart({
						...base(),
						bloodGroup: f.blood,
						disablity: f.isDisability ? 1 : 0,
						nameDisablity: f.isDisability ? String(f.disability || '').trim() : '',
						identification: f.identification,
						educationQualification: f.education,
						religion: f.religion,
						caste: f.caste,
						mailID: f.email,
						phoneType: f.mobileType,
					}),
				);
				break;
			}
			case 'other': {
				dispatch(
					addMemberOtherDetailsStart({
						...base(),
						msmeNumber: f.msme,
						msmeDocumentImage: f.msmeDoc,
						gstNumber: f.gst,
						gstDocumentImage: f.gstDoc,
						financialDocument1: f.fin1,
						financialDocument2: f.fin2,
						financialDocument3: f.fin3,
						incomeProofDocument1: f.inc1,
						incomeProofDocument2: f.inc2,
						incomeProofDocument3: f.inc3,
						itReturnDocument1: f.itr1,
						itReturnDocument2: f.itr2,
						itReturnDocument3: f.itr3,
					}),
				);
				break;
			}
			case 'business': {
				dispatch(
					addMemberBusinessDetailsStart({
						...base(),
						businessName: f.bizName,
						businessType: f.bizType,
						noOfYearsOperation: f.bizYears,
						businessData: f.bizCycle || 'Weekly',
						weeklyBill: f.bizBill,
					}),
				);
				break;
			}
			case 'coapplicant': {
				dispatch(
					addCoBorrowerStart({
						...base(),
						coApplicantName: f.coName,
						coApplicantPhoneNumber: f.coPhone,
						coApplicantAadharNumber: f.coAadhaar,
						coApplicantDOB: f.coDob,
						coApplicantAge: f.coAge,
						coApplicantMonthlyIncome: f.coIncome,
						coApplicantRelationship: f.coRel,
						relationshipwithMember: f.coRel,
						memberGender: f.coGender,
						maritalStatus: f.coMarital,
						coApplicantIDProof: f.coIdProof,
						coApplicantIDProofNumber: f.coIdNo,
						coApplicantAddressProof: f.coAddrProof,
						coApplicantAddressProofNumber: f.coAddrProofNo,
						coApplicantOccupationSelectValue: f.coOccupation,
						coApplicantFrontAadhar: f.coAadFront,
						coApplicantBackAadhar: f.coAadBack,
						coApplicantFrontID: f.coIdFront,
						coApplicantBackID: f.coIdBack,
						coApplicantFrontAddress: f.coAddrFront,
						coApplicantBackAddress: f.coAddrBack,
						coApplicantProfileImg: f.coPhoto,
						coapplicantTogetherImg: f.coTogether,
						doorNo: f.coDoor,
						addressStreet: f.coStreet,
						country: f.coCountry || 'India',
						state: f.coState,
						district: f.coDistrict,
						pincode: f.coPincode,
						coApplicantPostOffice: f.coPostOffice,
					}),
				);
				break;
			}
			case 'memberDocs': {
				dispatchMemberDocSaves(
					dispatch,
					base(),
					f,
					stageForm('personal'),
				);
				break;
			}
			case 'houseImages': {
				dispatch(
					updateHousePhotosStart({
						...base(),
						memberHouseImg1: f.h1,
						memberHouseImg2: f.h2,
						memberHouseImg3: f.h3,
						memberHouseImg4: f.h4,
						memberHouseImg5: f.h5,
					}),
				);
				break;
			}
			case 'noc': {
				dispatch(
					updateNocPhotosStart({
						...base(),
						memberNocImage1: f.noc1,
						memberNocImage2: f.noc2,
						memberNocImage3: f.noc3,
						memberNocDetails1: f.noc1_d,
						memberNocDetails2: f.noc2_d,
						memberNocDetails3: f.noc3_d,
					}),
				);
				break;
			}
			default:
				break;
		}
	};

	// ---- add or update a family member row (real save) ----
	const saveFamilyMember = () => {
		if (!famDraft.name) return;
		const familyNameError = validateOnboardName(famDraft.name, 'Family Member Name', true);
		if (familyNameError) {
			setToast({ kind: 'warn', msg: familyNameError });
			return;
		}
		if (!ensureMember()) return;
		dispatch(
			familyMemberAddStart({
				...base(),
				familyMemberID: editingFamilyId || '',
				name: famDraft.name,
				aadharNumber: famDraft.aadhaar,
				gender: famDraft.gender,
				dob: famDraft.dob,
				age: famDraft.age,
				occupation: famDraft.occupation,
				relationship: famDraft.rel,
				education: famDraft.education,
				familyType: stageForm('family').familyType,
			}),
		);
		const rows = stageForm('family').members || [];
		if (editingFamilyId) {
			set(
				'family',
				'members',
				rows.map((r: any) =>
					r.id === editingFamilyId ? { ...famDraft, id: editingFamilyId } : r,
				),
			);
			setEditingFamilyId(null);
			setToast({ kind: 'good', msg: 'Family member updated' });
		} else {
			set('family', 'members', [...rows, { ...famDraft, id: Date.now() }]);
			setToast({ kind: 'good', msg: 'Family member added' });
		}
		setFamDraft({});
	};

	const editFamilyMember = (row: Record<string, any>) => {
		setEditingFamilyId(row.id);
		setFamDraft({ ...row });
	};

	const cancelFamilyEdit = () => {
		setEditingFamilyId(null);
		setFamDraft({});
	};

	// legacy alias kept for any stale references
	const addFamilyMember = saveFamilyMember;

	// ---- save current stage (mark saved + dispatch real action) ----
	const saveStage = (id: string): boolean => {
		const st = MO_STAGES.find((s) => s.id === id)!;
		if (st.kind === 'verify' || st.kind === 'loantype') return true;
		if (!ensureMember()) return false;
		if (id === 'basic') {
			const basicError = validateBasicOnboardFields(stageForm('basic'));
			if (basicError) {
				setToast({ kind: 'warn', msg: basicError });
				return false;
			}
		}
		if (id === 'personal') {
			const personalError = validatePersonalOnboardFields(stageForm('personal'), mandConfig);
			if (personalError) {
				setToast({ kind: 'warn', msg: personalError });
				return false;
			}
		}
		if (id === 'bank') {
			const bankError = validateBankOnboardFields(stageForm('bank'));
			if (bankError) {
				setToast({ kind: 'warn', msg: bankError });
				return false;
			}
		}
		if (id === 'coapplicant') {
			const coError = validateCoapplicantOnboardFields(stageForm('coapplicant'), mandConfig);
			if (coError) {
				setToast({ kind: 'warn', msg: coError });
				return false;
			}
		}
		if (id === 'extra') {
			const extraError = validateExtraOnboardFields(stageForm('extra'), mandConfig);
			if (extraError) {
				setToast({ kind: 'warn', msg: extraError });
				return false;
			}
		}
		if (id === 'nominee') {
			const nomineeError = validateNomineeOnboardFields(stageForm('nominee'), mandConfig);
			if (nomineeError) {
				setToast({ kind: 'warn', msg: nomineeError });
				return false;
			}
		}
		setSaved((s) => ({ ...s, [id]: { status: 'saving', at: s[id]?.at } }));
		dispatchStageSave(id);
		const at = moNowTime();
		setSaved((s) => ({ ...s, [id]: { status: 'saved', at } }));
		setToast({ kind: 'good', msg: `${st.name} saved · ${at}` });
		return true;
	};

	const stageIndex = (id: string) => MO_STAGES.findIndex((s) => s.id === id);
	const goToStage = (id: string) => {
		const el = sectionRefs.current[id];
		const sc = scrollRef.current;
		if (!el || !sc) return;
		const target = Math.max(
			0,
			el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 14,
		);
		sc.scrollTop = target;
		setActive(id);
	};

	const saveAndNext = (id: string) => {
		const st = MO_STAGES.find((s) => s.id === id)!;
		if (st.kind === 'verify') {
			if (!ensureMember()) return;
		} else if (st.kind === 'loantype') {
			if (!stageForm('loan').product) {
				setToast({ kind: 'warn', msg: 'Pick a loan product' });
				return;
			}
			if (!ensureMember()) return;
			dispatch(
				getMemberMandatoryStart({
					databaseName,
					companyID,
					userID,
					type: stageForm('loan').product,
					memberID,
				}),
			);
		} else {
			const rs = stageReqStatus(st);
			if (rs.have < rs.need) {
				setToast({
					kind: 'warn',
					msg: `${st.name}: ${rs.need - rs.have} required field${
						rs.need - rs.have > 1 ? 's' : ''
					} still empty`,
				});
			}
			if (!saveStage(id)) return;
		}
		const next = MO_STAGES[stageIndex(id) + 1];
		if (next) {
			setExpandOpt((e) => ({ ...e, [next.id]: true }));
			setTimeout(() => goToStage(next.id), 80);
		}
	};

	// ---- totals + overall progress ----
	const totals = MO_STAGES.reduce(
		(a, st) => {
			const s = stageReqStatus(st);
			a.need += s.need;
			a.have += s.have;
			return a;
		},
		{ need: 0, have: 0 },
	);
	const mandRemaining = totals.need - totals.have;
	const overallPct = Math.round((totals.have / Math.max(1, totals.need)) * 100);

	// ---- scroll spy ----
	useEffect(() => {
		if (!open) return;
		const root = scrollRef.current;
		if (!root) return;
		const obs = new IntersectionObserver(
			(entries) => {
				entries.forEach((en) => {
					if (en.isIntersecting)
						setActive((en.target as HTMLElement).dataset.stage || '');
				});
			},
			{ root, rootMargin: '-15% 0px -70% 0px', threshold: 0 },
		);
		Object.values(sectionRefs.current).forEach((el) => el && obs.observe(el));
		return () => obs.disconnect();
	}, [open, mandOnly]);

	// ---- toast auto-dismiss ----
	useEffect(() => {
		if (!toast) return;
		const t = setTimeout(() => setToast(null), 2600);
		return () => clearTimeout(t);
	}, [toast]);

	const anySaving = Object.values(saved).some((s) => s.status === 'saving');
	const lastSavedAt = Object.values(saved)
		.filter((s) => s.status === 'saved')
		.map((s) => s.at)
		.slice(-1)[0];

	const submit = () => {
		if (!ensureMember()) return;
		setSubmitting(true);
		MO_STAGES.forEach((st) => {
			if (
				st.kind !== 'verify' &&
				st.kind !== 'loantype' &&
				saved[st.id]?.status !== 'saved'
			) {
				dispatchStageSave(st.id);
			}
		});
		setTimeout(() => {
			setSubmitting(false);
			setDone(true);
		}, 500);
	};

	const resetAll = () => {
		setData({});
		setSaved({});
		setMemberID('');
		setOtpSent(false);
		setOtpSending(false);
		setMandOnly(false);
		setExpandOpt({});
		setDone(false);
		setActive('verify');
		setBankFieldsLocked(false);
	};

	if (!open) return null;

	// =========================================================================
	// DONE screen
	// =========================================================================
	if (done) {
		return (
			<div
				style={{
					position: 'fixed',
					inset: 0,
					zIndex: 2000,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: 24,
					background: 'rgba(26,24,20,.5)',
					backdropFilter: 'blur(4px)',
				}}>
				<div
					style={{
						maxWidth: 440,
						width: '100%',
						background: '#fff',
						borderRadius: 20,
						border: `1px solid ${LMS.line}`,
						padding: 40,
						textAlign: 'center',
						boxShadow: '0 30px 60px -15px rgba(26,24,20,.4)',
					}}>
					<div
						style={{
							width: 64,
							height: 64,
							borderRadius: 18,
							background: LMS.good,
							color: '#fff',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							margin: '0 auto 16px',
						}}>
						<Icon icon='Check' size='2x' />
					</div>
					<div
						style={{
							fontFamily: DISPLAY,
							fontSize: 24,
							fontWeight: 600,
							color: LMS.ink,
						}}>
						{isEditMode ? 'Member updated' : 'Application submitted'}
					</div>
					<div style={{ fontSize: 13, color: LMS.inkMuted, marginTop: 8 }}>
						{isEditMode
							? `${stageForm('basic').name || editMember?.MemberName || 'Member'}’s details were saved across all stages.`
							: `${stageForm('basic').name || 'New member'}’s application was saved across all ${MO_STAGES.length} stages and sent for verification.`}
					</div>
					<div
						style={{
							display: 'flex',
							gap: 12,
							justifyContent: 'center',
							marginTop: 24,
						}}>
						<Btn variant='secondary' onClick={onClose}>
							Close
						</Btn>
						{!isEditMode ? (
							<Btn variant='primary' icon='Add' onClick={resetAll}>
								Add another
							</Btn>
						) : null}
					</div>
				</div>
			</div>
		);
	}

	// =========================================================================
	// Stage body dispatcher
	// =========================================================================
	const renderFields = (st: MOStage) => {
		const f = stageForm(st.id);
		return (
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
					gap: 16,
				}}>
				{(st.fields || []).map((fld, i) => {
					if (st.id === 'extra' && (fld.k === 'isDisability' || fld.k === 'disability')) {
						return null;
					}
					if (fld.sub)
						return (
							<div
								key={`sub${i}`}
								style={{
									gridColumn: 'span 3',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									gap: 16,
									marginTop: i === 0 ? 0 : 8,
									paddingTop: i === 0 ? 0 : 12,
									borderTop: i === 0 ? 'none' : `1px solid ${LMS.line}`,
								}}>
								<div
									style={{
										fontSize: 11,
										textTransform: 'uppercase',
										letterSpacing: '.06em',
										fontWeight: 700,
										color: LMS.inkMuted,
									}}>
									{fld.sub}
								</div>
								{fld.toggle && (
									<Toggle
										on={!!f[fld.toggle.k]}
										onChange={(v) => set(st.id, fld.toggle!.k, v)}
										label={fld.toggle.label}
									/>
								)}
							</div>
						);
					if (fld.hideOn && f[fld.hideOn]) return null;
					if (fld.showOn && !f[fld.showOn]) return null;
					const required = isFieldRequired(st, fld);
					if (mandOnly && !st.showAllFields && !required && fld.type !== 'upload')
						return null;
					const val = f[fld.k!] != null ? f[fld.k!] : fld.def;
					return (
						<MOField
							key={fld.k}
							f={fld}
							val={val}
							required={required}
							optRefs={optRefs}
							uploadFile={handleMemberImageUpload}
							onIfscCheck={
								st.id === 'bank' && fld.k === 'ifsc' ? checkIfscCode : undefined
							}
							disabled={
								(st.id === 'bank' && (fld.k === 'bankName' || fld.k === 'branch')) ||
								(st.id === 'official' && fld.k === 'ecoAct' && !f.ecoType)
							}
							ifscVerified={
								st.id === 'bank' &&
								fld.k === 'ifsc' &&
								bankFieldsLocked &&
								isValidIFSC(val)
							}
							uploadedOn={fld.k === 'coPhoto' ? f.coPhotoUploadedOn : undefined}
							mandConfig={mandConfig}
							set={(v) => {
								set(st.id, fld.k!, v);
								if (fld.age && v) {
									set(st.id, fld.age, ageFromDOB(v));
								}
								if (st.id === 'official' && fld.k === 'annualIncome') {
									set(st.id, 'monthlyIncome', monthlyFromAnnual(v));
								}
								if (st.id === 'bank' && fld.k === 'ifsc') {
									setBankFieldsLocked(false);
									set('bank', 'bankName', '');
									set('bank', 'branch', '');
								}
							}}
							onSelectExtra={(field, value) => {
								if (st.id === 'personal' && (field.k === 'idProof' || field.k === 'addrProof')) {
									const otherKey = field.k === 'idProof' ? 'addrProof' : 'idProof';
									if (value && f[otherKey] && value === f[otherKey]) {
										set(st.id, field.k!, '');
										setToast({
											kind: 'warn',
											msg: 'ID Proof and Address Proof cannot be the same',
										});
										return;
									}
								}
								// economic-activity-type change loads filtered activities
								if (field.k === 'ecoType') {
									set(st.id, 'ecoAct', '');
									if (value) {
										dispatch(
											economicActivityListStart({
												companyID,
												databaseName,
												EconomicActivityTypeID: value,
												memberID,
											}),
										);
									}
								}
								// auto-age from DOB
								if (field.age && value) {
									set(st.id, field.age, ageFromDOB(value));
								}
							}}
						/>
					);
				})}
				{st.id === 'extra' ? (
					<div
						style={{
							gridColumn: 'span 3',
							display: 'flex',
							flexWrap: 'wrap',
							gap: 16,
							alignItems: 'flex-end',
							marginTop: 8,
							paddingTop: 12,
							borderTop: `1px solid ${LMS.line}`,
						}}>
						{f.isDisability ? (
							<div style={{ flex: '1 1 220px', minWidth: 220, maxWidth: 360 }}>
								<MOField
									key='disability'
									f={
										st.fields!.find((x) => x.k === 'disability') || {
											k: 'disability',
											label: 'Enter Disability',
											type: 'text',
											inputFilter: 'name',
											placeholder: 'Enter Disability',
											mand: 'Disability',
										}
									}
									val={f.disability ?? ''}
									required={isFieldRequired(
										st,
										st.fields!.find((x) => x.k === 'disability') || {},
									)}
									optRefs={optRefs}
									set={(v) => set(st.id, 'disability', v)}
								/>
							</div>
						) : null}
						<div style={{ flex: '0 0 auto', minWidth: 160 }}>
							<MOField
								key='isDisability'
								f={
									st.fields!.find((x) => x.k === 'isDisability') || {
										k: 'isDisability',
										label: 'Disability',
										type: 'toggle',
										mand: 'Disability',
									}
								}
								val={!!f.isDisability}
								required={isFieldRequired(
									st,
									st.fields!.find((x) => x.k === 'isDisability') || {},
								)}
								optRefs={optRefs}
								set={(v) => {
									set(st.id, 'isDisability', v);
									if (!v) set(st.id, 'disability', '');
								}}
							/>
						</div>
					</div>
				) : null}
			</div>
		);
	};

	const renderVerify = () => {
		const f = stageForm('verify');
		return (
			<div style={{ maxWidth: 520 }}>
				<div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
					<div style={{ flex: 1 }}>
						<span style={labelStyle}>
							Mobile Number<span style={{ color: LMS.bad, marginLeft: 3 }}>*</span>
						</span>
						<input
							type='tel'
							value={f.phone || ''}
							disabled={isVerified}
							onChange={(e) =>
								set(
									'verify',
									'phone',
									e.target.value.replace(/[^0-9]/g, '').slice(0, 10),
								)
							}
							placeholder='10-digit mobile'
							style={inputStyle}
						/>
					</div>
					{!isVerified && (
						<Btn
							variant='secondary'
							disabled={!f.phone}
							loading={otpSending}
							onClick={sendOtp}>
							{otpSent ? 'Resend OTP' : 'Send OTP'}
						</Btn>
					)}
				</div>
				{otpSent && !isVerified && (
					<div
						style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: 16 }}>
						<div style={{ flex: 1 }}>
							<span style={labelStyle}>Enter OTP</span>
							<input
								value={f.otp || ''}
								onChange={(e) =>
									set(
										'verify',
										'otp',
										e.target.value.replace(/[^0-9]/g, '').slice(0, 6),
									)
								}
								placeholder='6-digit code'
								style={inputStyle}
							/>
						</div>
						<Btn
							variant='primary'
							icon='Check'
							disabled={(f.otp || '').length < 6}
							onClick={verifyOtp}>
							Verify OTP
						</Btn>
					</div>
				)}
				{isVerified && (
					<div
						style={{
							marginTop: 16,
							padding: 12,
							borderRadius: 10,
							background: '#EAF3EE',
							border: '1px solid #9CC7B4',
							display: 'flex',
							alignItems: 'center',
							gap: 8,
						}}>
						<Icon icon='Check' size='sm' />
						<span style={{ color: LMS.good, fontWeight: 600, fontSize: 13 }}>
							Mobile verified · {f.phone} · MemberID {String(memberID) || '—'}
						</span>
					</div>
				)}
			</div>
		);
	};

	const renderLoanType = () => {
		const f = stageForm('loan');
		const types = [
			'MFI Loan',
			'Individual Loan',
			'Gold Loan',
			'Savings Account',
			'Fixed Deposit Account',
			'Recurring Deposit Account',
		];
		return (
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
				{types.map((t) => {
					const on = f.product === t;
					return (
						<button
							key={t}
							type='button'
							onClick={() => selectLoanType(t)}
							style={{
								height: 54,
								borderRadius: 12,
								fontSize: 13,
								fontWeight: 700,
								cursor: 'pointer',
								border: `2px solid ${on ? LMS.moss : 'transparent'}`,
								background: on ? LMS.moss : LMS.sand,
								color: on ? '#fff' : LMS.ink2,
							}}>
							{t}
						</button>
					);
				})}
			</div>
		);
	};

	const renderFamily = () => {
		const f = stageForm('family');
		const rows: any[] = f.members || [];
		const draftSelect = (k: string, label: string, options: string[]) => (
			<div>
				<span style={labelStyle}>{label}</span>
				<select
					value={famDraft[k] || ''}
					onChange={(e) => setFamDraft((d) => ({ ...d, [k]: e.target.value }))}
					style={{ ...inputStyle, height: 38 }}>
					<option value=''>Select {label}</option>
					{options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
			</div>
		);
		const draftField = (k: string, label: string, type = 'text') => (
			<div>
				<span style={labelStyle}>{label}</span>
				<input
					value={famDraft[k] || ''}
					onChange={(e) =>
						setFamDraft((d) => ({
							...d,
							[k]:
								type === 'number'
									? numericChars(e.target.value, false)
									: k === 'name'
										? nameChars(e.target.value)
										: e.target.value,
						}))
					}
					onKeyDown={
						type === 'number'
							? blockNonDigitKeyDown
							: k === 'name'
								? blockNonNameKeyDown
								: undefined
					}
					onPaste={
						type === 'number'
							? (e) => blockInvalidNumericPaste(e, false)
							: k === 'name'
								? (e) =>
										setFamDraft((d) => ({
											...d,
											name: mergeNamePaste(e, String(d.name ?? '')),
										}))
								: undefined
					}
					placeholder={label}
					type={type === 'number' ? 'tel' : type}
					inputMode={type === 'number' ? 'numeric' : undefined}
					style={{ ...inputStyle, height: 38 }}
				/>
			</div>
		);
		return (
			<div>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: 12,
						marginBottom: 16,
					}}>
					<MOField
						f={{
							label: 'Family Type',
							type: 'select',
							opts: ['Nuclear', 'Joint', 'Extended'],
						}}
						val={f.familyType}
						required={false}
						optRefs={optRefs}
						set={(v) => set('family', 'familyType', v)}
					/>
					<MOField
						f={{
							label: 'Rural / Urban',
							type: 'select',
							opts: ['Rural', 'Urban', 'Semi-urban'],
						}}
						val={f.area}
						required={false}
						optRefs={optRefs}
						set={(v) => set('family', 'area', v)}
					/>
					<MOField
						f={{ label: 'Family Total Income', type: 'num' }}
						val={f.famIncome}
						required={false}
						optRefs={optRefs}
						set={(v) => set('family', 'famIncome', v)}
					/>
					<MOField
						f={{ label: 'Monthly Expenses', type: 'num' }}
						val={f.famExpenses}
						required={false}
						optRefs={optRefs}
						set={(v) => set('family', 'famExpenses', v)}
					/>
					<MOField
						f={{ label: 'Monthly Extra Spent', type: 'num' }}
						val={f.famExtra}
						required={false}
						optRefs={optRefs}
						set={(v) => set('family', 'famExtra', v)}
					/>
				</div>
				<div
					style={{
						borderRadius: 12,
						border: `1px solid ${LMS.line}`,
						background: LMS.sand,
						padding: 16,
					}}>
					<div
						style={{
							fontSize: 11,
							textTransform: 'uppercase',
							letterSpacing: '.06em',
							fontWeight: 700,
							color: LMS.inkMuted,
							marginBottom: 12,
						}}>
						Add family member
					</div>
					<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
						{draftField('name', 'Name')}
						{draftSelect('rel', 'Relationship', FAMILY_RELATIONS)}
						{draftField('age', 'Age', 'number')}
						{draftSelect('gender', 'Gender', FAMILY_GENDERS)}
						{draftField('education', 'Education')}
						{draftField('occupation', 'Occupation')}
					</div>
					<div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
						<Btn variant='soft' small icon='Add' onClick={saveFamilyMember}>
							{editingFamilyId ? 'Update family member' : 'Add to family'}
						</Btn>
						{editingFamilyId ? (
							<Btn variant='ghost' small onClick={cancelFamilyEdit}>
								Cancel
							</Btn>
						) : null}
					</div>
				</div>
				{rows.length > 0 ? (
					<div
						style={{
							marginTop: 16,
							border: `1px solid ${LMS.line}`,
							borderRadius: 12,
							overflow: 'hidden',
						}}>
						<table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
							<thead>
								<tr style={{ background: LMS.sand, color: LMS.inkMuted }}>
									<th
										style={{
											textAlign: 'left',
											padding: '8px 12px',
											fontSize: 10,
										}}>
										Name
									</th>
									<th
										style={{
											textAlign: 'left',
											padding: '8px 12px',
											fontSize: 10,
										}}>
										Relationship
									</th>
									<th
										style={{
											textAlign: 'left',
											padding: '8px 12px',
											fontSize: 10,
										}}>
										Age
									</th>
									<th
										style={{
											textAlign: 'left',
											padding: '8px 12px',
											fontSize: 10,
										}}>
										Gender
									</th>
									<th
										style={{
											textAlign: 'left',
											padding: '8px 12px',
											fontSize: 10,
										}}>
										Occupation
									</th>
									<th style={{ padding: '8px 12px' }} />
								</tr>
							</thead>
							<tbody>
								{rows.map((r) => (
									<tr key={r.id} style={{ borderTop: `1px solid ${LMS.line}` }}>
										<td style={{ padding: '8px 12px', fontWeight: 600 }}>
											{r.name}
										</td>
										<td style={{ padding: '8px 12px' }}>{r.rel || '—'}</td>
										<td style={{ padding: '8px 12px', fontFamily: MONO }}>
											{r.age || '—'}
										</td>
										<td style={{ padding: '8px 12px' }}>{r.gender || '—'}</td>
										<td style={{ padding: '8px 12px' }}>
											{r.occupation || '—'}
										</td>
										<td style={{ padding: '8px 12px', textAlign: 'right' }}>
											<button
												type='button'
												onClick={() => editFamilyMember(r)}
												style={{
													border: 'none',
													background: 'transparent',
													color: LMS.moss,
													cursor: 'pointer',
													marginRight: 8,
												}}>
												<Icon icon='Edit' size='sm' />
											</button>
											<button
												type='button'
												onClick={() => {
													if (editingFamilyId === r.id) cancelFamilyEdit();
													set(
														'family',
														'members',
														rows.filter((x) => x.id !== r.id),
													);
												}}
												style={{
													border: 'none',
													background: 'transparent',
													color: LMS.bad,
													cursor: 'pointer',
												}}>
												<Icon icon='Delete' size='sm' />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div style={{ marginTop: 16, fontSize: 12, color: LMS.inkMuted }}>
						No family members added yet.
					</div>
				)}
			</div>
		);
	};

	const renderHouse = () => {
		const f = stageForm('house');
		const toggleRow = (k: string, label: string) => (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: 12,
					borderRadius: 10,
					background: LMS.sand,
					border: `1px solid ${LMS.line}`,
				}}>
				<span style={{ fontSize: 13, fontWeight: 600, color: LMS.ink2 }}>{label}</span>
				<Toggle
					on={!!f[k]}
					onChange={(v) => set('house', k, v)}
					label={f[k] ? 'Yes' : 'No'}
				/>
			</div>
		);
		const chipRow = (k: string, options: string[]) => {
			const value: string[] = f[k] || [];
			return (
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
					{options.map((o) => {
						const on = value.includes(o);
						return (
							<button
								key={o}
								type='button'
								onClick={() =>
									set(
										'house',
										k,
										on ? value.filter((x) => x !== o) : [...value, o],
									)
								}
								style={{
									height: 36,
									padding: '0 14px',
									borderRadius: 10,
									fontSize: 13,
									fontWeight: 600,
									cursor: 'pointer',
									border: `1px solid ${on ? LMS.moss : LMS.line}`,
									background: on ? LMS.moss : '#fff',
									color: on ? '#fff' : LMS.ink2,
								}}>
								{o}
							</button>
						);
					})}
				</div>
			);
		};
		return (
			<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
					<MOField
						f={{
							label: 'House Type',
							type: 'select',
							opts: ['Own', 'Rented', 'Lease', 'Family-owned'],
						}}
						val={f.houseType}
						required={false}
						optRefs={optRefs}
						set={(v) => set('house', 'houseType', v)}
					/>
					<MOField
						f={{ label: 'Duration of Stay (Years)', type: 'num' }}
						val={f.stayYears}
						required={false}
						optRefs={optRefs}
						set={(v) => set('house', 'stayYears', v)}
					/>
					<MOField
						f={{ label: 'No. of Rooms', type: 'num' }}
						val={f.rooms}
						required={false}
						optRefs={optRefs}
						set={(v) => set('house', 'rooms', v)}
					/>
				</div>
				<div>
					<span style={labelStyle}>Facility Type</span>
					{chipRow('facilities', [
						'Water',
						'Mixie',
						'Grinder',
						'Vehicle',
						'Refrigerator',
						'Mobile',
					])}
				</div>
				<div>
					<span style={labelStyle}>Asset Owned</span>
					{chipRow('assets', ASSET_TYPE_OPTIONS)}
				</div>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(2, 1fr)',
						gap: 12,
					}}>
					{toggleRow('hasAgri', 'Having Agri Land')}
					{toggleRow('hasLivestock', 'Having Livestock')}
				</div>
				{f.hasAgri && (
					<div
						style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
						<MOField
							f={{ label: 'Agri Land Value', type: 'num' }}
							val={f.agriValue}
							required={false}
							optRefs={optRefs}
							set={(v) => set('house', 'agriValue', v)}
						/>
						<MOField
							f={{ label: 'Agri Land Size', type: 'text', inputFilter: 'numeric' }}
							val={f.agriSize}
							required={false}
							optRefs={optRefs}
							set={(v) => set('house', 'agriSize', v)}
						/>
					</div>
				)}
				{f.hasLivestock && (
					<div style={{ maxWidth: 360 }}>
						<MOField
							f={{ label: 'Income From LiveStock', type: 'num' }}
							val={f.livestockIncome}
							required={false}
							optRefs={optRefs}
							set={(v) => set('house', 'livestockIncome', v)}
						/>
					</div>
				)}
			</div>
		);
	};

	const renderDocs = (st: MOStage) => {
		const f = stageForm(st.id);
		const personal = stageForm('personal');
		const docBeforeUpload = (key: string) => () => {
			if (key !== 'idFront' && key !== 'idBack' && key !== 'addrFront' && key !== 'addrBack') {
				return true;
			}
			if (
				(key === 'idFront' || key === 'idBack') &&
				(!personal.idProof || !String(personal.idProofNo || '').trim())
			) {
				setPersonalDetailsPrompt(true);
				return false;
			}
			if (
				(key === 'addrFront' || key === 'addrBack') &&
				(!personal.addrProof || !String(personal.addrProofNo || '').trim())
			) {
				setPersonalDetailsPrompt(true);
				return false;
			}
			return true;
		};
		return (
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
				{(st.docs || []).map((d) => (
					<MOUpload
						key={d.k}
						label={d.label}
						value={f[d.k]}
						onUpload={(path) => set(st.id, d.k, path)}
						uploadFile={(file) => handleMemberImageUpload(file, d.k, d.label)}
						beforeUpload={docBeforeUpload(d.k)}
						detail={d.detail}
						detailValue={f[`${d.k}_d`]}
						onDetail={(v) => set(st.id, `${d.k}_d`, v)}
					/>
				))}
			</div>
		);
	};

	const renderBody = (st: MOStage) => {
		if (st.kind === 'verify') return renderVerify();
		if (st.kind === 'loantype') return renderLoanType();
		if (st.kind === 'family') return renderFamily();
		if (st.kind === 'house') return renderHouse();
		if (st.kind === 'docs') return renderDocs(st);
		return renderFields(st);
	};

	// =========================================================================
	// Overlay shell
	// =========================================================================
	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				zIndex: 2000,
				background: LMS.sand,
				display: 'flex',
				flexDirection: 'column',
			}}>
			{/* top bar */}
			<div
				style={{
					height: 64,
					flexShrink: 0,
					borderBottom: `1px solid ${LMS.line}`,
					background: '#fff',
					display: 'flex',
					alignItems: 'center',
					gap: 20,
					padding: '0 24px',
				}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<div
						style={{
							width: 36,
							height: 36,
							borderRadius: 10,
							background: LMS.moss,
							color: '#fff',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}>
						<Icon icon='Person' size='lg' />
					</div>
					<div>
						<div
							style={{
								fontFamily: DISPLAY,
								fontSize: 18,
								fontWeight: 600,
								lineHeight: 1,
							}}>
							{isEditMode ? 'Edit Member' : 'New Member'}
						</div>
						<div style={{ fontSize: 11, color: LMS.inkMuted, marginTop: 2 }}>
							{isEditMode
								? `Update member profile · ${MO_STAGES.length} stages`
								: `One-shot onboarding · ${MO_STAGES.length} stages`}
							{isEditMode && showLoanExists ? ' · Active loan exists' : ''}
						</div>
					</div>
				</div>

				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						marginLeft: 8,
						flex: 1,
						maxWidth: 420,
					}}>
					<div
						style={{
							flex: 1,
							height: 8,
							background: LMS.line,
							borderRadius: 999,
							overflow: 'hidden',
						}}>
						<div
							style={{
								height: '100%',
								width: `${overallPct}%`,
								background: LMS.moss,
								borderRadius: 999,
								transition: 'width .4s ease',
							}}
						/>
					</div>
					<div
						style={{
							fontSize: 12,
							fontWeight: 700,
							fontFamily: MONO,
							color: LMS.ink2,
							width: 40,
						}}>
						{overallPct}%
					</div>
				</div>

				<div
					style={{
						marginLeft: 'auto',
						display: 'flex',
						alignItems: 'center',
						gap: 8,
						fontSize: 12,
						whiteSpace: 'nowrap',
						color: LMS.inkMuted,
					}}>
					{anySaving ? (
						<span>Saving…</span>
					) : lastSavedAt ? (
						<>
							<Icon icon='Check' size='sm' />
							<span>All changes saved · {lastSavedAt}</span>
						</>
					) : (
						<span>Autosaves each stage</span>
					)}
				</div>

				<button
					type='button'
					onClick={() => setMandOnly((v) => !v)}
					style={{
						height: 36,
						padding: '0 12px',
						borderRadius: 10,
						fontSize: 12,
						fontWeight: 700,
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						gap: 8,
						whiteSpace: 'nowrap',
						border: `1px solid ${mandOnly ? LMS.moss : LMS.line}`,
						background: mandOnly ? LMS.moss : '#fff',
						color: mandOnly ? '#fff' : LMS.ink2,
					}}>
					<Icon icon={mandOnly ? 'Check' : 'FilterAlt'} size='sm' /> Mandatory only
				</button>
				<button
					type='button'
					onClick={onClose}
					style={{
						width: 36,
						height: 36,
						borderRadius: 10,
						border: 'none',
						background: 'transparent',
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: LMS.ink2,
					}}>
					<Icon icon='Close' size='lg' />
				</button>
			</div>

			<div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
				{/* rail */}
				<aside
					style={{
						width: 256,
						flexShrink: 0,
						borderRight: `1px solid ${LMS.line}`,
						background: '#fff',
						overflow: 'auto',
						padding: '12px 0',
					}}>
					{MO_STAGES.map((st) => {
						const rs = stageReqStatus(st);
						const complete = rs.need > 0 && rs.have >= rs.need;
						const sv = saved[st.id];
						return (
							<button
								key={st.id}
								type='button'
								onClick={() => goToStage(st.id)}
								style={{
									width: '100%',
									textAlign: 'left',
									padding: '10px 16px',
									display: 'flex',
									alignItems: 'center',
									gap: 12,
									cursor: 'pointer',
									borderLeft: `2px solid ${active === st.id ? LMS.moss : 'transparent'}`,
									borderTop: 'none',
									borderRight: 'none',
									borderBottom: 'none',
									background: active === st.id ? '#EEF4F1' : 'transparent',
								}}>
								<span
									style={{
										width: 28,
										height: 28,
										borderRadius: 8,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										flexShrink: 0,
										background: complete ? LMS.good : '#DCE8E3',
										color: complete ? '#fff' : LMS.moss,
									}}>
									<Icon icon={complete ? 'Check' : st.icon} size='sm' />
								</span>
								<span style={{ flex: 1, minWidth: 0 }}>
									<span
										style={{
											display: 'block',
											fontSize: 13,
											fontWeight: 600,
											color: active === st.id ? LMS.ink : LMS.ink2,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}>
										{st.name}
									</span>
									<span
										style={{
											display: 'block',
											fontSize: 10,
											color: LMS.inkMuted,
										}}>
										{st.optional && rs.need === 0
											? 'Optional'
											: `${rs.have}/${rs.need} required`}
										{sv?.status === 'saved' && ' · saved'}
									</span>
								</span>
							</button>
						);
					})}
				</aside>

				{/* content */}
				<div
					ref={scrollRef}
					style={{ flex: 1, overflow: 'auto', padding: '24px 40px 140px' }}>
					<div
						style={{
							maxWidth: 820,
							margin: '0 auto',
							display: 'flex',
							flexDirection: 'column',
							gap: 16,
						}}>
						{MO_STAGES.map((st, idx) => {
							const rs = stageReqStatus(st);
							const complete = rs.need > 0 && rs.have >= rs.need;
							const sv = saved[st.id];
							const collapsed =
								!!st.optional &&
								rs.need === 0 &&
								!expandOpt[st.id] &&
								mandOnly &&
								!st.showAllFields;
							return (
								<section
									key={st.id}
									ref={(el) => (sectionRefs.current[st.id] = el)}
									data-stage={st.id}
									style={{
										background: '#fff',
										border: `1px solid ${LMS.line}`,
										borderRadius: 16,
										scrollMarginTop: 16,
									}}>
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: 12,
											padding: '20px 24px 16px',
										}}>
										<span
											style={{
												width: 36,
												height: 36,
												borderRadius: 10,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												flexShrink: 0,
												background: complete ? LMS.good : '#DCE8E3',
												color: complete ? '#fff' : LMS.moss,
											}}>
											<Icon icon={complete ? 'Check' : st.icon} size='lg' />
										</span>
										<div style={{ flex: 1, minWidth: 0 }}>
											<div
												style={{
													fontSize: 10,
													fontFamily: MONO,
													color: LMS.inkMuted,
												}}>
												STAGE {String(idx + 1).padStart(2, '0')}
											</div>
											<div
												style={{
													fontFamily: DISPLAY,
													fontSize: 18,
													fontWeight: 600,
													lineHeight: 1.2,
												}}>
												{st.name}
											</div>
										</div>
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: 8,
												flexShrink: 0,
											}}>
											{st.optional && rs.need === 0 && (
												<Badge tone='neutral'>Optional</Badge>
											)}
											{rs.need > 0 && !complete && (
												<Badge tone='warn'>
													{rs.need - rs.have} required left
												</Badge>
											)}
											{sv?.status === 'saved' && (
												<Badge tone='good'>
													<Icon icon='Check' size='sm' /> Saved {sv.at}
												</Badge>
											)}
											{collapsed && (
												<Btn
													variant='ghost'
													small
													onClick={() =>
														setExpandOpt((e) => ({
															...e,
															[st.id]: true,
														}))
													}>
													Expand
												</Btn>
											)}
										</div>
									</div>
									{!collapsed && (
										<div style={{ padding: '0 24px 24px' }}>
											{st.blurb && (
												<div
													style={{
														fontSize: 13,
														color: LMS.inkMuted,
														marginBottom: 16,
														marginTop: -4,
													}}>
													{st.blurb}
												</div>
											)}
											{renderBody(st)}
											<div
												style={{
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'space-between',
													marginTop: 24,
													paddingTop: 16,
													borderTop: `1px solid ${LMS.line}`,
												}}>
												<div style={{ fontSize: 12, color: LMS.inkMuted }}>
													{rs.need > 0 ? (
														complete ? (
															<span
																style={{
																	color: LMS.good,
																	fontWeight: 600,
																	display: 'flex',
																	alignItems: 'center',
																	gap: 4,
																}}>
																<Icon icon='Check' size='sm' /> All
																required fields complete
															</span>
														) : (
															`Fill ${rs.need - rs.have} required field${
																rs.need - rs.have > 1 ? 's' : ''
															} to complete this stage`
														)
													) : (
														'No required fields — fill what applies'
													)}
												</div>
												{idx < MO_STAGES.length - 1 ? (
													<Btn
														variant='primary'
														small
														onClick={() => saveAndNext(st.id)}>
														Save &amp; continue{' '}
														<Icon icon='ExpandMore' size='sm' />
													</Btn>
												) : (
													<Btn
														variant='soft'
														small
														icon='Check'
														onClick={() => saveStage(st.id)}>
														Save this stage
													</Btn>
												)}
											</div>
										</div>
									)}
									{collapsed && (
										<div
											style={{
												padding: '0 24px 20px',
												marginTop: -4,
												fontSize: 12,
												color: LMS.inkMuted,
											}}>
											Hidden in mandatory-only mode. Expand to fill optional
											details.
										</div>
									)}
								</section>
							);
						})}
					</div>
				</div>
			</div>

			{/* sticky submit bar */}
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					left: 256,
					right: 0,
					height: 80,
					borderTop: `1px solid ${LMS.line}`,
					background: 'rgba(255,255,255,.96)',
					backdropFilter: 'blur(6px)',
					display: 'flex',
					alignItems: 'center',
					padding: '0 40px',
					gap: 16,
				}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<div
						style={{
							width: 40,
							height: 40,
							borderRadius: 10,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							background: mandRemaining === 0 ? LMS.good : '#FBEFD8',
							color: mandRemaining === 0 ? '#fff' : LMS.warn,
						}}>
						<Icon icon={mandRemaining === 0 ? 'Check' : 'WarningAmber'} size='lg' />
					</div>
					<div>
						<div style={{ fontSize: 13, fontWeight: 700, color: LMS.ink }}>
							{mandRemaining === 0
								? 'Ready to submit'
								: `${mandRemaining} mandatory field${mandRemaining > 1 ? 's' : ''} remaining`}
						</div>
						<div style={{ fontSize: 11, color: LMS.inkMuted }}>
							{totals.have}/{totals.need} required complete across {MO_STAGES.length}{' '}
							stages · optional fields can be skipped
						</div>
					</div>
				</div>
				<div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
					<Btn
						variant='primary'
						icon={submitting ? undefined : 'Check'}
						disabled={mandRemaining > 0 || submitting}
						onClick={submit}>
						{submitting
							? 'Saving…'
							: isEditMode
								? 'Save changes'
								: 'Submit application'}
					</Btn>
				</div>
			</div>

			{/* personal details required before ID/address proof upload */}
			{personalDetailsPrompt && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						zIndex: 2200,
						background: 'rgba(26,24,20,.45)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: 24,
					}}>
					<div
						style={{
							width: '100%',
							maxWidth: 460,
							background: '#fff',
							borderRadius: 16,
							padding: 24,
							boxShadow: '0 24px 48px -12px rgba(26,24,20,.35)',
						}}>
						<div style={{ fontSize: 18, fontWeight: 700, color: LMS.ink, marginBottom: 8 }}>
							Personal details required
						</div>
						<p style={{ fontSize: 14, color: LMS.ink2, lineHeight: 1.5, marginBottom: 20 }}>
							Please complete the ID Proof / Address Proof details in the Personal
							Details section before uploading the document.
						</p>
						<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
							<Btn variant='secondary' onClick={() => setPersonalDetailsPrompt(false)}>
								Cancel
							</Btn>
							<Btn
								variant='primary'
								onClick={() => {
									setPersonalDetailsPrompt(false);
									goToStage('personal');
								}}>
								Go to Personal Details
							</Btn>
						</div>
					</div>
				</div>
			)}

			{/* toast */}
			{toast && (
				<div
					style={{
						position: 'fixed',
						bottom: 96,
						left: '50%',
						transform: 'translateX(-50%)',
						zIndex: 2100,
						padding: '0 16px',
						height: 44,
						borderRadius: 12,
						boxShadow: '0 18px 40px -12px rgba(26,24,20,.3)',
						display: 'flex',
						alignItems: 'center',
						gap: 8,
						fontSize: 13,
						fontWeight: 600,
						color: '#fff',
						background: toast.kind === 'good' ? LMS.moss : LMS.warn,
					}}>
					<Icon icon={toast.kind === 'good' ? 'Check' : 'WarningAmber'} size='sm' />{' '}
					{toast.msg}
				</div>
			)}
		</div>
	);
};

export default MemberOnboard;
