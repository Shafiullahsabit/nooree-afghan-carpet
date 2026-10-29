"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GlobeIcon } from "@/components/icons/globe-icon";
import { MenuIcon } from "@/components/icons/menu-icon";
import { SearchIcon } from "@/components/icons/search-icon";
import { ShoppingBagIcon } from "@/components/icons/shopping-bag-icon";
import { UserIcon } from "@/components/icons/user-icon";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";

export function ClientSiteHeader({
  locale,
  locales,
  header,
  brandHome,
  brandCaption,
  whatsappNumber,
  whatsappUrl,
}) {
  const pathname = usePathname();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchPanelRef = useRef(null);
  const languagePanelRef = useRef(null);
  const localeCodes = locales.map((item) => item.code);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!searchPanelRef.current?.contains(event.target)) setSearchOpen(false);
      if (!languagePanelRef.current?.contains(event.target)) setLanguageOpen(false);
    }

    function handleEscape(event) {
      if (event.key !== "Escape") return;
      setLanguageOpen(false);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function getLocaleHref(code) {
    const segments = pathname.split("/");
    if (localeCodes.includes(segments[1])) {
      segments[1] = code;
      return segments.join("/") || `/${code}`;
    }
    return `/${code}`;
  }

  function closeMenus() {
    setMobileMenuOpen(false);
    setLanguageOpen(false);
  }

  return (
    <div className="site-header-wrap">
        <header className="site-header shell">
          <Link className="brand" href={`/${locale}`} aria-label={brandHome} onClick={closeMenus}>
            <span className="brand-name">NOOREE<span>®</span></span>
            <span className="brand-caption">{brandCaption}</span>
          </Link>

          <button
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? header.closeMenu : header.openMenu}
            className="header-icon-button mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((open) => !open)}
            type="button"
          >
            <MenuIcon open={mobileMenuOpen} />
          </button>

          <nav
            aria-label={header.navigation}
            className={mobileMenuOpen ? "main-nav is-open" : "main-nav"}
          >
            <Link href={`/${locale}#home`} onClick={closeMenus}>{header.home}</Link>
            <Link href={`/${locale}#categories`} onClick={closeMenus}>{header.categories}</Link>
            <Link href={`/${locale}#offers`} onClick={closeMenus}>{header.offers}</Link>
            <Link href={`/${locale}#overview`} onClick={closeMenus}>{header.overview}</Link>
            <Link href={`/${locale}#collection`} onClick={closeMenus}>{header.collectionNav}</Link>
          </nav>

          <div className="header-actions">
            <div className="header-search-wrap" ref={searchPanelRef}>
              <button
                aria-expanded={searchOpen}
                aria-label={header.search}
                className="header-icon-button"
                onClick={() => {
                  setSearchOpen((open) => !open);
                  setLanguageOpen(false);
                  setMobileMenuOpen(false);
                }}
                type="button"
              >
                <SearchIcon />
              </button>
              {searchOpen ? (
                <form action={`/${locale}/carpets`} className="header-search-panel" role="search">
                  <label className="sr-only" htmlFor={`site-search-${locale}`}>{header.search}</label>
                  <input
                    autoComplete="off"
                    id={`site-search-${locale}`}
                    name="q"
                    placeholder={header.searchPlaceholder}
                    ref={searchInputRef}
                    type="search"
                  />
                  <button aria-label={header.submitSearch} className="search-submit" type="submit">
                    <SearchIcon />
                  </button>
                </form>
              ) : null}
            </div>

            <Link
              aria-label={header.account}
              className="header-icon-button"
              href={`/${locale}/account`}
              title={header.account}
            >
              <UserIcon />
            </Link>
            <Link
              aria-label={header.cart}
              className="header-icon-button"
              href={`/${locale}/cart`}
              title={header.cart}
            >
              <ShoppingBagIcon />
            </Link>
            <a
              aria-label={`${header.whatsapp}: ${whatsappNumber}`}
              className="header-icon-button header-whatsapp"
              href={whatsappUrl}
              rel="noreferrer"
              target="_blank"
              title={`${header.whatsapp}: ${whatsappNumber}`}
            >
              <WhatsAppIcon />
              <span className="whatsapp-number" dir="ltr">{whatsappNumber}</span>
            </a>

            <div className="language-picker" ref={languagePanelRef}>
              <button
                aria-expanded={languageOpen}
                aria-label={header.language}
                className="header-icon-button language-toggle"
                onClick={() => {
                  setLanguageOpen((open) => !open);
                  setSearchOpen(false);
                  setMobileMenuOpen(false);
                }}
                type="button"
              >
                <GlobeIcon />
                <span className="language-current">{locales.find((item) => item.code === locale)?.shortLabel}</span>
              </button>
              {languageOpen ? (
                <div className="language-menu" aria-label={header.language}>
                  {locales.map((item) => (
                    <Link
                      aria-current={item.code === locale ? "page" : undefined}
                      className={item.code === locale ? "language-option is-active" : "language-option"}
                      href={getLocaleHref(item.code)}
                      hrefLang={item.code}
                      key={item.code}
                      lang={item.code}
                      onClick={closeMenus}
                    >
                      <span>{item.label}</span>
                      <span aria-hidden="true">{item.shortLabel}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </header>
      </div>
  );
}
