type Primitive = string | number | boolean | null | undefined;

export type MenuAccessMap = Record<string, boolean>;

const normalizeKey = (value: Primitive): string | undefined => {
	if (value === undefined || value === null) {
		return undefined;
	}
	const str = String(value).trim();
	if (!str) {
		return undefined;
	}
	return str.toLowerCase();
};

const toBoolean = (value: Primitive): boolean | undefined => {
	if (typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'number') {
		return value === 1;
	}
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (!normalized) {
			return undefined;
		}
		if (['1', 'true', 'y', 'yes'].includes(normalized)) {
			return true;
		}
		if (['0', 'false', 'n', 'no'].includes(normalized)) {
			return false;
		}
	}
	return undefined;
};

const parseAccessArray = (raw: unknown): any[] => {
	if (!raw) {
		return [];
	}
	if (Array.isArray(raw)) {
		return raw;
	}
	if (typeof raw === 'object') {
		return Object.values(raw as Record<string, unknown>).filter(Boolean);
	}
	if (typeof raw === 'string') {
		try {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) {
				return parsed;
			}
			if (parsed && typeof parsed === 'object') {
				return Object.values(parsed as Record<string, unknown>).filter(Boolean);
			}
		} catch {
			return [];
		}
	}
	return [];
};

const coalesceValue = (...values: Primitive[]): Primitive | undefined => {
	for (const value of values) {
		if (value !== undefined && value !== null) {
			return value;
		}
	}
	return undefined;
};

const normalizeAccessEntry = (entry: any): any => {
	if (!entry || typeof entry !== 'object') {
		return entry;
	}

	const normalized: any = { ...entry };

	normalized.Isshow = coalesceValue(
		entry?.Isshow,
		entry?.isshow,
		entry?.isShow,
		entry?.IsShow,
		entry?.isShowHide,
		entry?.IsShowhide,
		entry?.isShowhide,
		entry?.hasAccess,
		entry?.isView,
		entry?.IsView,
	);

	normalized.Isadd = coalesceValue(
		entry?.Isadd,
		entry?.isAdd,
		entry?.isadd,
		entry?.IsAdd,
		entry?.hasAdd,
	);

	normalized.Isapprove = coalesceValue(
		entry?.Isapprove,
		entry?.isApprove,
		entry?.isapprove,
		entry?.IsApprove,
		entry?.hasApprove,
	);

	normalized.Isdelete = coalesceValue(
		entry?.Isdelete,
		entry?.isDelete,
		entry?.isdelete,
		entry?.IsDelete,
		entry?.hasDelete,
	);

	normalized.Isedit = coalesceValue(
		entry?.Isedit,
		entry?.isEdit,
		entry?.isedit,
		entry?.IsEdit,
		entry?.hasEdit,
	);

	normalized.MapmenuID = coalesceValue(
		entry?.MapmenuID,
		entry?.MapMenuID,
		entry?.mapMenuID,
		entry?.mapMenuId,
		entry?.mapmenuid,
	);

	normalized.MenuID = coalesceValue(
		entry?.MenuID,
		entry?.MenuId,
		entry?.menuId,
		entry?.menuid,
		entry?.id,
		entry?.Id,
	);

	normalized.subMenuId = coalesceValue(
		entry?.subMenuId,
		entry?.SubMenuId,
		entry?.subMenuID,
		entry?.submenuId,
		entry?.submenuID,
		entry?.SubmenuId,
		entry?.SubmenuID,
	);

	normalized.subMenuName = coalesceValue(
		entry?.subMenuName,
		entry?.submenuName,
		entry?.SubMenuName,
		entry?.SubmenuName,
		entry?.CustomName,
		entry?.customName,
		entry?.menucustomName,
	);

	normalized.MenuName = coalesceValue(
		entry?.MenuName,
		entry?.menuName,
		entry?.Menu,
		entry?.text,
		normalized.subMenuName,
	);

	normalized.path = coalesceValue(entry?.path, entry?.Path);
	normalized.id = coalesceValue(entry?.id, entry?.Id, normalized.MenuID);
	normalized.accessId = coalesceValue(entry?.accessId, entry?.accessID);

	return normalized;
};

const nonEnumerableFlag = '__isMenuAccessMap__';

