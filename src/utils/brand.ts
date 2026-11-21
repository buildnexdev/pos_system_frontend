/**
 * Global product branding — BuildNex ShopOS
 * Tenant (login company) branding falls back to these defaults.
 */
import companyLogo from '../assets/Logo/buildnex-shopos-logo.svg';
import companyMark from '../assets/Logo/buildnex-shopos-mark.svg';

export const COMPANY_NAME = 'BuildNex ShopOS';
export const COMPANY_SHORT = 'BuildNex';
export const COMPANY_TAGLINE = 'Smart POS. Smarter Business.';
export const COMPANY_FEATURES = 'Retail · POS · E-commerce · Inventory · Business Management';
export const COMPANY_SUPPORT_EMAIL = 'support@buildnexshopos.com';
export const COMPANY_LOGO = companyLogo;
export const COMPANY_MARK = companyMark;

const API_ORIGIN = String((import.meta as any).env?.VITE_API_URL || '')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

/** Resolve uploaded / relative media paths for <img src> */
export function resolveBrandMediaUrl(path?: string | null) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('data:')) return path;
  if (path.startsWith('/')) {
    const origin = API_ORIGIN || (typeof window !== 'undefined' ? window.location.origin : '');
    return `${origin}${path}`;
  }
  return path;
}

export function companyLogoSrc() {
  try {
    if (/^https?:\/\//i.test(companyLogo)) return companyLogo;
    const path = companyLogo.startsWith('/') ? companyLogo : `/${companyLogo}`;
    return `${window.location.origin}${path}`;
  } catch {
    return '';
  }
}

type TenantUser = {
  companyName?: string | null;
  companyLogo?: string | null;
  companyWebsite?: string | null;
} | null | undefined;

/** Logged-in company brand for panel chrome; falls back to platform brand. */
export function tenantBrand(user?: TenantUser) {
  const name = String(user?.companyName || '').trim() || COMPANY_NAME;
  const logo = resolveBrandMediaUrl(user?.companyLogo) || COMPANY_MARK;
  const website = String(user?.companyWebsite || '')
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '');
  const subtitle = website || (name === COMPANY_NAME ? COMPANY_TAGLINE : '');
  return { name, logo, subtitle };
}
