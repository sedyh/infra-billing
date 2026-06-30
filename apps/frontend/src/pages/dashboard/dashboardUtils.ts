import type { BillingSeverity } from '@infra/shared';
import type { TFunction } from 'i18next';

// Slice palette shared by the dashboard donuts and forecast series.
export const DONUT_COLORS = [
  'brand.6',
  'teal.6',
  'blue.6',
  'orange.6',
  'pink.6',
  'grape.6',
  'cyan.6',
  'lime.6',
];

export const severityColor = (s: BillingSeverity) =>
  s === 'critical' ? 'red' : s === 'warning' ? 'orange' : undefined;

export const dayLabel = (t: TFunction, n: number) =>
  n <= 0
    ? t('dashboard.due.today')
    : n === 1
      ? t('dashboard.due.tomorrow')
      : t('dashboard.due.inDays', { n });