const createAccessMap = (): MenuAccessMap & { [nonEnumerableFlag]: true } => {
	const map: MenuAccessMap & { [nonEnumerableFlag]: true } = Object.create(null);
	Object.defineProperty(map, nonEnumerableFlag, {
		value: true,
		enumerable: false,
		configurable: false,
		writable: false,
	});
	return map;
};

const isAccessMap = (value: unknown): value is MenuAccessMap & { [nonEnumerableFlag]: true } =>
	Boolean(value && typeof value === 'object' && (value as any)?.[nonEnumerableFlag]);

export const buildMenuAccessMap = (
	rawAccessData: unknown,
): MenuAccessMap & { [nonEnumerableFlag]: true } => {
	const accessList = parseAccessArray(rawAccessData);
	const map = createAccessMap();

	const ingestAccessEntry = (entry: any): void => {
		if (!entry || typeof entry !== 'object') {
			return;
		}

		const normalizedEntry = normalizeAccessEntry(entry);

		const value =
			toBoolean(normalizedEntry?.Isshow) ??
			toBoolean(normalizedEntry?.hasAccess) ??
			toBoolean(normalizedEntry?.isView);

		if (typeof value !== 'undefined') {
			const candidates = [
				normalizedEntry?.MapmenuID,
				normalizedEntry?.MenuID,
				normalizedEntry?.subMenuId,
				normalizedEntry?.MenuName,
				normalizedEntry?.subMenuName,
				normalizedEntry?.path,
				normalizedEntry?.id,
				normalizedEntry?.accessId,
			]
				.map((candidate) => normalizeKey(candidate))
				.filter(Boolean) as string[];

			candidates.forEach((candidate) => {
				if (!(candidate in map)) {
					map[candidate] = value;
				}
			});
		}

		const nestedCollections = [
			entry?.submenu,
			entry?.subMenu,
			entry?.SubMenu,
			entry?.children,
			entry?.child,
		];

		nestedCollections.forEach((collection) => {
			parseAccessArray(collection).forEach(ingestAccessEntry);
		});
	};

	accessList.forEach(ingestAccessEntry);

	return map;
};

// -----------------------------------------------------------------------------
// PER-SCREEN ACTION RIGHTS (add / edit / delete / approve), keyed the same way
// as buildMenuAccessMap. This lets a screen disable its Add / Edit / Delete /
// Approve controls based on the logged-in role's tblMapMenu rights (e.g. the
// level-6 Audit role gets Isapprove=Isedit=0, so those buttons are disabled).
// Visibility (Isshow) stays handled by buildMenuAccessMap; this is about the
// in-screen action buttons. Lookup miss => FULL_SCREEN_RIGHTS (no regression for
// screens/roles whose rights row isn't present in the dataset).
// -----------------------------------------------------------------------------

export type ScreenRights = {
	isShow: boolean;
	isAdd: boolean;
	isEdit: boolean;
	isDelete: boolean;
	isApprove: boolean;
};

export const FULL_SCREEN_RIGHTS: ScreenRights = {
	isShow: true,
	isAdd: true,
	isEdit: true,
	isDelete: true,
	isApprove: true,
};

export type ScreenRightsMap = Record<string, ScreenRights>;

export const buildScreenRightsMap = (rawAccessData: unknown): ScreenRightsMap => {
	const accessList = parseAccessArray(rawAccessData);
	const map: ScreenRightsMap = Object.create(null);

	const ingest = (entry: any): void => {
		if (!entry || typeof entry !== 'object') {
			return;
		}
		const n = normalizeAccessEntry(entry);

		// Only index entries that actually carry rights flags (a real submenu row),
		// so decorative/parent nodes don't shadow a real rights row.
		const hasAnyFlag = [n?.Isshow, n?.Isadd, n?.Isedit, n?.Isdelete, n?.Isapprove].some(
			(v) => toBoolean(v) !== undefined,
		);

		if (hasAnyFlag) {
			const rights: ScreenRights = {
				isShow: toBoolean(n?.Isshow) ?? true,
				isAdd: toBoolean(n?.Isadd) ?? false,
				isEdit: toBoolean(n?.Isedit) ?? false,
				isDelete: toBoolean(n?.Isdelete) ?? false,
				isApprove: toBoolean(n?.Isapprove) ?? false,
			};
			const candidates = [
				n?.MapmenuID,
				n?.MenuID,
				n?.subMenuId,
				n?.MenuName,
				n?.subMenuName,
				n?.path,
				n?.id,
				n?.accessId,
			]
				.map((candidate) => normalizeKey(candidate))
				.filter(Boolean) as string[];
			candidates.forEach((candidate) => {
				if (!(candidate in map)) {
					map[candidate] = rights;
				}
			});
		}

		[entry?.submenu, entry?.subMenu, entry?.SubMenu, entry?.children, entry?.child].forEach(
			(collection) => parseAccessArray(collection).forEach(ingest),
		);
	};

	accessList.forEach(ingest);
	return map;
};

