import * as React from "react";

type AppIconProps = {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
};

const iconPaths: Record<string, React.ReactNode> = {
  space_dashboard: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1.5" fill="currentColor" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.88" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.82" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.7" />
    </>
  ),
  switch_account: (
    <>
      <circle cx="10" cy="9" r="3.2" fill="currentColor" />
      <path d="M4.5 19c.9-3.1 3.2-4.8 5.5-4.8S14.6 15.9 15.5 19" fill="currentColor" opacity="0.78" />
      <path d="M14.8 8.2h4.1M16.8 6.2v4.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  smart_toy: (
    <>
      <rect x="5" y="7" width="14" height="12" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="10" cy="12" r="1.2" fill="currentColor" />
      <circle cx="14" cy="12" r="1.2" fill="currentColor" />
      <path d="M10 3v2.2M14 3v2.2M8.2 19h7.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  auto_awesome: (
    <>
      <path d="M12 3.2l1.8 4.7 4.7 1.8-4.7 1.8L12 16.2l-1.8-4.7-4.7-1.8 4.7-1.8L12 3.2Z" fill="currentColor" />
      <path d="M18.5 12.7l.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9.9-2.2Z" fill="currentColor" opacity="0.8" />
    </>
  ),
  insights: (
    <>
      <path d="M5 17.5V10M10 17.5V6.8M15 17.5V8.8M20 17.5H4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 9.5l4.1-2.6 4.2 2.8 4.2-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 3.8 13.3 5.5 15.5 5l.5 2.2 1.7 1.3-1.7 1.3.5 2.2-2.2.5L12 14.2l-1.3 1.7-2.2-.5-.5 2.2-2.2-.5-.5-2.2-1.7-1.3 1.7-1.3-.5-2.2 2.2-.5L12 3.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.8 9.3a2.3 2.3 0 1 1 3.7 1.8c-.8.6-1.4 1.1-1.4 2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </>
  ),
  notifications: (
    <>
      <path d="M12 4a5 5 0 0 0-5 5v2.2c0 .8-.3 1.6-.9 2.2L4.8 15h14.4l-1.3-1.6a3.1 3.1 0 0 1-.9-2.2V9a5 5 0 0 0-5-5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  add: <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 15l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  auto_graph: (
    <>
      <path d="M5 17.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 14l3.2-3.2 2.8 2.8 5.8-6.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.7 7.5h2.6v2.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  expand_more: <path d="M6.5 9.5 12 15l5.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  person: (
    <>
      <circle cx="12" cy="9" r="3.2" fill="currentColor" />
      <path d="M5.5 19c1.1-3.2 3.7-5 6.5-5s5.4 1.8 6.5 5" fill="currentColor" opacity="0.78" />
    </>
  ),
  groups: (
    <>
      <circle cx="9" cy="9" r="2.6" fill="currentColor" />
      <circle cx="15.5" cy="9.8" r="2.2" fill="currentColor" opacity="0.82" />
      <path d="M4.8 19c.8-2.7 2.8-4.2 4.9-4.2S13.1 16.3 14 19" fill="currentColor" opacity="0.76" />
      <path d="M12.3 19c.4-1.6 1.4-2.9 2.8-3.6" fill="currentColor" opacity="0.62" />
    </>
  ),
  sync: (
    <>
      <path d="M7 8.2a7 7 0 0 1 10.1-1.5L18 6M17 6v3.2H13.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 15.8A7 7 0 0 1 6.9 17.3L6 18M7 18v-3.2h3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  sync_problem: (
    <>
      <path d="M7.2 8.2A7 7 0 0 1 17.3 6.6L18 6M17 6v3.2h-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.8 15.8A7 7 0 0 1 6.6 17.4L6 18M7 18v-3.2h3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11v3.3M12 16.8h0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  analytics: (
    <>
      <rect x="5" y="12.2" width="2.8" height="5.8" rx="1.2" fill="currentColor" />
      <rect x="10" y="9.2" width="2.8" height="8.8" rx="1.2" fill="currentColor" opacity="0.86" />
      <rect x="15" y="6.6" width="2.8" height="11.4" rx="1.2" fill="currentColor" opacity="0.74" />
      <path d="M5 17.8h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    </>
  ),
  stacked_line_chart: (
    <>
      <path d="M5 15.8h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      <path d="M6 13.5l3.4-2.2 2.7 1.8 4.8-5.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 17.2h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
    </>
  ),
  verified: (
    <>
      <circle cx="12" cy="12" r="7.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.7 12.2 11 14.5l4-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.6" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.75" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <path d="M12 12l4.8-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  schedule: (
    <>
      <rect x="4.8" y="6.2" width="14.4" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 4.6v3.2M17 4.6v3.2M4.8 9.5h14.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="13.6" r="1.1" fill="currentColor" />
      <circle cx="12" cy="13.6" r="1.1" fill="currentColor" opacity="0.8" />
      <circle cx="15" cy="13.6" r="1.1" fill="currentColor" opacity="0.65" />
    </>
  ),
  swap_horiz: (
    <>
      <path d="M5 8.2h10.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12.8 5.6 16 8.2l-3.2 2.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 15.8H8.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11.2 13.2 8 15.8l3.2 2.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  trending_up: (
    <>
      <path d="M5 16l5.2-5.2 3.3 3.3L19 8.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.7 8.6H19V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  description: (
    <>
      <rect x="6" y="5" width="12" height="14" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  feed: (
    <>
      <path d="M5 7h14M5 12h14M5 17h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17" cy="17" r="1.2" fill="currentColor" />
    </>
  ),
};

export function AppIcon({ name, size = 20, className, style, title }: AppIconProps) {
  const content = iconPaths[name];

  if (!content) {
    return (
      <span
        className={["material-symbols-outlined", className].filter(Boolean).join(" ")}
        style={style}
        aria-hidden={title ? undefined : true}
        title={title}
      >
        {name}
      </span>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {content}
    </svg>
  );
}
