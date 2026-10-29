export function Icon({ name }) {
  if (name === "arrow") {
    return (
      <svg
        aria-hidden="true"
        className="icon"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M3.5 10h12m-5-5 5 5-5 5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  return null;
}
