import { usePreferences } from '../context/PreferencesContext';

const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', AUD: 'A$', CAD: 'C$', CHF: 'CHF',
};

export const getCurrencySymbol = (code) => CURRENCY_SYMBOLS[code] || `${code} `;

export const formatCurrency = (value, currency = 'USD', locale = 'en-US') => {
  if (value == null || value === '') return '—';
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(n)) return String(value);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${getCurrencySymbol(currency)}${n.toLocaleString(locale, { maximumFractionDigits: 2 })}`;
  }
};

export const formatCurrencyCompact = (value, currency = 'USD', locale = 'en-US') => {
  if (value == null || value === '') return '—';
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(n)) return String(value);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n);
  } catch {
    return `${getCurrencySymbol(currency)}${n.toLocaleString(locale, { maximumFractionDigits: 1 })}`;
  }
};

export const formatNumber = (value, locale = 'en-US', options = {}) => {
  if (value == null || value === '') return '—';
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat(locale, options).format(n);
};

export const formatDate = (input, locale = 'en-US', options) => {
  if (!input) return '—';
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return new Intl.DateTimeFormat(locale, options || { year: 'numeric', month: 'short', day: '2-digit' }).format(d);
};

export const formatDateTime = (input, locale = 'en-US', timezone) => {
  if (!input) return '—';
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
    ...(timezone ? { timeZone: timezone } : {}),
  }).format(d);
};

export const useFormatCurrency = () => {
  const { prefs } = usePreferences();
  const currency = prefs?.language?.currency || 'USD';
  const locale = prefs?.language?.locale || 'en-US';
  return (value) => formatCurrency(value, currency, locale);
};

export const useFormatCurrencyCompact = () => {
  const { prefs } = usePreferences();
  const currency = prefs?.language?.currency || 'USD';
  const locale = prefs?.language?.locale || 'en-US';
  return (value) => formatCurrencyCompact(value, currency, locale);
};

export const useFormatDate = () => {
  const { prefs } = usePreferences();
  const locale = prefs?.language?.locale || 'en-US';
  const timezone = prefs?.language?.timezone;
  return (input, options) => formatDate(input, locale, options || { year: 'numeric', month: 'short', day: '2-digit', ...(timezone ? { timeZone: timezone } : {}) });
};
