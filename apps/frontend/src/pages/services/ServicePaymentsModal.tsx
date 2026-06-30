import { Badge, Modal, Table, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { Service } from '@infra/shared';
import { usePayments } from '@/api/payments';
import { formatDateShort, formatMoney } from '@/utils/format';

// Read-only list of the payments tied to a single service (opened from the table receipt icon).
export function ServicePaymentsModal({
  service,
  onClose,
}: {
  service: Service | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const payments = usePayments(
    { serviceUuid: service?.uuid },
    { enabled: Boolean(service), pageSize: 100 },
  );
  const items = payments.data?.items ?? [];

  return (
    <Modal
      opened={!!service}
      onClose={onClose}
      title={t('services.paymentsTitle', { name: service?.name ?? '' })}
      size="xl"
    >
      {payments.isLoading ? (
        <Text c="dimmed" py="md" ta="center">
          {t('common.loading')}
        </Text>
      ) : items.length === 0 ? (
        <Text c="dimmed" py="md" ta="center">
          {t('services.paymentsEmpty')}
        </Text>
      ) : (
        <Table.ScrollContainer minWidth={620}>
          <Table verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ whiteSpace: 'nowrap' }}>
                  {t('services.paymentsColDate')}
                </Table.Th>
                <Table.Th style={{ whiteSpace: 'nowrap' }}>
                  {t('services.paymentsColType')}
                </Table.Th>
                <Table.Th style={{ whiteSpace: 'nowrap' }}>
                  {t('services.paymentsColAmount')}
                </Table.Th>
                <Table.Th>{t('services.paymentsColDescription')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((p) => (
                <Table.Tr key={p.uuid}>
                  <Table.Td style={{ whiteSpace: 'nowrap' }}>
                    {formatDateShort(p.paymentDate)}
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
                      {p.type === 'charge'
                        ? t('services.paymentCharge')
                        : t('services.paymentTopup')}
                    </Badge>
                  </Table.Td>
                  <Table.Td style={{ whiteSpace: 'nowrap' }}>
                    <Text fw={600}>{formatMoney(p.amount, p.currency)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" style={{ wordBreak: 'break-word' }}>
                      {p.description ?? t('common.none')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Modal>
  );
}
