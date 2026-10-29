export function MenuIcon({ open }) {
  return (
    <svg aria-hidden="true" className="header-icon" viewBox="0 0 24 24" fill="none">
      {open ? (
        <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
      )}
    </svg>
  );
}
