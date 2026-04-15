'use client';

import React from 'react';
import { useTranslation } from '@/providers/LanguageProvider';

export default function ProfilePageHeader() {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">{t('profilePage.title')}</h1>
      <p className="mt-1 text-gray-600">{t('profilePage.subtitle')}</p>
    </div>
  );
}
