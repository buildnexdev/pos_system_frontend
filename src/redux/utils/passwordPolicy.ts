export type PasswordPolicyContext = {
	userType?: string;
	userLevel?: string;
	staffUserLevel?: string;
};

const normalizeCtx = (
	userTypeOrCtx?: string | PasswordPolicyContext,
	userLevel?: string,
): PasswordPolicyContext => {
	if (typeof userTypeOrCtx === 'object' && userTypeOrCtx !== null) {
		return userTypeOrCtx;
	}
	return { userType: userTypeOrCtx, userLevel };
};

/** Company Admin only — subject to 30-day password expiry (UI, reminders, forced change). */
export const isPasswordExpiryApplicable = (
	userTypeOrCtx?: string | PasswordPolicyContext,
	userLevel?: string,
): boolean => {
	const { userType, userLevel: level, staffUserLevel } = normalizeCtx(userTypeOrCtx, userLevel);
	const type = (userType ?? '').trim();
	const effectiveLevel = level ?? staffUserLevel ?? '';
	return type === 'Admin' || effectiveLevel === 'level100';
};

/** All other roles (staff levels, SubAdmin, SuperAdmin, etc.) skip password expiry. */
export const isPasswordPolicyExempt = (
	userTypeOrCtx?: string | PasswordPolicyContext,
	userLevel?: string,
): boolean => !isPasswordExpiryApplicable(userTypeOrCtx, userLevel);

/** Read password-age fields from profile/user API (supports camelCase and PascalCase). */
export const getPasswordExpiryDaysFromProfile = (profile?: Record<string, unknown>): number => {
	if (!profile) {
		return 0;
	}
	const days =
		profile.isPasswordExpiredDays ??
		profile.IsPasswordExpiredDays ??
		profile.isPasswordExpireddays;
	return Number(days ?? 0);
};

export const isProfilePasswordExpired = (profile?: Record<string, unknown>): boolean => {
	const days = getPasswordExpiryDaysFromProfile(profile);
	const flag = profile?.isPasswordExpired ?? profile?.IsPasswordExpired;
	return flag === 1 || flag === '1' || days > 29;
};
