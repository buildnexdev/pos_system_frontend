import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getLoginObjDetails } from '../redux/login/login.selector';
import {
	buildScreenRightsMap,
	getScreenRights,
	FULL_SCREEN_RIGHTS,
	ScreenRights,
} from '../utils/menuAccess';

/**
 * Per-role, per-screen action rights for the CURRENT user.
 *
 * Pass the screen's menu identifier(s) — its menu label (customName/text from
 * menu.ts), and/or its route path or menu id. The first key that matches the
 * logged-in role's access data (tblMapMenu rights returned at login) wins.
 *
 *   const rights = useScreenRights('Collection Approve');
 *   <Button isDisable={!rights.isApprove} ... />
 *   {rights.isEdit && <EditButton ... />}
 *
 * A miss returns FULL_SCREEN_RIGHTS (all true) so screens/roles whose rights row
 * isn't present keep their current behaviour — i.e. this is additive and safe to
 * roll out screen-by-screen. SuperAdmin / Admin are treated as full-access.
 */
export const useScreenRights = (...keys: Array<string | number | undefined>): ScreenRights => {
	const loginData: any = useSelector(getLoginObjDetails);

	const isSuperUser = useMemo(() => {
		const type = String(loginData?.userType ?? '').toLowerCase();
		const level = String(loginData?.userLevel ?? '').toLowerCase();
		return type === 'superadmin' || type === 'admin' || level === 'level100';
	}, [loginData?.userType, loginData?.userLevel]);

	const rightsMap = useMemo(
		() => buildScreenRightsMap(loginData?.userAccessData),
		[loginData?.userAccessData],
	);

	return useMemo(() => {
		if (isSuperUser) {
			return FULL_SCREEN_RIGHTS;
		}
		return getScreenRights(rightsMap, ...keys);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rightsMap, isSuperUser, ...keys]);
};

export default useScreenRights;
