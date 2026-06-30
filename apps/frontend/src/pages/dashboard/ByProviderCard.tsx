import { Card, Group, Pagination, Table, Text } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnalyticsSummary, Provider } from '@infra/shared';
import { ProviderIcon } from '@/components/ProviderIcon';
import { providerFavicon } from '@/utils/favicon';
import { formatMoney } from '@/utils/format';

const PROVIDER_PAGE_SIZE = 5;

interface ByProviderCardProps {
  providerRows: AnalyticsSummary['byProvider'];
  base: string;
  isLoading: boolean;
  providerOf: (uuid: string) => Provider | undefined;
}

export function ByProviderCard({ providerRows, base, isLoading, providerOf }: ByProviderCardProps) {
  const { t } = useTranslation();
  const rows = [...providerRows].sort((a, b) => Number(b.spent) - Number(a.spent));
  const [providerPage, setProviderPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(rows.length / PROVIDER_PAGE_SIZE));
  // Clamp in case the provider list shrank below the current page.
  const page = Math.min(providerPage, pageCount);
  const rowsPage = rows.slice((page - 1) * PROVIDER_PAGE_SIZE, page * PROVIDER_PAGE_SIZE);
  return (
    <Card withBorder radius="md" padding="lg">
      <Text fw={600} mb="md">
        {t('dashboard.byProvider.title')}
      </Text>
      {rows.length > 0 ? (
        <Table.ScrollContainer minWidth={560}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('dashboard.byProvider.colProvider')}</Table.Th>
                <Table.Th ta="end">{t('dashboard.byProvider.colServices')}</Table.Th>
                <Table.Th ta="end">{t('dashboard.byProvider.colMonthly', { base })}</Table.Th>
                <Table.Th ta="end">{t('dashboard.byProvider.colSpent', { base })}</Table.Th>
                <Table.Th ta="end">{t('dashboard.byProvider.colBalance')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rowsPage.map((p) => (
                <Table.Tr key={p.providerUuid}>
                  <Table.Td>
                    <Group gap={8} wrap="nowrap">
                      <ProviderIcon
                        name={p.name}
                        src={providerFavicon(
                          providerOf(p.providerUuid) ?? { faviconLink: null, loginUrl: null },
                        )}
                        size={18}
                      />
                      <Text size="sm" fw={500}>
                        {p.name}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td ta="end">{p.servicesCount}</Table.Td>
                  <Table.Td ta="end" style={{ whiteSpace: 'nowrap' }}>
                    {formatMoney(p.monthlyCost, base)}
                  </Table.Td>
                  <Table.Td ta="end" style={{ whiteSpace: 'nowrap' }}>
                    <Text size="sm" fw={600}>
                      {formatMoney(p.spent, base)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="end" style={{ whiteSpace: 'nowrap' }}>
                    {formatMoney(p.balance, p.balanceCurrency)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : (
        <Text c="dimmed" size="sm">
          {isLoading ? t('common.loading') : t('dashboard.empty.noProviders')}
        </Text>
      )}
      {rows.length > PROVIDER_PAGE_SIZE && (
        <Group justify="center" mt="md">
          <Pagination size="sm" total={pageCount} value={page} onChange={setProviderPage} />
        </Group>
      )}
    </Card>
  );
}
