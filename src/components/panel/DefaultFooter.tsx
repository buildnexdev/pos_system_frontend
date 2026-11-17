import { COMPANY_NAME, COMPANY_TAGLINE } from '../../utils/brand';

export default function DefaultFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="panel-footer">
      <div className="panel-footer-left">
        <strong>{COMPANY_NAME}</strong>
        <span>{COMPANY_TAGLINE}</span>
      </div>
      <div className="panel-footer-center">
        <span>© {year} {COMPANY_NAME}. All rights reserved.</span>
      </div>
      <div className="panel-footer-right">
        <a href="/panel/support">Support</a>
        <a href="#privacy">Privacy</a>
        <a href="#terms">Terms</a>
      </div>
    </footer>
  );
}
