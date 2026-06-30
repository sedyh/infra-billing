import { LineChart } from '@mantine/charts';
import { Modal, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Provider } from '@infra/shared';
import { useBalanceHistory } from '@/api/analytics';
import { formatDate, formatDateShort, formatMoney } from '@/utils/format';

// The default Mantine/recharts Y-axis starts at 0, so a near-flat balance line (e.g. a steady 36)
// gets glued to the top of the chart with everything below it empty. Pad the axis around the actual
// values (snapped to a "nice" 1/2/5 step) so the line sits mid-chart with clean tick labels.
function niceBalanceDomain(values: number[]): { domain: [number, number]; ticks: number[] } {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || Math.abs(max) || 1;
  const rawStep = spread / 4;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const norm = rawStep / mag;
  const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
  const lo = Math.floor((min - spread * 0.2) / step) * step;
  const hi = Math.ceil((max + spread * 0.2) / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(6)));
  return { domain: [lo, hi], ticks };
}

export function BalanceHistoryModal({
  provider,
  onClose,
}: {
  provider: Provider | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const history = useBalanceHistory(provider?.uuid);
  // Snapshots are taken on every sync (~6h), so collapse to one point per day (the day's last
  // snapshot) to match the "balance by day" chart and avoid repeated same-date axis labels.
  const dailyBalance = new Map<string, number>();
  for (const pt of history.data ?? [])
    dailyBalance.set(formatDateShort(pt.capturedAt), Number(pt.balance));
  const historyData = [...dailyBalance].map(([date, balance]) => ({ date, balance }));
  const balanceAxis = historyData.length
    ? niceBalanceDomain(historyData.map((d) => d.balance))
    : null;
  const latest = history.data?.[history.data.length - 1];
  const historyCurrency = latest?.currency ?? provider?.balanceCurrency ?? '';

  return (
    <Modal
      opened={!!provider}
      onClose={onClose}
      title={t('providers.balanceHistory.title', { name: provider?.name ?? '' })}
      size="lg"
    >
      {history.isLoading ? (
        <Text c="dimmed" py="md" ta="center">
          {t('common.loading')}
        </Text>
      ) : historyData.length >= 2 ? (
        <LineChart
          h={260}
          data={historyData}
          dataKey="date"
          series={[
            { name: 'balance', label: t('providers.balanceHistory.series'), color: 'brand.6' },
          ]}
          curveType="linear"
          withDots={historyData.length <= 60}
          valueFormatter={(v) => formatMoney(String(v), historyCurrency)}
          yAxisProps={{
            domain: balanceAxis?.domain,
            ticks: balanceAxis?.ticks,
            tickFormatter: (v: number) => formatMoney(String(v)),
          }}
        />
      ) : latest ? (
        <Stack gap={2} py="lg" align="center">
          <Text size="xl" fw={700}>
            {formatMoney(latest.balance, historyCurrency)}
          </Text>
          <Text c="dimmed" size="sm">
            {formatDate(latest.capturedAt)}
          </Text>
          <Text c="dimmed" size="sm" ta="center" mt="xs">
            {t('providers.balanceHistory.notEnough')}
          </Text>
        </Stack>
      ) : (
        <Text c="dimmed" py="md" ta="center">
          {t('providers.balanceHistory.empty')}
        </Text>
      )}
    </Modal>
  );
}
