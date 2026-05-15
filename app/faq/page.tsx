'use client';

import PublicPageLayout from '@/components/layouts/PublicPageLayout';
import { useTranslation } from '@/providers/LanguageProvider';
import { CircleInfo } from '@/components/icons';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { normalizeRole } from '@/lib/auth/normalizeRole';

export default function FaqPage() {
  const { t } = useTranslation();
  const { userData, isAuthenticated } = useCurrentUser();
  const role = normalizeRole((userData as { role?: string } | null)?.role);
  const items = ['booking', 'payment', 'cancellation', 'documents', 'deposit'];

  return (
    <PublicPageLayout
      isLoggedIn={isAuthenticated}
      role={role}
      activeKey="faq"
      eyebrowKey="faqPage.eyebrow"
      titleKey="faqPage.title"
      subtitleKey="faqPage.subtitle"
    >
      <div className="grid gap-4">
        {items.map((key) => (
          <article
            key={key}
            className="rounded-3xl border border-gray-200/70 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <CircleInfo className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {t(`faqPage.items.${key}.question`)}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {t(`faqPage.items.${key}.answer`)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PublicPageLayout>
  );
}
