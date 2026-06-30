import { SimpleGrid } from '@mantine/core';
import { IconCalendarDollar, IconCash, IconChartBar, IconWallet } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsSummary } from '@infra/shared';
import { StatCard } from '@/components/StatCard';
import { formatMoney } from '@/utils/format';

interface KpiCardsProps {
  summary: AnalyticsSummary | undefined;
  base: string;
}

export function KpiCards({ summary, base }: KpiCardsProps) {
  const { t } = useTranslation();
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
      <StatCard
        label={t('dashboard.kpi.monthly')}
        value={formatMoney(summary?.monthlyTotal ?? '0', base)}
        icon={IconWallet}
      />
      <StatCard
        label={t('dashboard.kpi.yearly')}
        value={formatMoney(summary?.yearlyProjection ?? '0', base)}
        icon={IconChartBar}
        color="blue"
      />
      <StatCard
        label={t('dashboard.kpi.currentMonthPayments')}
        value={formatMoney(summary?.currentMonthPayments ?? '0', base)}
        icon={IconCash}
        color="teal"
      />
      <StatCard
        label={t('dashboard.kpi.totalSpent')}
        value={formatMoney(summary?.totalSpent ?? '0', base)}
        icon={IconCalendarDollar}
        color="grape"
      />
    </SimpleGrid>
  );
}
