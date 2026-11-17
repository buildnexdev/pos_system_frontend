/**
 * Global product branding — BuildNex ShopOS
 */
import companyLogo from '../assets/Logo/buildnex-shopos-logo.png';

export const COMPANY_NAME = 'BuildNex ShopOS';
export const COMPANY_SHORT = 'BuildNex';
export const COMPANY_TAGLINE = 'One Platform. Every Shop.';
export const COMPANY_FEATURES = 'Retail · POS · E-commerce · Inventory · Business Management';
export const COMPANY_SUPPORT_EMAIL = 'support@buildnexshopos.com';
export const COMPANY_LOGO = companyLogo;

export function companyLogoSrc() {
  try {
    if (/^https?:\/\//i.test(companyLogo)) return companyLogo;
    const path = companyLogo.startsWith('/') ? companyLogo : `/${companyLogo}`;
    return `${window.location.origin}${path}`;
  } catch {
    return '';
  }
}
