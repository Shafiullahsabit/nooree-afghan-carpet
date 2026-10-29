export function LocationIcon({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={`location-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M19 10.1c0 5-7 11-7 11s-7-6-7-11a7 7 0 1 1 14 0Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
