"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Számoló", icon: CalcIcon },
  { href: "/dolgozat", label: "Dolgozat", icon: ListIcon },
  { href: "/tablazat", label: "Ponttáblázat", icon: TableIcon },
  { href: "/savok", label: "Sávok", icon: SlidersIcon },
];

export default function Nav() {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <>
      {/* Top bar */}
      <header className="no-print sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Logo />
            Osztályozó
          </Link>
          <nav className="hidden gap-1 sm:flex" aria-label="Fő menü">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive(href) ? "bg-surface-2 text-text" : "text-muted hover:text-text"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Bottom tab bar on phones */}
      <nav
        className="no-print fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
        aria-label="Fő menü"
      >
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
              isActive(href) ? "text-accent" : "text-muted"
            }`}
          >
            <Icon />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}

function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <text x="16" y="22.5" textAnchor="middle" fontSize="17" fontWeight="700" fill="var(--accent-text)" fontFamily="system-ui, sans-serif">
        5
      </text>
    </svg>
  );
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function CalcIcon() {
  return (
    <svg {...iconProps}>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg {...iconProps}>
      <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
    </svg>
  );
}
function TableIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17M3.5 14.5h17M10 4v16" />
    </svg>
  );
}
function SlidersIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  );
}
