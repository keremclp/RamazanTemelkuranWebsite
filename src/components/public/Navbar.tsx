"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, BookOpen } from "lucide-react";
import { NAV_LINKS } from "@/lib/utils/constants";

export default function Navbar({
  siteTitle,
  shopierUrl,
}: {
  siteTitle: string;
  shopierUrl: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const firstLink = mobileMenuRef.current?.querySelector<HTMLElement>("a");
    firstLink?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
        'a, button:not([disabled])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isOpen
          ? "bg-surface/95 shadow-[var(--shadow-nav)]"
          : "bg-surface/95 border-b border-border/60"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Author Name */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="group flex min-w-0 items-center gap-3 rounded-xl no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-surface sm:gap-3.5"
          >
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-[0_4px_12px_rgba(197,165,90,0.24)] transition-all duration-[var(--transition-base)] group-hover:-translate-y-0.5 group-hover:bg-accent-dark group-hover:shadow-[0_6px_16px_rgba(166,138,62,0.3)] motion-reduce:transform-none">
              <span
                className="absolute inset-[3px] rounded-[0.55rem] border border-white/30"
                aria-hidden="true"
              />
              <BookOpen
                className="relative"
                size={21}
                strokeWidth={2.1}
                aria-hidden="true"
              />
            </span>
            <span className="flex min-w-0 flex-col justify-center leading-none">
              <span className="mb-1 flex items-center gap-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.24em] text-accent-ink sm:text-[0.625rem] sm:tracking-[0.28em]">
                <span
                  className="h-px w-3 bg-accent sm:w-4"
                  aria-hidden="true"
                />
                Yazar
              </span>
              <span className="truncate font-[family-name:var(--font-heading)] text-[1.05rem] font-bold leading-tight tracking-[0.01em] text-primary transition-colors duration-[var(--transition-base)] group-hover:text-accent-ink sm:text-[1.4rem] lg:text-2xl">
                {siteTitle}
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors duration-[var(--transition-fast)] no-underline ${
                    isActive
                      ? "text-accent-ink"
                      : "text-primary/70 hover:text-primary"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-accent rounded-full" />
                  )}
                </Link>
              );
            })}
            {shopierUrl && (
              <Link
                href={shopierUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-on text-sm font-medium rounded-lg hover:bg-accent-light transition-colors duration-[var(--transition-fast)] no-underline"
              >
                <BookOpen size={16} />
                Kitap Satın Al
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-primary transition-colors hover:text-accent-ink"
            aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-navigation"
          ref={mobileMenuRef}
          aria-hidden={!isOpen}
          inert={!isOpen}
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pb-6 pt-2 space-y-1 border-t border-border">
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors no-underline ${
                    isActive
                      ? "text-accent-ink bg-accent/5"
                      : "text-primary/70 hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {shopierUrl && (
              <Link
                href={shopierUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 mx-4 mt-3 px-5 py-3 bg-accent text-accent-on text-sm font-medium rounded-lg text-center justify-center hover:bg-accent-light transition-colors no-underline"
              >
                <BookOpen size={16} />
                Kitap Satın Al
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
