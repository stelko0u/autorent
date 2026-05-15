'use client';

import PublicPageLayout from '@/components/layouts/PublicPageLayout';
import { useTranslation } from '@/providers/LanguageProvider';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { normalizeRole } from '@/lib/auth/normalizeRole';

function AboutContent() {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-gray-200/70 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('aboutPage.aboutTitle')}
          </h2>
          <p className="mt-4 text-base text-gray-600">
            {t('aboutPage.aboutBody')}
          </p>
        </section>

        <section className="rounded-3xl border border-gray-200/70 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('aboutPage.missionTitle')}
          </h2>
          <p className="mt-4 text-base text-gray-600">
            {t('aboutPage.missionBody')}
          </p>
        </section>
      </div>

      <section className="rounded-3xl border border-gray-200/70 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('aboutPage.valuesTitle')}
        </h2>
        <div className="mt-5 space-y-4">
          {['transparent', 'curated', 'support'].map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4"
            >
              <h3 className="text-base font-semibold text-gray-900">
                {t(`aboutPage.values.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {t(`aboutPage.values.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function AboutPage() {
  const { t } = useTranslation();
  const { userData, isAuthenticated } = useCurrentUser();
  const role = normalizeRole((userData as { role?: string } | null)?.role);

  return (
    <PublicPageLayout
      isLoggedIn={isAuthenticated}
      role={role}
      activeKey="about"
      eyebrowKey="aboutPage.eyebrow"
      titleKey="aboutPage.title"
      subtitleKey="aboutPage.subtitle"
    >
      <AboutContent />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-amber-200/60 bg-amber-50/70 p-5 text-sm text-amber-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            {t('nav.faq')}
          </p>
          <p className="mt-2 text-base font-semibold">
            {t('faqPage.title')}
          </p>
          <p className="mt-2 text-sm text-amber-800">
            {t('faqPage.subtitle')}
          </p>
          <a
            href="/faq"
            className="mt-4 inline-flex rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {t('nav.faq')}
          </a>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-800">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {t('nav.contacts')}
          </p>
          <p className="mt-2 text-base font-semibold">
            {t('contactPage.title')}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {t('contactPage.subtitle')}
          </p>
          <a
            href="/contacts"
            className="mt-4 inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {t('nav.contacts')}
          </a>
        </div>
      </div>
    </PublicPageLayout>
  );
}
