import { ActionIcon, Badge, Group, Table, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Payment, Provider } from '@infra/shared';
import { EntityLabel } from '@/components/EntityLabel';
import { providerFavicon } from '@/utils/favicon';
import { formatDateShort, formatMoney } from '@/utils/format';

interface PaymentsTableProps {
  payments: Payment[];
  isLoading: boolean;
  total: number;
  providerOf: (uuid: string) => Provider | undefined;
  onDelete: (uuid: string) => void;
}

export function PaymentsTable({
  payments,
  isLoading,
  total,
  providerOf,
  onDelete,
}: PaymentsTableProps) {
  const { t } = useTranslation();
  return (
    <Table.ScrollContainer minWidth={720}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('payments.colDate')}</Table.Th>
            <Table.Th>{t('payments.colProvider')}</Table.Th>
            <Table.Th>{t('payments.colType')}</Table.Th>
            <Table.Th>{t('payments.colAmount')}</Table.Th>
            <Table.Th>{t('payments.colDescription')}</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {payments.map((p) => {
            const provider = providerOf(p.providerUuid);
            return (
              <Table.Tr key={p.uuid}>
                <Table.Td>{formatDateShort(p.paymentDate)}</Table.Td>
                <Table.Td>
                  <EntityLabel
                    name={provider?.name ?? ''}
                    src={providerFavicon(provider ?? { faviconLink: null, loginUrl: null })}
                  />
                </Table.Td>
                <Table.Td style={{ whiteSpace: 'nowrap' }}>
                  <Badge
                    variant={p.type === 'charge' ? 'default' : 'light'}
                    color={p.type === 'charge' ? 'gray' : 'teal'}
                    styles={{
                      root: { maxWidth: 'none', overflow: 'visible' },
                      label: { overflow: 'visible' },
                    }}
                  >
                    {p.type === 'charge' ? t('payments.typeCharge') : t('payments.typeTopup')}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text fw={600}>{formatMoney(p.amount, p.currency)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {p.description ?? t('common.none')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group justify="flex-end">
                    <ActionIcon variant="subtle" color="red" onClick={() => onDelete(p.uuid)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
          })}
          {!isLoading && total === 0 && (
            <Table.Tr>
              <Table.Td colSpan={6}>
                <Text c="dimmed" ta="center" py="md">
                  {t('payments.empty')}
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
