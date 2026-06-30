import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { AnalyticsSummary } from '@infra/shared';
import { formatDateShort, formatMoney } from '@/utils/format';
import { dayLabel, severityColor } from './dashboardUtils';

interface UpcomingBillingsCardProps {
  upcoming: AnalyticsSummary['upcomingBillings'];
}

export function UpcomingBillingsCard({ upcoming }: UpcomingBillingsCardProps) {
  const { t } = useTranslation();
  return (
    <Card withBorder radius="md" padding="lg">
      <Text fw={600} mb="md">
        {t('dashboard.upcoming.title')}
      </Text>
      {upcoming.length > 0 ? (
        <Stack gap="xs">
          {upcoming.map((ub) => {
            const color = severityColor(ub.severity);
            return (
              <Group key={ub.serviceUuid} justify="space-between" wrap="nowrap">
                <Text size="sm" c={color} style={{ whiteSpace: 'nowrap' }}>
                  {ub.providerName} — <b>{ub.name}</b>
                  {ub.covered === false && (
                    <Text span size="xs" c="red">
                      {t('dashboard.upcoming.insufficientBalance')}
                    </Text>
                  )}
                </Text>
                <Group gap="sm" wrap="nowrap">
                  <Badge size="sm" variant={color ? 'light' : 'default'} color={color}>
                    {dayLabel(t, ub.daysUntil)}
                  </Badge>
                  <Text size="sm" c="dimmed">
                    {formatDateShort(ub.nextBillingAt)}
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatMoney(ub.cost, ub.currency)}
                  </Text>
                </Group>
              </Group>
            );
          })}
        </Stack>
      ) : (
        <Text c="dimmed" size="sm">
          {t('dashboard.empty.noUpcoming')}
        </Text>
      )}
    </Card>
  );
}
