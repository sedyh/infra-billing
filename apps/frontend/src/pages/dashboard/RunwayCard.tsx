import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { AnalyticsSummary } from '@infra/shared';
import { formatMoney } from '@/utils/format';
import { dayLabel, severityColor } from './dashboardUtils';

interface RunwayCardProps {
  runway: AnalyticsSummary['balanceRunway'];
}

export function RunwayCard({ runway }: RunwayCardProps) {
  const { t } = useTranslation();
  if (runway.length === 0) return null;
  return (
    <Card withBorder radius="md" padding="lg">
      <Text fw={600}>{t('dashboard.runway.title')}</Text>
      <Text c="dimmed" size="xs" mb="md">
        {t('dashboard.runway.subtitle')}
      </Text>
      <Stack gap="xs">
        {runway.map((r) => {
          const color = severityColor(r.severity);
          return (
            <Group key={r.providerUuid} justify="space-between" wrap="nowrap">
              <Text size="sm" c={color} style={{ whiteSpace: 'nowrap' }}>
                <b>{r.providerName}</b>
              </Text>
              <Group gap="sm" wrap="nowrap">
                <Badge size="sm" variant={color ? 'light' : 'default'} color={color}>
                  {dayLabel(t, r.daysLeft)}
                </Badge>
                <Text size="sm" c="dimmed">
                  {t('dashboard.runway.perDay', { amount: formatMoney(r.burnPerDay, r.currency) })}
                </Text>
                <Text size="sm" fw={600}>
                  {formatMoney(r.balance, r.currency)}
                </Text>
              </Group>
            </Group>
          );
        })}
      </Stack>
    </Card>
  );
}
