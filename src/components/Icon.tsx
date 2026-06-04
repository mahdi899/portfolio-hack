interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

/* Clean, single-stroke neon-friendly glyphs. currentColor driven. */
const PATHS: Record<string, JSX.Element> = {
  brain: (
    <>
      <path d="M9 4.5a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0-1.5 4.4A2.5 2.5 0 0 0 7 16.5 2.5 2.5 0 0 0 9.5 19 2.5 2.5 0 0 0 12 16.5V6a2.5 2.5 0 0 0-3-1.5Z" />
      <path d="M15 4.5A2.5 2.5 0 0 1 17.5 7a2.5 2.5 0 0 1 1.5 4.4A2.5 2.5 0 0 1 17 16.5 2.5 2.5 0 0 1 14.5 19 2.5 2.5 0 0 1 12 16.5" />
      <path d="M12 9h2M9 12h1.5M14 13h1.5" />
    </>
  ),
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.6" cy="7.4" r="0.6" fill="currentColor" />
    </>
  ),
  video: (
    <>
      <rect x="3.5" y="5" width="17" height="14" rx="3" />
      <path d="M10 9.2v5.6l4.5-2.8z" fill="currentColor" stroke="none" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.5 2.2 2.5 13.8 0 16M12 4c-2.5 2.2-2.5 13.8 0 16" />
    </>
  ),
  send: (
    <>
      <path d="M21 4 3 10.8l6.4 2.3M21 4l-2.6 16-5-7.9M21 4 9.4 13.1l.0 5.2 3-4.4" />
    </>
  ),
  headset: (
    <>
      <path d="M5 13v-1a7 7 0 0 1 14 0v1" />
      <rect x="3.5" y="13" width="3.5" height="6" rx="1.5" />
      <rect x="17" y="13" width="3.5" height="6" rx="1.5" />
      <path d="M19 19v.5a3 3 0 0 1-3 3h-2.5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20h16" />
      <rect x="5.5" y="12" width="3" height="6" rx="1" />
      <rect x="10.5" y="8" width="3" height="10" rx="1" />
      <rect x="15.5" y="4.5" width="3" height="13.5" rx="1" />
    </>
  ),
  scan: (
    <>
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
      <path d="M4 12h16" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 5 6v5.5c0 4.4 3 7.5 7 9 4-1.5 7-4.6 7-9V6Z" />
      <path d="m9 12 2 2 4-4.2" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
      <path d="M4 10h16M8 3.5v4M16 3.5v4" />
      <path d="m9 15 1.8 1.8L15 13" />
    </>
  ),
  loop: (
    <>
      <path d="M4 9a6 6 0 0 1 10.5-4M20 15A6 6 0 0 1 9.5 19" />
      <path d="M14 4.5 14.8 8l-3.4.4M10 19.5 9.2 16l3.4-.4" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8.5 13.4 11l2.6 1-2.6 1L12 15.5 10.6 13 8 12l2.6-1z" fill="currentColor" stroke="none" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 3c3 1.5 5 4.8 5 8.5L12 16l-5-4.5C7 7.8 9 4.5 12 3Z" />
      <circle cx="12" cy="9.5" r="1.6" />
      <path d="M9 16c-1.5.6-2.4 2.2-2.4 4 1.8 0 3.4-.9 4-2.4M15 16c1.5.6 2.4 2.2 2.4 4-1.8 0-3.4-.9-4-2.4" />
    </>
  ),
  magnet: (
    <>
      <path d="M6 4v7a6 6 0 0 0 12 0V4" />
      <path d="M6 9h4M14 9h4" />
    </>
  ),
  arrow: <path d="M7 17 17 7M9 7h8v8" />,
  plus: <path d="M12 5v14M5 12h14" />,
  bolt: <path d="M13 3 5 13h6l-1 8 8-10h-6z" fill="currentColor" stroke="none" />,
};

export function Icon({ name, size = 22, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name] ?? PATHS.spark}
    </svg>
  );
}