/**
 * Resolve a screen's action rights from a prebuilt map. Accepts one or more
 * candidate keys (menu name, path, menu id) and returns the first match; a miss
 * returns FULL_SCREEN_RIGHTS so unmapped screens keep working (default-allow).
 */
export const getScreenRights = (map: ScreenRightsMap, ...keys: Primitive[]): ScreenRights => {
	for (const key of keys) {
		const k = normalizeKey(key);
		if (k && k in map) {
			return map[k];
		}
	}
	return FULL_SCREEN_RIGHTS;
};

export const cloneMenuDefinition = <T>(menu: T): T => JSON.parse(JSON.stringify(menu));

const getEntryCandidateKeys = (entry: any): string[] => {
	return [
		entry?.accessId,
		entry?.id,
		entry?.path,
		entry?.text,
		entry?.icon,
		entry?.subMenuId,
		entry?.subMenuName,
		entry?.menuId,
		entry?.menuName,
		entry?.MenuID,
		entry?.MenuName,
		entry?.submenuId,
		entry?.submenuName,
	]
		.map((candidate) => normalizeKey(candidate))
		.filter(Boolean) as string[];
};

const processMenuGroup = (
	group: Record<string, any>,
	accessMap: MenuAccessMap,
	hasAccessDataset: boolean,
): Record<string, any> => {
	const orderedEntries = Object.keys(group).map((key) => ({
		key,
		value: processMenuEntry(group[key], accessMap, hasAccessDataset),
	}));

	const result: Record<string, any> = {};
	orderedEntries.forEach((entry, index) => {
		if (!entry.value) {
			return;
		}

		const isDecorative =
			!entry.value.path &&
			(!entry.value.subMenu || Object.keys(entry.value.subMenu).length === 0);

		if (isDecorative) {
			const hasVisibleAfter = orderedEntries
				.slice(index + 1)
				.some(
					(next) =>
						next.value &&
						(next.value.path ||
							(next.value.subMenu && Object.keys(next.value.subMenu).length > 0)),
				);
			if (!hasVisibleAfter) {
				return;
			}
		}

		result[entry.key] = entry.value;
	});

	return result;
};

const processMenuEntry = (entry: any, accessMap: MenuAccessMap, hasAccessDataset: boolean): any => {
	if (!entry) {
		return null;
	}

	const clone: any = { ...entry };
	const hasChildren = clone.subMenu && Object.keys(clone.subMenu).length > 0;

	if (clone.hide || clone.isView === false) {
		return null;
	}

	const hadSubMenu = !!clone.subMenu;
	if (clone.subMenu) {
		clone.subMenu = processMenuGroup(clone.subMenu, accessMap, hasAccessDataset);
		if (Object.keys(clone.subMenu).length === 0) {
			if (hadSubMenu) {
				return null;
			}
			delete clone.subMenu;
		}
	}

	const candidates = getEntryCandidateKeys(clone);
	const matchingKey = candidates.find((candidate) =>
		Object.prototype.hasOwnProperty.call(accessMap, candidate),
	);

	if (matchingKey) {
		const hasAccess = accessMap[matchingKey];
		if (!hasAccess) {
			return null;
		}
	} else if (hasAccessDataset && !hasChildren && clone.path) {
		return null;
	}

	// Final check: if subMenu exists but is empty and item has no path, hide it
	if (clone.subMenu && Object.keys(clone.subMenu).length === 0 && !clone.path) {
		return null;
	}

	return clone;
};

export const applyMenuAccessControl = <T>(menu: T, rawAccessMap: unknown): T => {
	const accessMap = isAccessMap(rawAccessMap) ? rawAccessMap : buildMenuAccessMap(rawAccessMap);
	const hasAccessDataset = Object.keys(accessMap).length > 0;

	const menuClone = cloneMenuDefinition(menu) as Record<string, any>;
	const processed = processMenuGroup(menuClone, accessMap, hasAccessDataset);
	return processed as unknown as T;
};
