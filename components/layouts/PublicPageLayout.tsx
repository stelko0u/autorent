'use client';

import React, { useMemo, useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import MobileTopBar from '@/components/layouts/MobileTopBar';
import { useTranslation } from '@/providers/LanguageProvider';
import type { Role } from '@/types/home';

type PublicPageLayoutProps = {
  isLoggedIn: boolean;
  role: Role;
  activeKey: string;
  eyebrowKey: string;
  titleKey: string;
  subtitleKey?: string;
  children: React.ReactNode;
};

export default function PublicPageLayout({
  isLoggedIn,
  role,
  activeKey,
  eyebrowKey,
  titleKey,
  subtitleKey,
  children,
}: PublicPageLayoutProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState(activeKey);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const subtitle = useMemo(() => {
    if (!subtitleKey) return '';
    return t(subtitleKey);
  }, [subtitleKey, t]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#f8fafc_40%,#eef2f7_100%)] text-gray-800">
      <div className="flex min-h-screen">
        <aside className="hidden xl:sticky xl:top-0 xl:block xl:h-screen">
          <Sidebar
            active={active}
            setActive={setActive}
            isLoggedIn={isLoggedIn}
            role={role}
          />
        </aside>

        <div
          className={`fixed inset-0 z-50 xl:hidden transition ${
            mobileMenuOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          }`}
        >
          <button
            type="button"
            aria-label={t('homePage.closeMobileMenu')}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div
            className={`relative h-full w-72.5 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar
              active={active}
              setActive={(value) => {
                setActive(value);
                setMobileMenuOpen(false);
              }}
              isLoggedIn={isLoggedIn}
              role={role}
            />
          </div>
        </div>

        <main className="flex-1">
          <div className="mx-auto max-w-400-4 py-4 sm:px-5 md:px-6 lg:px-8 lg:py-6">
            <div className="rounded-[30px] border border-white/60 bg-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                <MobileTopBar
                  active={active}
                  setActive={setActive}
                  isLoggedIn={isLoggedIn}
                  mobileMenuOpen={mobileMenuOpen}
                  setMobileMenuOpen={setMobileMenuOpen}
                />

                <div className="space-y-8">
                  <section className="rounded-3xl border border-gray-200/70 bg-white/90 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                      {t(eyebrowKey)}
                    </p>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      {t(titleKey)}
                    </h1>
                    {subtitle && (
                      <p className="mt-2 text-sm text-gray-500 sm:text-base">
                        {subtitle}
                      </p>
                    )}
                  </section>

                  <section className="space-y-6">{children}</section>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
