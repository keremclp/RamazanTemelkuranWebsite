"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isOpen
          ? "bg-surface/95 backdrop-blur-md shadow-[var(--shadow-nav)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Author Name */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="group flex items-center gap-2 no-underline"
          >
            <span className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-primary tracking-wide group-hover:text-accent transition-colors duration-[var(--transition-base)]">
              {siteTitle}
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
                      ? "text-accent"
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
                className="ml-4 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dark transition-colors duration-[var(--transition-fast)] no-underline"
              >
                <BookOpen size={16} />
                Kitap Satın Al
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-primary hover:text-accent transition-colors"
            aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
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
                      ? "text-accent bg-accent/5"
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
                className="flex items-center gap-2 mx-4 mt-3 px-5 py-3 bg-accent text-white text-sm font-medium rounded-lg text-center justify-center hover:bg-accent-dark transition-colors no-underline"
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
