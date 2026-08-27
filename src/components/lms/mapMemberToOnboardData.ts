/** Maps fetchExistsMemberDetails API shape into MemberOnboard stage `data` keys. */
import { accountNumberChars, monthlyFromAnnual } from '../../utils/memberValidators';
import { resolveMemberLoanType } from '../../redux/master/member/member.utils';
import { getImageUploadDateFromPath } from '../../redux/general/general.utils';

function resolveCoPhotoUploadedOn(photo?: string, stored?: string): string {
	const resolved = getImageUploadDateFromPath(photo, stored);
	return resolved === '-' ? '' : resolved;
}

export function mapMemberToOnboardData(m: Record<string, any>): Record<string, Record<string, any>> {
	if (!m) return {};

	const loanType = resolveMemberLoanType(m);
	const co =
		Array.isArray(m.CoapplicantArr) && m.CoapplicantArr.length > 0 ? m.CoapplicantArr[0] : null;
	const coPhoto = co?.CoapplicantPhotoImg || '';

	return {
		verify: {
			phone: m.MobileNumber || '',
			verified: true,
		},
		loan: {
			product: loanType,
		},
		basic: {
			name: m.MemberName || '',
			gender: m.MemberGender || '',
			aadhaar: m.AadharNumber || '',
			pan: m.MemberPanNumber || '',
			photo: m.MemberPhoto || m.memberPhoto || '',
			sign: m.MemberSignature || m.memberSignatureImgUrl || m.memberSignature || '',
		},
		personal: {
			dob: m.MemberDOB || '',
			age: m.MemberAge != null ? String(m.MemberAge) : '',
			marital: m.MaritialStatus || '',
			father: m.FatherName || '',
			mother: m.MotherName || '',
			spouse: m.SpouseName || '',
			spouseDob: m.SpouseDOB || '',
			altPhone: m.AlternatePhoneNumber || '',
			idProof: m.IDProof || '',
			idProofNo: m.IDProofNumber || '',
			addrProof: m.AddressProof || '',
			addrProofNo: m.AddressProofNumber || '',
			pincode: m.Pincode || '',
			door: m.DoorNo || '',
			street: m.AddressStreet || '',
			country: m.Country || 'India',
			state: m.State || '',
			postOffice: m.postOffice || '',
			district: m.District || '',
			localArea: m.Village || '',
			sameAddr: m.SameForCurrent === true || m.SameForCurrent === 1 || m.SameForCurrent === '1',
			cPincode: m.CurrentPincode || '',
			cDoor: m.CurrentDoorNo || '',
			cStreet: m.CurrentAddressStreet || '',
			cState: m.CurrentState || '',
			cDistrict: m.CurrentDistrict || '',
		},
		nominee: {
			nomName: m.NomineeName || '',
			nomPhone: m.NomineePhoneNumber || '',
			nomAadhaar: m.NomineeAadhar || '',
			nomDob: m.NomineeDOB || '',
			nomAge: m.NomineeAge != null ? String(m.NomineeAge) : '',
			nomRel: m.NomineeRelationship || '',
			nomGender: m.NomineeGender || '',
			nomFather: m.NomineeFather || '',
			nomIdProof: m.NomineeIDProof || '',
			nomIdNo: m.NomineeIDProofNumber || '',
			nomDoor: m.NomineeDoorNumber || '',
			nomStreet: m.NomineeStreet || '',
			nomPhoto: m.NomineePhotoImg || m.nomineeImgUrl || '',
			nomAadFront: m.NomineeAadharFrontImg || m.nomineeAadharCardImage || '',
			nomAadBack: m.NomineeAadharBackImg || m.nomineeAadharBackImage || '',
			nomIdFront: m.NomineeIDProofFrontImg || m.nomineeIDProofImage || '',
			nomIdBack: m.NomineeIDProofBackImg || m.nomineeIDProofBackImage || '',
		},
		bank: {
			acctNo: accountNumberChars(m.AccountNumber || ''),
			acctRe: accountNumberChars(m.AccountNumber || ''),
			acctName: m.AccountHolderName || '',
			ifsc: String(m.IFCSCode || m.IFSCCode || '')
				.toUpperCase()
				.replace(/[^A-Z0-9]/g, '')
				.slice(0, 11),
			bankName: m.BankName || '',
			branch: m.BankBranchName || '',
			acctType: m.MemberAccountType || m.AccountType || '',
		},
		official: {
			doj: m.DateOfJoining || '',
			ecoType: m.economicActivityTypeID != null ? String(m.economicActivityTypeID) : '',
			ecoAct: m.EconomicActivityID != null ? String(m.EconomicActivityID) : '',
			center: m.LocationID != null ? String(m.LocationID) : '',
			appAmount: m.ApplicationAmount != null ? String(m.ApplicationAmount) : '',
			annualIncome: m.AnnualIncome != null ? String(m.AnnualIncome) : '',
			monthlyIncome:
				m.AnnualIncome != null && String(m.AnnualIncome) !== ''
					? monthlyFromAnnual(m.AnnualIncome)
					: m.MonthlyIncome != null
						? String(m.MonthlyIncome)
						: '',
			otherIncome: m.OtherIncome != null ? String(m.OtherIncome) : '',
			language: m.PreferredLanguage || 'English',
			productType: m.ProductTypeID != null ? String(m.ProductTypeID) : '',
			appliedAmount: m.AppliedAmount != null ? String(m.AppliedAmount) : '',
		},
		family: {
			familyType: m.FamilyType || '',
			area: m.CityType || '',
			famIncome: m.FamilyMonthlyIncome != null ? String(m.FamilyMonthlyIncome) : '',
			famExpenses: m.FamilyMonthlyExpenses != null ? String(m.FamilyMonthlyExpenses) : '',
			famExtra: m.FamilyMonthlyExtraSpent != null ? String(m.FamilyMonthlyExtraSpent) : '',
			members: m.FamilyMembers || [],
		},
		house: {
			houseType: m.HouseType || '',
			stayYears: m.DurationOfStay != null ? String(m.DurationOfStay) : '',
			rooms: m.NoOfRooms != null ? String(m.NoOfRooms) : '',
			hasAgri: m.HavingAgriculturalLand === 1 || m.HavingAgriculturalLand === '1',
			agriValue: m.AgriculturalLandValue != null ? String(m.AgriculturalLandValue) : '',
			agriSize: m.LandSize != null ? String(m.LandSize) : '',
			hasLivestock: m.HavingLivestock === 1 || m.HavingLivestock === '1',
			livestockIncome:
				m.IncomeFromLiveStock != null ? String(m.IncomeFromLiveStock) : '',
			assets: m.AssetType ? String(m.AssetType).split(',').filter(Boolean) : [],
			facilities: m.FacilityType ? String(m.FacilityType).split(',').filter(Boolean) : [],
		},
		houseImages: {
			h1: m.HouseImg1 || m.houseImage1 || '',
			h2: m.HouseImg2 || m.houseImage2 || '',
			h3: m.HouseImg3 || m.houseImage3 || '',
			h4: m.HouseImg4 || m.houseImage4 || '',
			h5: m.HouseImg5 || m.houseImage5 || '',
		},
		memberDocs: {
			aadFront: m.MemberAadharFrontImg || m.aadharCardImage || '',
			aadBack: m.MemberAadharBackImg || m.aadharBackImage || '',
			idFront: m.MemberIDProofFrontImg || m.idProofImage || '',
			idBack: m.MemberIDProofBackImg || '',
			addrFront: m.MemberAddressProofFrontImg || m.addressProofImage || '',
			addrBack: m.MemberAddressProofBackImg || m.addressProofBackImage || '',
			panFront: m.MemberPanCardFrontImg || m.panCardFrontImage || '',
			passbook: m.MemberPassbookImg || m.passbookChequeImage || '',
		},
		extra: {
			blood: m.BloodGroup || '',
			isDisability:
				m.IsDisability === true ||
				m.IsDisability === 1 ||
				m.IsDisability === '1' ||
				m.Disablity === 1 ||
				m.Disablity === '1' ||
				(typeof m.Disability === 'string' &&
					m.Disability !== '' &&
					m.Disability !== '-' &&
					m.Disability !== 'undefined') ||
				(typeof m.disability === 'string' &&
					m.disability !== '' &&
					m.disability !== '-' &&
					m.disability !== 'undefined'),
			disability:
				typeof m.Disability === 'string' &&
				m.Disability !== '' &&
				m.Disability !== '-' &&
				m.Disability !== 'undefined' &&
				m.Disability !== '0' &&
				m.Disability !== '1'
					? m.Disability
					: typeof m.disability === 'string' &&
						  m.disability !== '' &&
						  m.disability !== '-' &&
						  m.disability !== 'undefined'
						? m.disability
						: '',
			identification: m.Identification || '',
			education: m.EducationQualification || '',
			religion: m.Religion || '',
			caste: m.Caste || '',
			email: m.EmailID || m.MailID || '',
			mobileType: m.MobileType || m.PhoneType || '',
		},
		business: {
			bizName: m.businessName || '',
			bizType: m.businessType || '',
			bizYears: m.noOfYearsOperation != null ? String(m.noOfYearsOperation) : '',
			bizCycle: m.businessData || 'Weekly',
			bizBill: m.weeklyBill != null ? String(m.weeklyBill) : '',
		},
		other: {
			msme: m.msmeNo || m.MSME || '',
			gst: m.gstNo || m.GST || '',
		},
		coapplicant: co
			? {
					coName: co.CoapplicantName || '',
					coPhone: co.CoapplicantPhone || '',
					coAadhaar: co.CoapplicantAadhar || '',
					coDob: co.CoapplicantDOB || '',
					coAge: co.CoapplicantDOB ? '' : '',
					coOccupation: co.CoapplicantOccupation || '',
					coIncome:
						co.CoapplicantMonthlyIncome != null
							? String(co.CoapplicantMonthlyIncome)
							: '',
					coRel: co.CoapplicantRelationshipWithMember || co.CoapplicantRelationship || '',
					coGender: co.CoapplicantGender || '',
					coMarital: co.CoApplicantMaritalStatus || co.CoapplicantMarital || '',
					coIdProof: co.CoapplicantIDProof || '',
					coIdNo: co.CoapplicantIDProofNumber || '',
					coAddrProof: co.CoapplicantAddressProof || '',
					coAddrProofNo: co.CoapplicantAddressProofNumber || '',
					coPincode: co.CoapplicantPincode || '',
					coDoor: co.CoapplicantDoorNo || '',
					coStreet: co.CoapplicantStreet || '',
					coCountry: co.CoapplicantCountry || 'India',
					coState: co.CoapplicantState || '',
					coPostOffice: co.CoApplicantPostOffice || '',
					coDistrict: co.CoapplicantDistrict || '',
					coAadFront: co.CoapplicantAadharFrontImg || '',
					coAadBack: co.CoapplicantAadharBackImg || '',
					coIdFront: co.CoapplicantIDProofFrontImg || '',
					coIdBack: co.CoapplicantIDProofBackImg || '',
					coAddrFront: co.CoapplicantAddressProofFrontImg || '',
					coAddrBack: co.CoapplicantAddressProofBackImg || '',
					coPhoto,
					coPhotoUploadedOn: resolveCoPhotoUploadedOn(
						coPhoto,
						co.CoapplicantPhotoUploadedOn,
					),
					coTogether: co.CoapplicantTogetherImg || '',
				}
			: {},
	};
}
