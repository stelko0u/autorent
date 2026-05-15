import type { Locale } from '@/lib/i18n/translations';

type EmailTranslations = {
  verification: {
    subject: string;
    title: string;
    greeting: string;
    intro: string;
    cta: string;
    fallback: string;
    validity: string;
    ignore: string;
  };
  resetPassword: {
    subject: string;
    title: string;
    greeting: string;
    intro: string;
    cta: string;
    fallback: string;
    ignore: string;
    signature: string;
  };
  reservationPayment: {
    subject: (id: number) => string;
    title: string;
    reservationLabel: (id: number) => string;
    greeting: (fullName: string) => string;
    intro: string;
    detailsTitle: string;
    carLabel: string;
    startDateLabel: string;
    endDateLabel: string;
    daysLabel: string;
    totalLabel: string;
    cta: string;
    fallback: string;
    validity: string;
    textIntro: string;
    textContinue: string;
  };
  invoice: {
    subject: (id: number) => string;
    title: string;
    reservationLabel: (id: number) => string;
    greeting: (fullName: string) => string;
    intro: string;
    detailsTitle: string;
    carLabel: string;
    periodLabel: string;
    totalPaidLabel: string;
    paidDateLabel: string;
    thanks: (company: string) => string;
    signature: (company: string) => string;
    textIntro: (id: number) => string;
    textAttachment: string;
    textCarLabel: string;
    textPeriodLabel: string;
    textTotalPaidLabel: string;
    textPaidDateLabel: string;
  };
  companyCredentials: {
    subject: string;
    title: string;
    greeting: string;
    intro: (companyName: string) => string;
    loginEmailLabel: string;
    passwordLabel: string;
    note: string;
    ctaLabel: string;
    footer: string;
  };
};

