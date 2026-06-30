import { BarChart } from '@mantine/charts';
import { Card, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { ForecastPoint } from '@infra/shared';
import { formatMoney } from '@/utils/format';

interface ForecastCardProps {
  forecast: ForecastPoint[] | undefined;
  base: string;
}

export function ForecastCard({ forecast, base }: ForecastCardProps) {
  const { t } = useTranslation();
  const chartMoney = (v: number) => formatMoney(String(v), base);
  const forecastData = (forecast ?? []).map((p) => ({
    month: p.month,
    actual: Number(p.actual),
    projected: Number(p.projected),
  }));
  return (
    <Card withBorder radius="md" padding="lg">
      <Text fw={600} mb="md">
        {t('dashboard.charts.forecast', { base })}
      </Text>
      {forecastData.length > 0 ? (
        <BarChart
          h={200}
          data={forecastData}
          dataKey="month"
          type="stacked"
          series={[
            { name: 'actual', label: t('dashboard.charts.actualSeries'), color: 'brand.6' },
            { name: 'projected', label: t('dashboard.charts.forecastSeries'), color: 'brand.3' },
          ]}
          valueFormatter={chartMoney}
          yAxisProps={{ tickFormatter: (v: number) => formatMoney(String(v)) }}
        />
      ) : (
        <Text c="dimmed" size="sm">
          {t('dashboard.empty.noData')}
        </Text>
      )}
    </Card>
  );
}
