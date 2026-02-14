"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/get-started", label: "Find a truck" },
  { href: "/offers", label: "Seasonal offers" },
  { href: "/list-your-truck", label: "List your truck" },
];

const adminItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/truck-owners", label: "Truck owners" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/offers", label: "Seasonal offers" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 shadow-md backdrop-blur dark:bg-stone-800/90"
        aria-label="Open menu"
      >
        <svg
          className="h-5 w-5 text-stone-700 dark:text-stone-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside
            className="fixed left-0 top-0 z-50 h-full w-72 max-w-[85vw] border-r border-stone-200 bg-white shadow-xl dark:border-stone-700 dark:bg-stone-900"
            role="dialog"
            aria-label="Navigation menu"
          >
            <div className="flex h-14 items-center justify-between border-b border-stone-200 px-4 dark:border-stone-700">
              <span className="font-semibold text-stone-900 dark:text-stone-100">iNeedATruck</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-4 py-3 text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 ${
                    pathname === item.href ? "bg-stone-100 font-medium dark:bg-stone-800" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-4 border-t border-stone-200 pt-4 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setAdminExpanded(!adminExpanded)}
                  className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                >
                  Admin
                  <svg
                    className={`h-4 w-4 transition-transform ${adminExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {adminExpanded && (
                  <div className="mt-1 space-y-1 pl-2">
                    {adminItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`block rounded-lg px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 ${
                          pathname === item.href || pathname.startsWith(item.href + "/")
                            ? "font-medium text-orange-600 dark:text-orange-400"
                            : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
