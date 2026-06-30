import { DonutChart } from '@mantine/charts';
import { Card, Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { AnalyticsSummary } from '@infra/shared';
import { useEnums } from '@/constants';
import { formatMoney } from '@/utils/format';
import { DONUT_COLORS } from './dashboardUtils';

interface SpendByTypeCardProps {
  byType: AnalyticsSummary['byType'];
  base: string;
  isLoading: boolean;
}

export function SpendByTypeCard({ byType, base, isLoading }: SpendByTypeCardProps) {
  const { t } = useTranslation();
  const enums = useEnums();
  const chartMoney = (v: number) => formatMoney(String(v), base);
  const donutData = byType
    .filter((tp) => Number(tp.monthlyCost) > 0)
    .map((tp, i) => ({
      name: enums.serviceTypeLabel(tp.type),
      value: Number(tp.monthlyCost),
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
  return (
    <Card withBorder radius="md" padding="lg">
      <Text fw={600} mb="md">
        {t('dashboard.charts.byType', { base })}
      </Text>
      {donutData.length > 0 ? (
        <Group justify="center">
          <DonutChart
            data={donutData}
            withLabelsLine
            withTooltip
            size={180}
            thickness={28}
            strokeWidth={0}
            valueFormatter={chartMoney}
          />
        </Group>
      ) : (
        <Text c="dimmed" size="sm">
          {isLoading ? t('common.loading') : t('dashboard.empty.noServices')}
        </Text>
      )}
    </Card>
  );
}
