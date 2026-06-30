import { DonutChart } from '@mantine/charts';
import { Card, Group, SimpleGrid, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { AnalyticsSummary } from '@infra/shared';
import { ProviderIcon } from '@/components/ProviderIcon';
import { formatMoney } from '@/utils/format';
import { DONUT_COLORS } from './dashboardUtils';

interface ByProjectCardProps {
  projectRows: AnalyticsSummary['byProject'];
  base: string;
  isLoading: boolean;
  projectIconOf: (uuid: string) => string | null;
}

export function ByProjectCard({ projectRows, base, isLoading, projectIconOf }: ByProjectCardProps) {
  const { t } = useTranslation();
  const chartMoney = (v: number) => formatMoney(String(v), base);
  const rows = [...projectRows].sort((a, b) => Number(b.monthlyCost) - Number(a.monthlyCost));
  const projectDonut = rows
    .filter((p) => Number(p.monthlyCost) > 0)
    .map((p, i) => ({
      name: p.name,
      value: Number(p.monthlyCost),
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
  return (
    <Card withBorder radius="md" padding="lg">
      <Text fw={600} mb="md">
        {t('dashboard.byProject.title', { base })}
      </Text>
      {rows.length > 0 ? (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {projectDonut.length > 0 && (
            <Group justify="center">
              <DonutChart
                data={projectDonut}
                withTooltip
                size={180}
                thickness={28}
                strokeWidth={0}
                valueFormatter={chartMoney}
              />
            </Group>
          )}
          <Table verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('dashboard.byProject.colProject')}</Table.Th>
                <Table.Th ta="end">{t('dashboard.byProject.colServices')}</Table.Th>
                <Table.Th ta="end">{t('dashboard.byProject.colMonthly', { base })}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((p) => (
                <Table.Tr key={p.projectUuid}>
                  <Table.Td>
                    <Group gap={8} wrap="nowrap">
                      <ProviderIcon name={p.name} src={projectIconOf(p.projectUuid)} size={18} />
                      <Text size="sm" fw={500}>
                        {p.name}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td ta="end">{p.servicesCount}</Table.Td>
                  <Table.Td ta="end" style={{ whiteSpace: 'nowrap' }}>
                    <Text size="sm" fw={600}>
                      {formatMoney(p.monthlyCost, base)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </SimpleGrid>
      ) : (
        <Text c="dimmed" size="sm">
          {isLoading ? t('common.loading') : t('dashboard.empty.noServices')}
        </Text>
      )}
    </Card>
  );
}
