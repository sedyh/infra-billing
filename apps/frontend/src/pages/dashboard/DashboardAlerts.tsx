import { Alert, Stack, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsSummary } from '@infra/shared';
import { formatMoney } from '@/utils/format';
import { dayLabel } from './dashboardUtils';

interface DashboardAlertsProps {
  upcoming: AnalyticsSummary['upcomingBillings'];
  runway: AnalyticsSummary['balanceRunway'];
}

// Red banners for imminent unaffordable charges and prepaid balances about to run out.
export function DashboardAlerts({ upcoming, runway }: DashboardAlertsProps) {
  const { t } = useTranslation();
  const critical = upcoming.filter((b) => b.severity === 'critical');
  const runwayCritical = runway.filter((r) => r.severity === 'critical');
  return (
    <>
      {critical.length > 0 && (
        <Alert
          color="red"
          icon={<IconAlertTriangle size={18} />}
          title={t('dashboard.critical.title')}
        >
          <Stack gap={4}>
            {critical.map((b) => (
              <Text key={b.serviceUuid} size="sm">
                <b>
                  {b.providerName} — {b.name}
                </b>
                :{' '}
                {t('dashboard.critical.charge', {
                  when: dayLabel(t, b.daysUntil),
                  amount: formatMoney(b.cost, b.currency),
                })}
                {b.providerBalance != null &&
                  t('dashboard.critical.balance', {
                    amount: formatMoney(b.providerBalance, b.providerBalanceCurrency),
                  })}
              </Text>
            ))}
          </Stack>
        </Alert>
      )}

      {runwayCritical.length > 0 && (
        <Alert
          color="red"
          icon={<IconAlertTriangle size={18} />}
          title={t('dashboard.runway.criticalTitle')}
        >
          <Stack gap={4}>
            {runwayCritical.map((r) => (
              <Text key={r.providerUuid} size="sm">
                <b>{r.providerName}</b>:{' '}
                {t('dashboard.runway.runsOut', { when: dayLabel(t, r.daysLeft) })} ·{' '}
                {t('dashboard.runway.perDay', { amount: formatMoney(r.burnPerDay, r.currency) })}
                {t('dashboard.runway.balance', { amount: formatMoney(r.balance, r.currency) })}
              </Text>
            ))}
          </Stack>
        </Alert>
      )}
    </>
  );
}