const translations: Record<Locale, EmailTranslations> = {
  bg: {
    verification: {
      subject: 'Потвърди своя имейл адрес',
      title: 'Потвърди своя имейл',
      greeting: 'Здравей',
      intro:
        'Благодарим ти за регистрацията в SmartRent. За да активираш акаунта си, потвърди имейл адреса чрез бутона по-долу.',
      cta: 'Потвърди имейла',
      fallback: 'Ако бутонът не работи, копирай и постави този линк в браузъра си:',
      validity: 'Линкът е валиден за 24 часа.',
      ignore: 'Ако не си създавал акаунт, просто игнорирай този имейл.',
    },
    resetPassword: {
      subject: 'Инструкции за нулиране на паролата',
      title: 'Нулиране на паролата',
      greeting: 'Здравей',
      intro:
        'Получихме заявка за нулиране на паролата ти в SmartRent. Натисни бутона по-долу, за да зададеш нова парола.',
      cta: 'Нулирай паролата',
      fallback: 'Ако бутонът не работи, копирай и постави този линк в браузъра си:',
      ignore: 'Ако не си поискал нулиране на парола, можеш спокойно да игнорираш този имейл.',
      signature: 'Екипът на SmartRent',
    },
    reservationPayment: {
      subject: (id) => `Потвърди резервацията си #${id} - Smart Rent`,
      title: 'Потвърди резервацията си',
      reservationLabel: (id) => `Резервация #${id}`,
      greeting: (fullName) => `Здравей, ${fullName},`,
      intro:
        'Получихме твоята заявка за резервация. За да продължиш към плащането, натисни бутона по-долу.',
      detailsTitle: 'Детайли по резервацията',
      carLabel: 'Автомобил:',
      startDateLabel: 'Начална дата:',
      endDateLabel: 'Крайна дата:',
      daysLabel: 'Дни:',
      totalLabel: 'Общо:',
      cta: 'Потвърди и продължи към плащане',
      fallback: 'Ако бутонът не работи, копирай този линк в браузъра:',
      validity: 'Линкът е валиден за 24 часа.',
      textIntro: 'Получихме твоята заявка за резервация.',
      textContinue: 'За да продължиш към плащането, отвори този линк:',
    },
    invoice: {
      subject: (id) => `Фактура за плащане по резервация #${id}`,
      title: 'Успешно плащане',
      reservationLabel: (id) => `Резервация #${id}`,
      greeting: (fullName) => `Здравей, ${fullName},`,
      intro:
        'Плащането за твоята резервация беше успешно. Прикачили сме PDF фактура към този имейл.',
      detailsTitle: 'Детайли за плащането',
      carLabel: 'Автомобил:',
      periodLabel: 'Период:',
      totalPaidLabel: 'Общо платена сума:',
      paidDateLabel: 'Дата на плащане:',
      thanks: (company) => `Благодарим ти, че използваш ${company}.`,
      signature: (company) => `${company}`,
      textIntro: (id) => `Плащането за резервация #${id} беше успешно.`,
      textAttachment: 'PDF фактурата е прикачена към този имейл.',
      textCarLabel: 'Автомобил:',
      textPeriodLabel: 'Период:',
      textTotalPaidLabel: 'Общо платена сума:',
      textPaidDateLabel: 'Дата на плащане:',
    },
    companyCredentials: {
      subject: 'SmartRent: Временна парола за достъп',
      title: 'Достъп до фирмения акаунт',
      greeting: 'Здравейте',
      intro: (companyName) =>
        `Създаден е профил за фирма "${companyName}" в SmartRent.`,
      loginEmailLabel: 'Имейл за вход',
      passwordLabel: 'Временна парола',
      note: 'При първо влизане смяната на паролата е задължителна.',
      ctaLabel: 'Влез в SmartRent',
      footer: 'Ако имате въпроси, свържете се с нас.',
    },
  },
  en: {
    verification: {
      subject: 'Confirm your email address',
      title: 'Confirm your email',
      greeting: 'Hello',
      intro:
        'Thanks for signing up for SmartRent. To activate your account, please confirm your email address using the button below.',
      cta: 'Confirm email',
      fallback: 'If the button does not work, copy and paste this link into your browser:',
      validity: 'The link is valid for 24 hours.',
      ignore: 'If you did not create an account, you can ignore this email.',
    },
    resetPassword: {
      subject: 'Password reset instructions',
      title: 'Reset your password',
      greeting: 'Hello',
      intro:
        'We received a request to reset your SmartRent password. Click the button below to set a new password.',
      cta: 'Reset password',
      fallback: 'If the button does not work, copy and paste this link into your browser:',
      ignore: 'If you did not request a password reset, you can safely ignore this email.',
      signature: 'The SmartRent team',
    },
    reservationPayment: {
      subject: (id) => `Confirm your reservation #${id} - Smart Rent`,
      title: 'Confirm your reservation',
      reservationLabel: (id) => `Reservation #${id}`,
      greeting: (fullName) => `Hello, ${fullName},`,
      intro:
        'We received your reservation request. To continue to payment, click the button below.',
      detailsTitle: 'Reservation details',
      carLabel: 'Car:',
      startDateLabel: 'Start date:',
      endDateLabel: 'End date:',
      daysLabel: 'Days:',
      totalLabel: 'Total:',
      cta: 'Confirm and continue to payment',
      fallback: 'If the button does not work, copy this link into your browser:',
      validity: 'The link is valid for 24 hours.',
      textIntro: 'We received your reservation request.',
      textContinue: 'To continue to payment, open this link:',
    },
    invoice: {
      subject: (id) => `Payment invoice for reservation #${id}`,
      title: 'Payment successful',
      reservationLabel: (id) => `Reservation #${id}`,
      greeting: (fullName) => `Hello, ${fullName},`,
      intro:
        'Your payment was successful. We have attached a PDF invoice to this email.',
      detailsTitle: 'Payment details',
      carLabel: 'Car:',
      periodLabel: 'Period:',
      totalPaidLabel: 'Total paid:',
      paidDateLabel: 'Payment date:',
      thanks: (company) => `Thank you for choosing ${company}.`,
      signature: (company) => `${company}`,
      textIntro: (id) => `Your payment for reservation #${id} was successful.`,
      textAttachment: 'The PDF invoice is attached to this email.',
      textCarLabel: 'Car:',
      textPeriodLabel: 'Period:',
      textTotalPaidLabel: 'Total paid:',
      textPaidDateLabel: 'Payment date:',
    },
    companyCredentials: {
      subject: 'SmartRent: Temporary access credentials',
      title: 'Company account access',
      greeting: 'Hello',
      intro: (companyName) =>
        `A company account has been created for "${companyName}" in SmartRent.`,
      loginEmailLabel: 'Login email',
      passwordLabel: 'Temporary password',
      note: 'You must change the password on first login.',
      ctaLabel: 'Sign in to SmartRent',
      footer: 'If you have any questions, contact us.',
    },
  },
};

export function getEmailTranslations(locale: Locale): EmailTranslations {
  return translations[locale] ?? translations.bg;
}
