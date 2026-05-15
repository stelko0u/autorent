'use client';

import PublicPageLayout from '@/components/layouts/PublicPageLayout';
import { useTranslation } from '@/providers/LanguageProvider';
import { MapPin, MagnifyingGlass, CircleInfo } from '@/components/icons';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { normalizeRole } from '@/lib/auth/normalizeRole';

export default function ContactsPage() {
  const { t } = useTranslation();
  const { userData, isAuthenticated } = useCurrentUser();
  const role = normalizeRole((userData as { role?: string } | null)?.role);

  return (
    <PublicPageLayout
      isLoggedIn={isAuthenticated}
      role={role}
      activeKey="contacts"
      eyebrowKey="contactPage.eyebrow"
      titleKey="contactPage.title"
      subtitleKey="contactPage.subtitle"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <CircleInfo className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {t('contactPage.cards.support.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('contactPage.cards.support.description')}
          </p>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p>
              <span className="text-gray-500">
                {t('contactPage.cards.support.emailLabel')}:
              </span>{' '}
              {t('contactPage.details.supportEmail')}
            </p>
            <p>
              <span className="text-gray-500">
                {t('contactPage.cards.support.phoneLabel')}:
              </span>{' '}
              {t('contactPage.details.supportPhone')}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
            <MagnifyingGlass className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {t('contactPage.cards.partnerships.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('contactPage.cards.partnerships.description')}
          </p>
          <div className="mt-4 text-sm text-gray-700">
            <span className="text-gray-500">
              {t('contactPage.cards.partnerships.emailLabel')}:
            </span>{' '}
            {t('contactPage.details.partnershipsEmail')}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200/70 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
            <MapPin className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {t('contactPage.cards.office.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('contactPage.cards.office.description')}
          </p>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p>
              <span className="text-gray-500">
                {t('contactPage.cards.office.addressLabel')}:
              </span>{' '}
              {t('contactPage.details.officeAddress')}
            </p>
            <p>
              <span className="text-gray-500">
                {t('contactPage.cards.office.hoursLabel')}:
              </span>{' '}
              {t('contactPage.details.officeHours')}
            </p>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
